'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Key, ExternalLink, Copy, Share2 } from 'lucide-react';

interface VaultItemCardProps {
    item: any;
    onCopy: (text: string) => void;
    onShare?: (item: any) => void;
}

export function VaultItemCard({ item, onCopy, onShare }: VaultItemCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-6 hover:shadow-xl hover:border-white/20 transition-all group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        {item.data?.url ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${item.data.url}&sz=64`}
                                className="w-6 h-6 rounded-sm opacity-80"
                                alt=""
                            />
                        ) : (
                            <Key size={20} className="text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold">{item.data?.name || 'Untitled'}</h3>
                        <p className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{item.data?.url || 'No URL'}</p>
                    </div>
                </div>
                <a href={item.data?.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white mt-1">
                    <ExternalLink size={16} />
                </a>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm bg-black/20 p-2 rounded-lg border border-white/5">
                    <span className="text-gray-400">Username</span>
                    <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.data?.username}</span>
                        <button
                            onClick={() => onCopy(item.data?.username)}
                            className="text-gray-500 hover:text-blue-400"
                            title="Copy Username"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm bg-black/20 p-2 rounded-lg border border-white/5">
                    <span className="text-gray-400">Password</span>
                    <div className="flex items-center space-x-2">
                        <span className="font-medium tracking-widest text-xs">••••••••</span>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => onCopy(item.data?.password)}
                                className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                                title="Copy Password"
                            >
                                <Copy size={14} />
                            </button>
                            {onShare && (
                                <button
                                    onClick={() => onShare(item)}
                                    className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-400/10 rounded-md transition-colors"
                                    title="Share Item"
                                >
                                    <Share2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
