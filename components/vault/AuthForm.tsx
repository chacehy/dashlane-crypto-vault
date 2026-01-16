'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthFormProps {
    onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
    const [view, setView] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (view === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Check your email for confirmation!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
            onSuccess?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel w-full max-w-md p-8 shadow-2xl"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                    <ShieldCheck size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold">Dashlane Vault</h1>
                <p className="text-gray-400 text-sm mt-1">Zero-knowledge password security</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">Email Address</label>
                    <input
                        type="email"
                        className="input-field w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">Password</label>
                    <input
                        type="password"
                        className="input-field w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                <button type="submit" className="button-primary w-full mt-2" disabled={loading}>
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="mr-2"
                            >
                                <Settings size={16} />
                            </motion.span>
                            Processing...
                        </span>
                    ) : view === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <button
                    onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    {view === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>
        </motion.div>
    );
}
