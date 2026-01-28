'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface SecurityDashboardProps {
    items: any[];
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ items }) => {
    const stats = useMemo(() => {
        const total = items.length;
        let weak = 0;
        const reusedMap = new Map<string, number>();

        items.forEach(item => {
            const password = item.data?.password || '';
            if (password.length < 10) weak++;

            if (password) {
                reusedMap.set(password, (reusedMap.get(password) || 0) + 1);
            }
        });

        let reused = 0;
        reusedMap.forEach(count => {
            if (count > 1) reused += count;
        });

        // Simple health score formula
        let score = 100;
        if (total > 0) {
            score -= (weak / total) * 40;
            score -= (reused / total) * 30;
        } else {
            score = 0;
        }

        return {
            total,
            weak,
            reused,
            score: Math.max(0, Math.round(score))
        };
    }, [items]);

    const getScoreColor = (score: number) => {
        if (score > 80) return 'text-green-500';
        if (score > 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="glass-panel p-8 flex flex-col items-center justify-center text-center col-span-1 md:col-span-1">
                    <div className="relative w-32 h-32 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                className="text-white/5"
                                strokeDasharray="100, 100"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <motion.path
                                initial={{ strokeDasharray: "0, 100" }}
                                animate={{ strokeDasharray: `${stats.score}, 100` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={getScoreColor(stats.score)}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${getScoreColor(stats.score)}`}>{stats.score}%</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Health</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold">Security Score</h3>
                    <p className="text-gray-400 text-sm mt-2">Based on your password strength and reuse across {stats.total} accounts.</p>
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard
                        icon={<AlertTriangle size={24} className="text-yellow-500" />}
                        label="Weak Passwords"
                        value={stats.weak}
                        description="Passwords shorter than 10 characters."
                        severity={stats.weak > 0 ? 'warning' : 'good'}
                    />
                    <StatCard
                        icon={<RefreshCw size={24} className="text-orange-500" />}
                        label="Reused Passwords"
                        value={stats.reused}
                        description="Accounts sharing the same password."
                        severity={stats.reused > 0 ? 'danger' : 'good'}
                    />
                    <StatCard
                        icon={<Shield size={24} className="text-blue-500" />}
                        label="Total Accounts"
                        value={stats.total}
                        description="Total items stored in your vault."
                    />
                    <StatCard
                        icon={<CheckCircle size={24} className="text-green-500" />}
                        label="Safe Passwords"
                        value={stats.total - stats.weak - stats.reused}
                        description="Accounts meeting security standards."
                        severity="good"
                    />
                </div>
            </div>

            {/* Recommendations */}
            <div className="glass-panel p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Info size={20} className="text-blue-400" />
                    <h3 className="text-lg font-bold">Security Recommendations</h3>
                </div>
                <div className="space-y-4">
                    {stats.weak > 0 && (
                        <RecommendationItem
                            title="Update Weak Passwords"
                            description={`You have ${stats.weak} passwords that are too short. Aim for at least 12 characters.`}
                            action="Fix Now"
                        />
                    )}
                    {stats.reused > 0 && (
                        <RecommendationItem
                            title="Change Reused Passwords"
                            description={`Using the same password across ${stats.reused} accounts is risky. unique passwords prevent credential stuffing.`}
                            action="Review"
                        />
                    )}
                    {stats.score === 100 && (
                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-2xl bg-green-500/5">
                            <div className="text-center">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="text-xl font-bold">Your Vault is Secure!</h4>
                                <p className="text-gray-400 mt-1">Excellent work maintaining high security standards.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, description, severity }: { icon: any; label: string; value: number; description: string; severity?: 'good' | 'warning' | 'danger' }) => (
    <div className="glass-panel p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
            <span className="text-2xl font-bold">{value}</span>
        </div>
        <h4 className="font-bold text-gray-200">{label}</h4>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
        {severity === 'danger' && value > 0 && <div className="mt-4 h-1 w-full bg-red-500/20 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-full" /></div>}
        {severity === 'warning' && value > 0 && <div className="mt-4 h-1 w-full bg-yellow-500/20 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 w-2/3" /></div>}
    </div>
);

const RecommendationItem = ({ title, description, action }: { title: string; description: string; action: string }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex-grow">
            <h5 className="font-bold text-sm">{title}</h5>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg transition-colors">
            {action}
        </button>
    </div>
);
