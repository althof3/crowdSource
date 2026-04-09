'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { AppShell } from '@/components/AppShell';
import { Map } from '@/components/Map';
import { Report } from '@/lib/supabase';
import { DUMMY_REPORTS } from '@/lib/dummy';

export default function Home() {
  const [filter, setFilter] = useState<'all' | Report['category']>('all');
  const [reports, setReports] = useState<Report[]>(DUMMY_REPORTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [viewport, setViewport] = useState({ lat: -2.0113, lng: 117.5423, zoom: 4.19 });

  const filtered = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.category === filter);
  }, [reports, filter]);

  const selected = useMemo(() => filtered.find((r) => r.id === selectedId) ?? null, [filtered, selectedId]);

  return (
    <AppShell>
      <div className="relative -m-5 h-[calc(100vh-0px)] overflow-hidden bg-background">
        {/* Full Screen Map */}
        <div className="absolute inset-0 z-0">
          <Map 
            reports={filtered} 
            selectedReport={selected} 
            onSelectReport={(id) => setSelectedId(id)} 
            onMove={(v) => setViewport(v)}
          />
        </div>

        {/* Floating Header Controls */}
        <div className={clsx(
          "absolute top-4 z-20 flex flex-col gap-3 sm:flex-row sm:items-center transition-all duration-500 ease-in-out",
          selected ? "left-[384px]" : "left-4"
        )}>
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-card/80 px-4 py-2 shadow-2xl backdrop-blur-xl">
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
               📍
             </div>
             <div>
               <div className="text-sm font-bold text-white leading-none">CrowdRadar</div>
               <div className="mt-1 text-[10px] text-slate-400">Peta Indonesia</div>
             </div>
          </div>

          <div className="flex gap-2">
            {([
              ['all', 'Semua'],
              ['pothole', 'Jalan Rusak'],
              ['crime', 'Kejahatan'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={clsx(
                  'h-12 rounded-2xl border px-5 text-xs font-bold transition-all shadow-xl backdrop-blur-xl outline-none',
                  filter === key
                    ? 'border-accent bg-accent text-white shadow-accent/20'
                    : 'border-white/10 bg-card/80 text-slate-300 hover:border-accent/40 hover:bg-accent/10 hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Center Floating Action Button (FAB) for Report */}
        <div className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 flex justify-center w-full max-w-xs px-4">
          <Link
            href="/report"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-accent px-8 text-base font-bold text-white shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:bg-accent/90 transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-2xl font-light">+</span> Buat Laporan
          </Link>
        </div>

        {/* Left-side Sidebar Detail (Google Maps style) */}
        {selected && (
          <div className="absolute inset-y-0 left-0 z-30 w-full max-w-[360px] p-4 pointer-events-none">
            <div className="pointer-events-auto h-full w-full overflow-y-auto rounded-3xl border border-white/10 bg-card/90 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-left duration-500 ease-out">
               <div className="relative h-48 w-full shrink-0">
                 <img src={selected.photo_url} alt="Proof" className="h-full w-full object-cover" />
                 <button
                    onClick={() => setSelectedId(null)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span
                      className={clsx(
                        'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg',
                        selected.category === 'pothole' ? 'bg-orange_pothole text-white' : 'bg-red_crime text-white'
                      )}
                    >
                      {selected.category === 'pothole' ? 'Jalan Rusak' : 'Kejahatan'}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg">
                      {selected.status === 'confirmed' ? 'Verified' : 'Pending'}
                    </span>
                  </div>
               </div>

               <div className="p-6">
                 <div>
                   <h3 className="text-xl font-bold text-white">Laporan #{selected.id.slice(0, 6)}</h3>
                   <p className="mt-1 text-xs text-slate-400">
                     Dilaporkan pada {new Date(selected.created_at).toLocaleString('id-ID')}
                   </p>
                 </div>

                 <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
                        📍
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-left">Koordinat</div>
                        <div className="text-sm font-medium text-white">{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg text-left">
                        ▲
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reputasi</div>
                        <div className="text-sm font-medium text-white">{selected.upvote_count} Upvotes</div>
                      </div>
                    </div>
                 </div>

                 <div className="mt-8 flex flex-col gap-3">
                    <a
                      href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white transition-all hover:bg-white/10"
                    >
                      📍 Buka Google Maps
                    </a>
                    <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-bold text-white shadow-xl shadow-accent/20 transition-all hover:bg-accent/90">
                      ▲ Upvote Sekarang
                    </button>
                    <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20">
                      🚨 Laporkan Spam
                    </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Bottom Legend */}
        <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-card/80 p-3 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange_pothole" />
              <span className="text-[11px] font-bold text-slate-300">Jalan Rusak</span>
            </div>
            <div className="flex items-center gap-2 sm:ml-2 sm:border-l sm:border-white/10 sm:pl-4">
              <span className="h-3 w-3 rounded-full bg-red_crime" />
              <span className="text-[11px] font-bold text-slate-300">Kejahatan</span>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
