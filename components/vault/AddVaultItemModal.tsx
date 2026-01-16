'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye } from 'lucide-react';

interface AddVaultItemModalProps {
    onClose: () => void;
    onAdd: (item: any) => Promise<void>;
    loading: boolean;
}

export function AddVaultItemModal({ onClose, onAdd, loading }: AddVaultItemModalProps) {
    const [newItem, setNewItem] = useState({ name: '', url: '', username: '', password: '' });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await onAdd(newItem);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-lg p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>

                <h2 className="text-2xl font-bold mb-6">Add Password</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Account Name</label>
                            <input
                                className="input-field w-full text-sm"
                                placeholder="e.g. Gmail"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Website URL</label>
                            <input
                                className="input-field w-full text-sm"
                                placeholder="e.g. google.com"
                                value={newItem.url}
                                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Username / Email</label>
                        <input
                            className="input-field w-full text-sm"
                            value={newItem.username}
                            onChange={(e) => setNewItem({ ...newItem, username: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="input-field w-full text-sm"
                                value={newItem.password}
                                onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                                required
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <Eye size={16} />
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="pt-4 flex space-x-3">
                        <button type="button" onClick={onClose} className="button-secondary flex-1">Cancel</button>
                        <button type="submit" className="button-primary flex-1" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Password'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
