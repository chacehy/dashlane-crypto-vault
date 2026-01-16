'use client';

import React from 'react';
import { Search, Lock, LogOut, ShieldCheck, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
    email?: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onLock: () => void;
}

export function Navbar({ email, searchQuery, setSearchQuery, onLock }: NavbarProps) {
    return (
        <nav className="border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <span className="font-bold tracking-tight">Vault</span>
                </div>

                <div className="flex-1 max-w-md mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search passwords..."
                            className="input-field w-full pl-10 h-10 py-0 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <User size={14} />
                        <span>{email?.split('@')[0] || 'User'}</span>
                    </div>
                    <button
                        onClick={onLock}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                        title="Lock Vault"
                    >
                        <Lock size={18} />
                    </button>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
