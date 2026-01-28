'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useVault } from '@/context/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/vault/Navbar';
import { AuthForm } from '@/components/vault/AuthForm';
import { VaultSetup } from '@/components/vault/VaultSetup';
import { VaultUnlock } from '@/components/vault/VaultUnlock';
import { VaultItemCard } from '@/components/vault/VaultItemCard';
import { AddVaultItemModal } from '@/components/vault/AddVaultItemModal';
import { ShareModal } from '@/components/vault/ShareModal';
import { Share2, Lock, Plus, Users, Shield, LayoutDashboard, Activity } from 'lucide-react';
import { SecurityDashboard } from '@/components/vault/SecurityDashboard';
import { AdminConsole } from '@/components/admin/AdminConsole';

import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const {
    isUnlocked,
    isInitializing,
    lock,
    addVaultItem,
    getVaultItems,
    getSharedItems,
    profile
  } = useVault();

  const [session, setSession] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'shared' | 'security' | 'admin'>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sharingItem, setSharingItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      loadItems();
      loadSharedItems();
    }
  }, [isUnlocked]);

  const loadSharedItems = async () => {
    try {
      const data = await getSharedItems();
      setSharedItems(data);
    } catch (e) {
      console.error('Failed to load shared items', e);
    }
  };

  const loadItems = async () => {
    try {
      const data = await getVaultItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (newItem: any) => {
    setLoading(true);
    try {
      await addVaultItem(newItem);
      setShowAddModal(false);
      loadItems();
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!session) {
    if (showAuth) {
      return (
        <div className="min-h-screen premium-gradient flex items-center justify-center p-4">
          <div className="absolute top-8 left-8">
            <button
              onClick={() => setShowAuth(false)}
              className="text-white/60 hover:text-white flex items-center gap-2 transition-colors"
            >
              ← Back to site
            </button>
          </div>
          <AuthForm />
        </div>
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  if (isInitializing) {
    return <VaultSetup />;
  }

  if (!isUnlocked) {
    return <VaultUnlock />;
  }

  const filteredItems = items.filter(item =>
    item.data?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.data?.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <Navbar
        email={session?.user?.email}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLock={lock}
      />

      <main className="max-w-6xl mx-auto p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Vault</h1>
            <p className="text-gray-400">Manage your secure accounts and shared secrets</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'personal' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <Lock size={16} />
                <span className="text-sm font-medium">Personal</span>
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'shared' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <Users size={16} />
                <span className="text-sm font-medium">Shared</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <Shield size={16} />
                <span className="text-sm font-medium">Security</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <LayoutDashboard size={16} />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>

            {activeTab === 'personal' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="button-primary flex items-center space-x-2 shadow-lg shadow-blue-500/20"
              >
                <Plus size={18} />
                <span>Add Password</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'personal' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <VaultItemCard
                    key={item.id}
                    item={item}
                    onCopy={copyToClipboard}
                    onShare={setSharingItem}
                  />
                ))}
              </AnimatePresence>
            </div>

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-600">
                  <Lock size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">No passwords yet</h3>
                <p className="text-gray-400 max-w-xs mx-auto mb-8">
                  Your vault is currently empty. Start by adding your first secure account.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="button-secondary flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </>
        ) : activeTab === 'security' ? (
          <SecurityDashboard items={items} />
        ) : activeTab === 'admin' ? (
          <AdminConsole />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {sharedItems.filter(item =>
                  item.data?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((item) => (
                  <VaultItemCard key={item.id} item={item} onCopy={copyToClipboard} />
                ))}
              </AnimatePresence>
            </div>

            {sharedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-600">
                  <Users size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">No shared items</h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  Items shared with you by other users will appear here.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {
        showAddModal && (
          <AddVaultItemModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddItem}
            loading={loading}
          />
        )
      }

      {
        sharingItem && (
          <ShareModal
            item={sharingItem}
            onClose={() => setSharingItem(null)}
          />
        )
      }
    </div >
  );
}
