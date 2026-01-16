import { createClient } from '@supabase/supabase-js';

export type Profile = {
    id: string;
    email: string;
    salt_auth: string;
    salt_kek: string;
    encrypted_mk: string;
    mk_nonce: string;
    public_key?: string;
    encrypted_private_key?: string;
    pk_nonce?: string;
    created_at: string;
};

export type VaultItem = {
    id: string;
    user_id: string;
    ciphertext: string;
    nonce: string;
    created_at: string;
    updated_at: string;
};

export type SharedItem = {
    id: string;
    sender_id: string;
    recipient_id: string;
    encrypted_data: string;
    encrypted_key: string;
    nonce: string;
    created_at: string;
};

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
