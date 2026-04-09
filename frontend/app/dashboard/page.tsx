'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { clsx } from 'clsx';
import { Sayembara, Report, Profile } from '@/lib/supabase';
import { Loader2, Plus } from 'lucide-react';
import { DUMMY_SAYEMBARA, DUMMY_REPORTS, DUMMY_PROFILE } from '@/lib/dummy';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sayembaras, setSayembaras] = useState<Sayembara[]>([]);
  const [activeSayembara, setActiveSayembara] = useState<Sayembara | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulasi loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setProfile({ ...DUMMY_PROFILE, is_verified_org: true });
        setSayembaras(DUMMY_SAYEMBARA);
        if (DUMMY_SAYEMBARA.length > 0) setActiveSayembara(DUMMY_SAYEMBARA[0]);
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
      // Ambil laporan yang sesuai kategori sayembara agar terlihat logis
      const filtered = DUMMY_REPORTS.filter(r => 
        activeSayembara.category === 'both' || r.category === activeSayembara.category
      );
      setReports(filtered);
    }
  }, [activeSayembara]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const provinceLabel = (provinsiId: number) => {
    if (provinsiId === 1) return 'DKI Jakarta';
    return `Provinsi ${provinsiId}`;
  };

  const formatTime = (iso: string) => {
    const dt = new Date(iso);
    return dt.toLocaleString('id-ID');
  };

  const sortedQueue = reports.filter((r) => !confirmedIds.includes(r.id));

  if (!profile?.is_verified_org) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-card p-8 text-center">
          <div className="text-xl font-semibold text-white">Akses Ditolak</div>
          <div className="mt-2 text-sm text-slate-400">
            Hanya organisasi terverifikasi yang dapat mengakses dashboard author dan membuat sayembara.
          </div>
          <button className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90">
            Ajukan Verifikasi
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-lg font-semibold">Author Dashboard</div>
          <div className="text-sm text-slate-400">Kelola sayembara & validasi laporan</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sayembaras.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSayembara(s);
                setConfirmedIds([]);
              }}
              className={clsx(
                'rounded-lg border px-3 py-2 text-xs transition-colors',
                activeSayembara?.id === s.id
                  ? 'border-accent bg-accent/20 text-accent'
                  : 'border-white/10 bg-card text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {s.title.length > 28 ? `${s.title.slice(0, 28)}...` : s.title}
            </button>
          ))}
          <button className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs text-accent hover:bg-accent/10">
            + Buat Sayembara
          </button>
        </div>

        {activeSayembara ? (
          <>
            <div className="rounded-xl border border-white/10 bg-card p-4">
              <div className="text-sm font-semibold text-white">{activeSayembara.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {provinceLabel(activeSayembara.provinsi_id)}
                </span>
                <span className="rounded-full bg-green_verified/20 px-2 py-0.5 text-[11px] font-semibold text-green_verified">
                  {activeSayembara.status === 'active' ? 'Aktif' : 'Selesai'}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 rounded-xl border border-white/10 bg-background/40 p-4">
                  <div className="text-[11px] text-slate-400">Deposit</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{activeSayembara.total_deposit} SOL</div>
                  <div className="mt-1 text-[11px] text-slate-400">Di escrow</div>
                </div>
                <div className="flex-1 rounded-xl border border-white/10 bg-background/40 p-4">
                  <div className="text-[11px] text-slate-400">Confirmed</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    {activeSayembara.confirmed_count + confirmedIds.length}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">laporan</div>
                </div>
                <div className="flex-1 rounded-xl border border-white/10 bg-background/40 p-4">
                  <div className="text-[11px] text-slate-400">Deadline</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    {new Date(activeSayembara.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">{new Date(activeSayembara.deadline).getFullYear()}</div>
                </div>
              </div>
            </div>

            <div className="text-sm font-semibold text-white">
              Antrian <span className="text-sm font-normal text-slate-400">— by upvote</span>
            </div>

            {sortedQueue.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-card p-8 text-center text-sm text-slate-400">
                Semua laporan sudah divalidasi
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedQueue.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-card px-4 py-3"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-lg">
                      {r.category === 'pothole' ? '🕳️' : '🚨'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">Laporan #{r.id.slice(0, 6)}</div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {r.lat.toFixed(4)}, {r.lng.toFixed(4)} · {formatTime(r.created_at)}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
                          ▲ {r.upvote_count ?? 0}
                        </span>
                        <span
                          className={clsx(
                            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                            r.category === 'pothole'
                              ? 'bg-orange_pothole/20 text-orange_pothole'
                              : 'bg-red_crime/20 text-red_crime'
                          )}
                        >
                          {r.category === 'pothole' ? 'Jalan Rusak' : 'Kejahatan'}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent hover:bg-accent/15"
                        >
                          📍 Google Maps
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setConfirmedIds((prev) => (prev.includes(r.id) ? prev : [...prev, r.id]))}
                        className="rounded-md border border-green_verified/30 bg-green_verified/10 px-3 py-1.5 text-xs font-semibold text-green_verified hover:bg-green_verified/15"
                      >
                        Konfirmasi
                      </button>
                      <button className="rounded-md border border-red_crime/30 bg-red_crime/10 px-3 py-1.5 text-xs font-semibold text-red_crime hover:bg-red_crime/15">
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {confirmedIds.length > 0 && (
              <button className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent/90">
                Distribute {activeSayembara.total_deposit} SOL ke {activeSayembara.confirmed_count + confirmedIds.length}{' '}
                Reporter
              </button>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-card p-8 text-center text-sm text-slate-400">
            Pilih sayembara untuk melihat antrian laporan.
          </div>
        )}
      </div>
    </AppShell>
  );
}
