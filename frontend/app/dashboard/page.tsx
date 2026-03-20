'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { supabase, Sayembara, Report, Profile } from '@/lib/supabase';
import { Loader2, Plus, Wallet, MapPin, Calendar, CheckCircle, XCircle, Users } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sayembaras, setSayembaras] = useState<Sayembara[]>([]);
  const [activeSayembara, setActiveSayembara] = useState<Sayembara | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const wallet = user.user_metadata.wallet;

        const [profileRes, sayembarasRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('wallet', wallet).single(),
          supabase.from('sayembaras').select('*').eq('author_wallet', wallet).order('created_at', { ascending: false })
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (sayembarasRes.data) {
          setSayembaras(sayembarasRes.data);
          if (sayembarasRes.data.length > 0) setActiveSayembara(sayembarasRes.data[0]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeSayembara) {
      const fetchReports = async () => {
        const { data } = await supabase
          .from('reports')
          .select('*')
          .eq('provinsi_id', activeSayembara.provinsi_id)
          .order('upvote_count', { ascending: false });
        if (data) setReports(data);
      };
      fetchReports();
    }
  }, [activeSayembara]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile?.is_verified_org) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 flex items-center justify-center">
        <Header />
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-gray-400">
            Hanya organisasi terverifikasi yang dapat mengakses dashboard author dan membuat sayembara.
          </p>
          <button className="px-6 py-2 bg-accent rounded-lg font-bold">Ajukan Verifikasi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-4 pb-12">
      <Header />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Author Dashboard</h1>
            <p className="text-gray-400">Kelola sayembara dan konfirmasi laporan warga.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-accent rounded-xl font-bold text-white hover:bg-accent/90 transition-all">
            <Plus className="w-5 h-5" />
            Buat Sayembara
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sayembara List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Sayembara Anda
            </h2>
            <div className="space-y-3">
              {sayembaras.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSayembara(s)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeSayembara?.id === s.id 
                      ? "bg-accent/10 border-accent/50 ring-1 ring-accent/30" 
                      : "bg-card border-white/5 hover:border-white/10"
                  }`}
                >
                  <p className="font-bold truncate">{s.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{new Date(s.deadline).toLocaleDateString()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      s.status === 'active' ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </button>
              ))}
              {sayembaras.length === 0 && (
                <div className="p-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm">
                  Belum ada sayembara aktif.
                </div>
              )}
            </div>
          </div>

          {/* Reports Queue */}
          <div className="lg:col-span-3 space-y-6">
            {activeSayembara ? (
              <>
                <div className="p-6 bg-card border border-white/5 rounded-2xl flex flex-wrap gap-8 items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Deposit</span>
                    <div className="flex items-center gap-2 text-xl font-bold">
                      <Wallet className="w-5 h-5 text-accent" />
                      {activeSayembara.total_deposit} SOL
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Confirmed Reports</span>
                    <div className="flex items-center gap-2 text-xl font-bold">
                      <CheckCircle className="w-5 h-5 text-green_verified" />
                      {activeSayembara.confirmed_count}
                    </div>
                  </div>
                  <div className="flex-1" />
                  <button className="px-8 py-3 bg-green_verified rounded-xl font-bold text-white hover:bg-green_verified/90 transition-all">
                    Distribute Rewards
                  </button>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    Antrian Laporan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map(r => (
                      <div key={r.id} className="group bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                        <div className="aspect-video relative overflow-hidden">
                          <img src={r.photo_url} alt="Report" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            r.category === 'pothole' ? "bg-orange_pothole text-white" : "bg-red_crime text-white"
                          }`}>
                            {r.category}
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <MapPin className="w-3 h-3" />
                              {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                            </div>
                            <div className="text-xs font-bold text-accent">{r.upvote_count} Upvotes</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm font-bold border border-green-500/30 transition-all">
                              Konfirmasi
                            </button>
                            <button className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold border border-red-500/30 transition-all">
                              Tolak
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 bg-card border border-white/5 rounded-2xl border-dashed">
                <MapPin className="w-12 h-12 mb-4 opacity-20" />
                <p>Pilih sayembara untuk melihat antrian laporan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
