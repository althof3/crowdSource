'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Map as MapIcon, ExternalLink, Trophy } from 'lucide-react';

interface StepSuccessProps {
  txHash: string;
}

export const StepSuccess = ({ txHash }: StepSuccessProps) => {
  return (
    <div className="text-center py-8 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-green_verified/20 rounded-full flex items-center justify-center text-green_verified">
          <CheckCircle2 className="w-16 h-16" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold">Laporan Terkirim!</h2>
        <p className="text-gray-400">
          Laporan Anda telah berhasil disimpan di blockchain Solana. 
          Pemerintah/organisasi sekarang dapat melihat dan memvalidasi laporan Anda.
        </p>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Solana Transaction Hash</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm font-mono text-accent truncate max-w-[240px]">{txHash}</p>
          <a 
            href={`https://solscan.io/tx/${txHash}?cluster=devnet`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold transition-all hover:scale-[1.02]"
        >
          <MapIcon className="w-5 h-5" />
          Lihat di Map
        </Link>
        <Link
          href="/leaderboard"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
        >
          <Trophy className="w-5 h-5 text-accent" />
          Lihat Ranking
        </Link>
      </div>
    </div>
  );
};
