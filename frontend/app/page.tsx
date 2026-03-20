'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { AppShell } from '@/components/AppShell';
import { Map } from '@/components/Map';
import { supabase, Report } from '@/lib/supabase';

export default function Home() {
  const [filter, setFilter] = useState<'all' | Report['category']>('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setReports(data);
    };
    fetchReports();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.category === filter);
  }, [reports, filter]);

  const selected = useMemo(() => filtered.find((r) => r.id === selectedId) ?? null, [filtered, selectedId]);

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Peta Laporan</div>
            <div className="text-sm text-slate-400">Radius 5KM · Jakarta Pusat</div>
          </div>
          <Link
            href="/report"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
          >
            + Laporkan
          </Link>
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
                'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                filter === key
                  ? 'border-accent bg-accent/20 text-accent'
                  : 'border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-card">
          <div className="relative h-[260px]">
            <Map reports={filtered} selectedReport={selected} />
            {/* <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-card/80 px-2 py-1 text-[10px] text-slate-400 backdrop-blur">
              MapLibre + OpenFreeMap
            </div> */}
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-md flex gap-3 text-[10px] text-slate-400 bg-card/80 px-2 py-1 backdrop-blur">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange_pothole" />
                Jalan Rusak
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red_crime" />
                Kejahatan
              </div>
            </div>
          </div>
        </div>

        {selected && (
          <div className="rounded-xl border border-white/10 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    selected.category === 'pothole' ? 'bg-orange_pothole/20 text-orange_pothole' : 'bg-red_crime/20 text-red_crime'
                  )}
                >
                  {selected.category === 'pothole' ? 'Jalan Rusak' : 'Kejahatan'}
                </span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    selected.status === 'confirmed' ? 'bg-green_verified/20 text-green_verified' : 'bg-yellow-500/20 text-yellow-400'
                  )}
                >
                  {selected.status === 'confirmed' ? 'Verified' : 'Pending'}
                </span>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-md px-2 py-1 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="mt-2 text-sm font-semibold text-white">Koordinat laporan</div>
            <div className="mt-0.5 text-xs text-slate-400">
              {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)} · {new Date(selected.created_at).toLocaleString('id-ID')}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/15"
              >
                📍 Google Maps
              </a>
              <button className="rounded-md bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/15">
                ▲ Upvote
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId((prev) => (prev === r.id ? null : r.id))}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                selectedId === r.id ? 'border-white/20 bg-white/5' : 'border-white/10 bg-card hover:bg-white/5'
              )}
            >
              <div className="text-lg">{r.category === 'pothole' ? '🕳️' : '🚨'}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">Laporan #{r.id.slice(0, 6)}</div>
                <div className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleString('id-ID')} · {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    r.status === 'confirmed' ? 'bg-green_verified/20 text-green_verified' : 'bg-yellow-500/20 text-yellow-400'
                  )}
                >
                  {r.status === 'confirmed' ? 'Verified' : 'Pending'}
                </span>
                <span className="text-xs text-slate-400">▲ {r.upvote_count ?? 0}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-card p-8 text-center text-sm text-slate-400">
              Belum ada laporan untuk filter ini.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
