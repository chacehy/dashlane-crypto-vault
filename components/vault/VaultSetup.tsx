'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useVault } from '@/context/VaultContext';

interface VaultSetupProps {
    onSuccess?: () => void;
}

export function VaultSetup({ onSuccess }: VaultSetupProps) {
    const { initializeVault } = useVault();
    const [masterPassword, setMasterPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInitialize = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await initializeVault(masterPassword);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen premium-gradient flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-md p-8"
            >
                <h2 className="text-2xl font-bold mb-2">Setup Your Vault</h2>
                <p className="text-gray-400 text-sm mb-6">Create a Master Password. This is the ONLY way to access your data. We never store this.</p>

                <form onSubmit={handleInitialize} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Master Password</label>
                        <input
                            type="password"
                            className="input-field w-full"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button className="button-primary w-full" disabled={loading}>
                        {loading ? 'Initializing...' : 'Create Vault'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
