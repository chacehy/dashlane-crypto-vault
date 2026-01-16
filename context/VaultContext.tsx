'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase, type Profile, type VaultItem } from '@/lib/supabase';
import {
    deriveKEK,
    decryptMK,
    encrypt,
    decrypt,
    generateMasterKey,
    generateRandomValues,
    encryptMK,
    generateAsymmetricKeyPair,
    exportPublicKey,
    exportPrivateKey,
    importPrivateKey,
    importPublicKey,
    asymmetricEncrypt,
    asymmetricDecrypt,
    uint8ToB64,
    b64ToUint8
} from '@/lib/crypto';

interface VaultContextType {
    isUnlocked: boolean;
    isInitializing: boolean;
    unlock: (password: string) => Promise<void>;
    lock: () => void;
    initializeVault: (password: string) => Promise<void>;
    addVaultItem: (data: any) => Promise<void>;
    getVaultItems: () => Promise<any[]>;
    shareVaultItem: (itemId: string, recipientEmail: string) => Promise<void>;
    getSharedItems: () => Promise<any[]>;
    profile: Profile | null;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
    const [mk, setMk] = useState<Uint8Array | null>(null);
    const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Load profile on mount
    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        }
        loadProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                lock();
                setProfile(null);
            } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                loadProfile();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const lock = useCallback(() => {
        setMk(null);
        setPrivateKey(null);
    }, []);

    const unlock = async (password: string) => {
        if (!profile) throw new Error('No vault profile found');

        const kek = await deriveKEK(password, profile.salt_kek);
        const decryptedMk = await decryptMK(profile.encrypted_mk, kek, profile.mk_nonce);

        // In-memory only
        setMk(decryptedMk);

        // Load private key if it exists
        if (profile.encrypted_private_key && profile.pk_nonce) {
            try {
                const pk = await importPrivateKey(profile.encrypted_private_key, kek, profile.pk_nonce);
                setPrivateKey(pk);
            } catch (e) {
                console.error('Failed to import private key', e);
            }
        }
    };

    const initializeVault = async (password: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const saltAuth = generateRandomValues(16);
        const saltKek = generateRandomValues(16);
        const newMk = generateMasterKey();

        const kek = await deriveKEK(password, saltKek);
        const { ciphertext: encrypted_mk, nonce: mk_nonce } = await encryptMK(newMk, kek);

        // Generate Asymmetric Key Pair for sharing
        const keyPair = await generateAsymmetricKeyPair();
        const public_key = await exportPublicKey(keyPair.publicKey);
        const { ciphertext: encrypted_private_key, nonce: pk_nonce } = await exportPrivateKey(keyPair.privateKey, kek);

        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                salt_auth: saltAuth,
                salt_kek: saltKek,
                encrypted_mk,
                mk_nonce,
                public_key,
                encrypted_private_key,
                pk_nonce,
            })
            .select()
            .single();

        if (error) throw error;

        setProfile(data);
        setMk(newMk);
        setPrivateKey(keyPair.privateKey);
    };

    const addVaultItem = async (data: any) => {
        if (!mk) throw new Error('Vault is locked');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const plaintext = JSON.stringify(data);
        const { ciphertext, nonce } = await encrypt(plaintext, mk);

        const { error } = await supabase
            .from('vault_items')
            .insert({
                user_id: user.id,
                ciphertext,
                nonce,
            });

        if (error) throw error;
    };

    const getVaultItems = async () => {
        if (!mk) throw new Error('Vault is locked');

        const { data, error } = await supabase
            .from('vault_items')
            .select('*');

        if (error) throw error;

        const decryptedItems = await Promise.all(
            data.map(async (item: VaultItem) => {
                try {
                    const decryptedStr = await decrypt(item.ciphertext, mk, item.nonce);
                    return {
                        ...item,
                        data: JSON.parse(decryptedStr),
                    };
                } catch (e) {
                    console.error('Failed to decrypt item', item.id, e);
                    return { ...item, data: null, error: 'Decryption failed' };
                }
            })
        );

        return decryptedItems;
    };

    const shareVaultItem = async (itemId: string, recipientEmail: string) => {
        if (!mk) throw new Error('Vault is locked');

        // 1. Find recipient's public key
        const { data: recipient, error: recError } = await supabase
            .from('profiles')
            .select('id, public_key')
            .eq('email', recipientEmail)
            .single();

        if (recError || !recipient?.public_key) throw new Error('Recipient not found or hasn\'t enabled sharing');

        // 2. Load the item to share
        const { data: item, error: itemError } = await supabase
            .from('vault_items')
            .select('*')
            .eq('id', itemId)
            .single();

        if (itemError) throw itemError;

        // 3. Decrypt locally to get plaintext
        const plaintext = await decrypt(item.ciphertext, mk, item.nonce);

        // 4. Generate a one-time sharing key (AES)
        const sharingKeyBytes = generateMasterKey();
        const { ciphertext: encryptedData, nonce: sharingNonce } = await encrypt(plaintext, sharingKeyBytes);

        // 5. Encrypt the sharing key with recipient's public key
        const recipientPubKey = await importPublicKey(recipient.public_key);
        const encryptedKeyBytes = await asymmetricEncrypt(sharingKeyBytes, recipientPubKey);
        const encryptedKeyB64 = uint8ToB64(encryptedKeyBytes);

        // 6. Store in shared_items
        const { error: shareError } = await supabase
            .from('shared_items')
            .insert({
                sender_id: profile?.id,
                recipient_id: recipient.id,
                encrypted_data: encryptedData,
                encrypted_key: encryptedKeyB64,
                nonce: sharingNonce,
            });

        if (shareError) throw shareError;
    };

    const getSharedItems = async () => {
        if (!privateKey) throw new Error('Vault is locked or sharing keys not initialized');

        const { data, error } = await supabase
            .from('shared_items')
            .select('*')
            .eq('recipient_id', profile?.id);

        if (error) throw error;

        const decryptedItems = await Promise.all(
            data.map(async (item: any) => {
                try {
                    // 1. Decrypt the sharing key using our private key
                    const encryptedKeyBytes = b64ToUint8(item.encrypted_key);
                    const sharingKeyBytes = await asymmetricDecrypt(encryptedKeyBytes, privateKey);

                    // 2. Decrypt the data using the sharing key
                    const decryptedStr = await decrypt(item.encrypted_data, sharingKeyBytes, item.nonce);
                    return {
                        ...item,
                        data: JSON.parse(decryptedStr),
                    };
                } catch (e) {
                    console.error('Failed to decrypt shared item', item.id, e);
                    return { ...item, data: null, error: 'Decryption failed' };
                }
            })
        );

        return decryptedItems;
    };

    return (
        <VaultContext.Provider
            value={{
                isUnlocked: !!mk,
                isInitializing: !profile && !loading,
                unlock,
                lock,
                initializeVault,
                addVaultItem,
                getVaultItems,
                shareVaultItem,
                getSharedItems,
                profile,
            }}
        >
            {children}
        </VaultContext.Provider>
    );
}

export function useVault() {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
}
