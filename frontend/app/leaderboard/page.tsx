'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { supabase, Profile } from '@/lib/supabase';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalVerified: 0,
    totalSOL: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesRes, reportsRes, confirmedRes] = await Promise.all([
          supabase.from('profiles').select('*').order('reputation', { ascending: false }).limit(20),
          supabase.from('reports').select('count', { count: 'exact' }),
          supabase.from('reports').select('count', { count: 'exact' }).eq('status', 'confirmed')
        ]);

        if (profilesRes.data) setProfiles(profilesRes.data);
        setStats({
          totalReports: reportsRes.count || 0,
          totalVerified: confirmedRes.count || 0,
          totalSOL: 125.5 // Mock total SOL distributed
        });
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const wallet = user?.user_metadata?.wallet as string | undefined;
      if (!wallet) return;
      const { data } = await supabase.from('profiles').select('*').eq('wallet', wallet).single();
      if (data) setMe(data);
    };
    fetchMe();
  }, []);

  const badgeColor = (label: string) => {
    if (label === 'City Hero') return 'yellow';
    if (label === 'Guardian') return 'blue';
    return 'green';
  };

  const getTier = (reputation: number) => {
    if (reputation >= 1000) return { label: 'City Hero', color: badgeColor('City Hero') };
    if (reputation >= 500) return { label: 'Guardian', color: badgeColor('Guardian') };
    return { label: 'Watcher', color: badgeColor('Watcher') };
  };

  const tierPill = (label: string, color: string) => {
    const classes =
      color === 'yellow'
        ? 'bg-yellow-500/20 text-yellow-400'
        : color === 'blue'
          ? 'bg-accent/20 text-accent'
          : 'bg-green_verified/20 text-green_verified';
    return <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-semibold', classes)}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-lg font-semibold">Leaderboard</div>
          <div className="text-sm text-slate-400">Top kontributor · Jakarta · Maret 2026</div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-xl border border-white/10 bg-card p-4">
            <div className="text-[11px] text-slate-400">Total Laporan</div>
            <div className="mt-1 text-2xl font-semibold text-white">{stats.totalReports.toLocaleString('id-ID')}</div>
            <div className="mt-1 text-[11px] text-slate-400">Bulan ini</div>
          </div>
          <div className="flex-1 rounded-xl border border-white/10 bg-card p-4">
            <div className="text-[11px] text-slate-400">Verified</div>
            <div className="mt-1 text-2xl font-semibold text-white">{stats.totalVerified.toLocaleString('id-ID')}</div>
            <div className="mt-1 text-[11px] text-slate-400">
              {stats.totalReports > 0 ? Math.round((stats.totalVerified / stats.totalReports) * 100) : 0}%
            </div>
          </div>
          <div className="flex-1 rounded-xl border border-white/10 bg-card p-4">
            <div className="text-[11px] text-slate-400">SOL Out</div>
            <div className="mt-1 text-2xl font-semibold text-white">{stats.totalSOL}</div>
            <div className="mt-1 text-[11px] text-slate-400">distributed</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-card">
          <div className="grid grid-cols-[28px_1fr_64px_70px_70px] gap-2 border-b border-white/10 px-4 py-3 text-[11px] text-slate-400">
            <div>#</div>
            <div>Wallet</div>
            <div className="text-right">Laporan</div>
            <div className="text-right">Verified</div>
            <div className="text-right">SOL</div>
          </div>
          {profiles.map((p, idx) => {
            const reportsCount = Math.max(1, Math.floor(p.reputation / 20));
            const verifiedCount = Math.max(0, Math.floor(reportsCount * 0.8));
            const sol = (verifiedCount * 0.0037).toFixed(3);
            const { label, color } = getTier(p.reputation);
            return (
              <div
                key={p.id}
                className={clsx(
                  'grid grid-cols-[28px_1fr_64px_70px_70px] gap-2 px-4 py-3',
                  idx === 0 ? 'bg-yellow-500/10' : '',
                  idx < profiles.length - 1 ? 'border-b border-white/10' : ''
                )}
              >
                <div className={clsx('text-sm font-semibold', idx === 0 ? 'text-yellow-400' : 'text-slate-400')}>
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm text-white">
                    {p.wallet.slice(0, 4)}...{p.wallet.slice(-4)}
                  </div>
                  <div className="mt-1">{tierPill(label, color)}</div>
                </div>
                <div className="text-right text-sm text-slate-300">{reportsCount}</div>
                <div className="text-right text-sm text-green_verified">{verifiedCount}</div>
                <div className="text-right font-mono text-sm text-accent">{sol}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-white/10 bg-card p-4">
          <div className="text-sm font-semibold text-white">Profil Kamu</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent bg-accent/20 text-lg">
              👤
            </div>
            <div>
              <div className="font-mono text-sm text-white">
                {me?.wallet ? `${me.wallet.slice(0, 4)}...${me.wallet.slice(-4)}` : 'Belum login'}
              </div>
              <div className="mt-1">
                {me ? tierPill(getTier(me.reputation).label, getTier(me.reputation).color) : tierPill('Watcher', 'green')}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="text-[11px] text-slate-400">Laporan</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {me ? Math.max(1, Math.floor(me.reputation / 20)) : 0}
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="text-[11px] text-slate-400">Verified</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {me ? Math.max(0, Math.floor(Math.max(1, Math.floor(me.reputation / 20)) * 0.8)) : 0}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">80.8%</div>
            </div>
            <div className="flex-1 rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="text-[11px] text-slate-400">SOL</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {me ? (Math.floor(Math.max(1, Math.floor(me.reputation / 20)) * 0.8) * 0.0037).toFixed(3) : '0.000'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
