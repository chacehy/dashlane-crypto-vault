'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, X, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useVault } from '@/context/VaultContext';

interface ShareModalProps {
    item: any;
    onClose: () => void;
}

export function ShareModal({ item, onClose }: ShareModalProps) {
    const { shareVaultItem } = useVault();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await shareVaultItem(item.id, email);
            setSuccess(true);
            setTimeout(onClose, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to share item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
                        <Share2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Share Password</h2>
                        <p className="text-sm text-gray-400">Securely share "{item.data?.name}"</p>
                    </div>
                </div>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 size={48} className="text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Item Shared!</h3>
                        <p className="text-gray-400">Recipient will see this in their "Shared with me" section.</p>
                    </div>
                ) : (
                    <form onSubmit={handleShare} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recipient Email</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="email"
                                    className="input-field w-full pl-10"
                                    placeholder="Enter their email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="button-primary w-full"
                                disabled={loading}
                            >
                                {loading ? 'Encrypting & Sharing...' : 'Share Securely'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-[11px] text-gray-500 text-center leading-tight">
                        Sharing uses RSA-2048 encryption. Only the recipient can decrypt this item using their private key. The server never sees the plaintext.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
