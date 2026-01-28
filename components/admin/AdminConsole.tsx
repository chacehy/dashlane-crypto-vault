'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Activity, ShieldAlert, UserPlus, Search, Filter, ArrowUpRight, ExternalLink } from 'lucide-react';

export const AdminConsole: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<'departments' | 'logs'>('departments');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                        <Building2 className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Enterprise Admin Console</h2>
                        <p className="text-blue-200/70 text-sm">Managing 4 Departments • 28 Active Directors</p>
                    </div>
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all text-sm flex items-center gap-2">
                    <UserPlus size={16} />
                    Invite Director
                </button>
            </div>

            {/* Sub Navigation */}
            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveSubTab('departments')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeSubTab === 'departments' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Departments
                    {activeSubTab === 'departments' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
                </button>
                <button
                    onClick={() => setActiveSubTab('logs')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeSubTab === 'logs' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Activity Logs
                    {activeSubTab === 'logs' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
                </button>
            </div>

            {/* Content */}
            {activeSubTab === 'departments' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DepartmentCard
                        name="Finance & Accounting"
                        director="Sarah Chen"
                        members={12}
                        lastActivity="2 mins ago"
                        status="Secure"
                    />
                    <DepartmentCard
                        name="Engineering"
                        director="Marc Andre"
                        members={45}
                        lastActivity="1 hour ago"
                        status="Secure"
                    />
                    <DepartmentCard
                        name="Human Resources"
                        director="Elena Rodriguez"
                        members={8}
                        lastActivity="Just now"
                        status="Warning"
                    />
                    <DepartmentCard
                        name="Executive Board"
                        director="CEO"
                        members={5}
                        lastActivity="Yesterday"
                        status="Secure"
                    />
                </div>
            ) : (
                <div className="glass-panel overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <LogEntry event="Vault Item Created" dept="Engineering" user="m.andre" time="2 mins ago" />
                            <LogEntry event="Share Access Revoked" dept="Finance" user="s.chen" time="15 mins ago" severity="warning" />
                            <LogEntry event="New Member Invited" dept="HR" user="e.rodriguez" time="1 hour ago" />
                            <LogEntry event="Login Attempt Blocked" dept="External" user="unauthorized" time="3 hours ago" severity="danger" />
                            <LogEntry event="Vault Exported" dept="Finance" user="s.chen" time="5 hours ago" severity="warning" />
                            <LogEntry event="Security Policy Updated" dept="Global" user="System" time="12 hours ago" />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const DepartmentCard = ({ name, director, members, lastActivity, status }: any) => (
    <div className="glass-panel p-6 hover:border-blue-500/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{name}</h3>
                <p className="text-xs text-gray-500 mt-1">Managed by {director}</p>
            </div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status === 'Secure' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {status}
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 my-4">
            <div>
                <span className="block text-[10px] text-gray-500 uppercase font-bold">Members</span>
                <span className="text-xl font-bold">{members}</span>
            </div>
            <div>
                <span className="block text-[10px] text-gray-500 uppercase font-bold">Last Activity</span>
                <span className="text-sm font-medium text-gray-300">{lastActivity}</span>
            </div>
        </div>
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
            Manage Permissions <ArrowUpRight size={14} />
        </button>
    </div>
);

const LogEntry = ({ event, dept, user, time, severity = 'default' }: any) => (
    <tr className="hover:bg-white/[0.02] transition-colors group">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                {severity === 'danger' ? <ShieldAlert size={14} className="text-red-500" /> : <Activity size={14} className="text-blue-400" />}
                <span className={`text-sm font-medium ${severity === 'danger' ? 'text-red-400' : severity === 'warning' ? 'text-yellow-400' : 'text-gray-200'}`}>{event}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-400 font-medium">{dept}</td>
        <td className="px-6 py-4 text-sm text-gray-400">{user}</td>
        <td className="px-6 py-4 text-sm text-gray-500">{time}</td>
        <td className="px-6 py-4">
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                <ExternalLink size={14} />
            </button>
        </td>
    </tr>
);
