'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { supabase } from '@/lib/supabase';
import { Loader2, LogOut, Wallet } from 'lucide-react';

export const WalletButton = () => {
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleSignIn = async () => {
    if (!publicKey || !signMessage) return;

    try {
      setLoading(true);
      
      // 1. Get nonce from Supabase Edge Function
      const { data: nonceData, error: nonceError } = await supabase.functions.invoke('get-nonce', {
        body: { wallet: publicKey.toBase58() },
      });

      if (nonceError) throw nonceError;
      const { nonce } = nonceData;

      // 2. Sign message
      const message = `Sign in to CrowdRadar\nNonce: ${nonce}\nDomain: crowdradar.id`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      // 3. Auth with wallet-auth Edge Function
      const { data: authData, error: authError } = await supabase.functions.invoke('wallet-auth', {
        body: {
          publicKey: publicKey.toBase58(),
          signature: Array.from(signature),
          message,
          nonce,
        },
      });

      if (authError) throw authError;

      // 4. Set Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      });

      if (sessionError) throw sessionError;
      
      setUser(authData.user);
    } catch (err) {
      console.error('Sign in error:', err);
      alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await disconnect();
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <button disabled className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-lg border border-accent/30 text-accent">
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-gray-400">Connected</span>
          <span className="text-sm font-mono">{user.user_metadata.wallet.slice(0, 4)}...{user.user_metadata.wallet.slice(-4)}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  if (connected) {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg text-white font-medium transition-colors"
      >
        <Wallet className="w-4 h-4" />
        Sign in to App
      </button>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="flex items-center gap-2 bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg text-white font-medium transition-colors"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
};
