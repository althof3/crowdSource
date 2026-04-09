'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, LogOut, Wallet } from 'lucide-react';

export const WalletButton = () => {
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>({
    user_metadata: {
      wallet: 'vS123...xyz'
    }
  });

  const handleSignIn = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      user_metadata: {
        wallet: 'vS123...xyz'
      }
    });
    setLoading(false);
  };

  const handleLogout = async () => {
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
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</span>
          <span className="text-xs text-green_verified flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green_verified animate-pulse" />
            Terhubung
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Wallet</span>
          <span className="text-sm font-mono text-white mt-0.5">{user.user_metadata.wallet}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    );
  }

  if (connected) {
    return (
      <button
        onClick={handleSignIn}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
      >
        <Wallet className="h-3.5 w-3.5" />
        Sign in to App
      </button>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
    >
      <Wallet className="h-3.5 w-3.5" />
      Connect Wallet
    </button>
  );
};
