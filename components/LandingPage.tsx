'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Users, Zap, CheckCircle2, Globe, ArrowRight } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="bg-[#0a0a0b] text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 flex flex-col items-center text-center px-4">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] -z-10" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8"
                >
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Enterprise-Grade Zero Knowledge</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                >
                    The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Secure Vaults</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
                >
                    Protect your organization's secrets with end-to-end encryption.
                    Designed for departments, built for directors, trusted by teams.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        Start Free Trial
                        <ArrowRight size={20} />
                    </button>
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all">
                        Watch Demo
                    </button>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 py-24 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <FeatureCard
                        icon={<Shield className="text-blue-400" size={32} />}
                        title="Zero Knowledge"
                        description="We never see your passwords. Encryption happens entirely on your device using keys only you hold."
                    />
                    <FeatureCard
                        icon={<Users className="text-purple-400" size={32} />}
                        title="Department Ready"
                        description="Delegate control to department directors. Scale from small teams to entire government agencies."
                    />
                    <FeatureCard
                        icon={<Zap className="text-yellow-400" size={32} />}
                        title="Real-time Auditing"
                        description="Complete activity logs for compliance. Know exactly when and where your secrets are accessed."
                    />
                </div>
            </section>

            {/* Pricing Section (Targeting CEO's $ request) */}
            <section className="py-24 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Transparent Pricing</h2>
                    <p className="text-gray-400 mb-16">All plans are billed in USD ($) globally.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PricingCard
                            tier="Personal"
                            price="0"
                            features={["1 User", "Unlimited Passwords", "Basic Shared Items"]}
                        />
                        <PricingCard
                            tier="Business"
                            price="12"
                            popular
                            features={["Up to 50 Users", "Department Management", "Admin Console", "Activity Logs"]}
                        />
                        <PricingCard
                            tier="Enterprise"
                            price="49"
                            features={["Unlimited Departments", "SSO Integration", "Dedicated Support", "Full Audit History"]}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
        <div className="mb-6 transform group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const PricingCard = ({ tier, price, features, popular = false }: { tier: string; price: string; features: string[]; popular?: boolean }) => (
    <div className={`p-8 rounded-3xl border ${popular ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-white/5'} flex flex-col text-left relative overflow-hidden`}>
        {popular && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                Popular
            </div>
        )}
        <h4 className="text-xl font-bold mb-2">{tier}</h4>
        <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-bold">${price}</span>
            <span className="text-gray-400">/user/mo</span>
        </div>
        <ul className="space-y-4 mb-10 flex-grow">
            {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-blue-500" />
                    {f}
                </li>
            ))}
        </ul>
        <button className={`w-full py-4 rounded-xl font-bold transition-all ${popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
            Choose {tier}
        </button>
    </div>
);
