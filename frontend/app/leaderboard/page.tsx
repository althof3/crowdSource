'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { supabase, Profile } from '@/lib/supabase';
import { Loader2, Trophy, Medal, Star, Wallet, CheckCircle2 } from 'lucide-react';

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
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

  const getTier = (reputation: number) => {
    if (reputation >= 1000) return { label: 'City Hero', color: 'text-accent', icon: Trophy };
    if (reputation >= 500) return { label: 'Guardian', color: 'text-green_verified', icon: Medal };
    return { label: 'Watcher', color: 'text-gray-400', icon: Star };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-4 pb-12">
      <Header />
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Leaderboard Komunitas</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Hormat kepada warga yang paling aktif menjaga infrastruktur dan keamanan kota kita.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-card border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Total Laporan</span>
            <span className="text-3xl font-black">{stats.totalReports}</span>
          </div>
          <div className="p-6 bg-card border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Terverifikasi</span>
            <span className="text-3xl font-black text-green_verified">{stats.totalVerified}</span>
          </div>
          <div className="p-6 bg-card border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">SOL Distributed</span>
            <span className="text-3xl font-black text-accent">{stats.totalSOL}</span>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Ranking Kontributor
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-white/5">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Kontributor</th>
                  <th className="px-6 py-4">Reputasi</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.map((p, idx) => {
                  const { label, color, icon: Icon } = getTier(p.reputation);
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`text-lg font-black ${idx < 3 ? 'text-accent' : 'text-gray-500'}`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-mono">{p.wallet.slice(0, 6)}...{p.wallet.slice(-6)}</p>
                            <p className="text-[10px] text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">{p.reputation} XP</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-sm font-bold ${color}`}>
                          <Icon className="w-4 h-4" />
                          {label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.is_verified_org && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-green_verified uppercase px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Org
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
