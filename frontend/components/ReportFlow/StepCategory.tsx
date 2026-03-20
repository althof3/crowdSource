'use client';

import React from 'react';
import { clsx } from 'clsx';
import { ReportCategory } from '@/app/report/page';

interface StepCategoryProps {
  selected: ReportCategory | null;
  onSelect: (category: ReportCategory) => void;
}

export const StepCategory = ({ selected, onSelect }: StepCategoryProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        onClick={() => onSelect('pothole')}
        className={clsx(
          'rounded-xl border p-4 text-left transition-colors',
          selected === 'pothole'
            ? 'border-accent bg-accent/20'
            : 'border-white/10 bg-card hover:bg-white/5'
        )}
      >
        <div className="text-2xl">⚠️</div>
        <div className="mt-2 text-sm font-semibold text-white">Jalan Rusak</div>
        <div className="mt-1 text-xs text-slate-400">Lubang, retak, permukaan rusak</div>
      </button>

      <button
        onClick={() => onSelect('crime')}
        className={clsx(
          'rounded-xl border p-4 text-left transition-colors',
          selected === 'crime'
            ? 'border-accent bg-accent/20'
            : 'border-white/10 bg-card hover:bg-white/5'
        )}
      >
        <div className="text-2xl">🚨</div>
        <div className="mt-2 text-sm font-semibold text-white">Kejahatan</div>
        <div className="mt-1 text-xs text-slate-400">Hotspot kriminalitas, area berbahaya</div>
      </button>
    </div>
  );
};
