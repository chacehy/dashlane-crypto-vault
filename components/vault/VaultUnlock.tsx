'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useVault } from '@/context/VaultContext';
import { supabase } from '@/lib/supabase';

interface VaultUnlockProps {
    onSuccess?: () => void;
}

export function VaultUnlock({ onSuccess }: VaultUnlockProps) {
    const { unlock } = useVault();
    const [masterPassword, setMasterPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await unlock(masterPassword);
            onSuccess?.();
        } catch (err: any) {
            setError('Invalid master password or vault error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen premium-gradient flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-md p-8 text-center"
            >
                <div className="mb-6 inline-flex p-4 bg-yellow-500/10 rounded-full text-yellow-500">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Vault is Locked</h2>
                <p className="text-gray-400 text-sm mb-6">Enter your Master Password to unlock your data.</p>

                <form onSubmit={handleUnlock} className="space-y-4 text-left">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Master Password</label>
                        <input
                            type="password"
                            className="input-field w-full"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button className="button-primary w-full" disabled={loading}>
                        {loading ? 'Unlocking...' : 'Unlock'}
                    </button>
                </form>
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="mt-4 text-sm text-gray-500 hover:text-white transition-colors"
                >
                    Sign Out
                </button>
            </motion.div>
        </div>
    );
}
