'use client';

import React from 'react';
import { RoadPolyline, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { ReportCategory } from '@/app/report/page';

interface StepCategoryProps {
  selected: ReportCategory | null;
  onSelect: (category: ReportCategory) => void;
}

export const StepCategory = ({ selected, onSelect }: StepCategoryProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Pilih Kategori Laporan</h2>
        <p className="text-gray-400 text-sm">Apa yang ingin Anda laporkan hari ini?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('pothole')}
          className={clsx(
            "group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300",
            selected === 'pothole' 
              ? "bg-orange_pothole/10 border-orange_pothole text-orange_pothole" 
              : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10"
          )}
        >
          <div className={clsx(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
            selected === 'pothole' ? "bg-orange_pothole text-white" : "bg-white/10 text-gray-400 group-hover:bg-white/20"
          )}>
            <RoadPolyline className="w-8 h-8" />
          </div>
          <div className="text-center">
            <span className="block font-bold text-lg mb-1">Jalan Rusak</span>
            <span className="text-sm text-gray-400">Lubang, retakan, atau aspal mengelupas</span>
          </div>
        </button>

        <button
          onClick={() => onSelect('crime')}
          className={clsx(
            "group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300",
            selected === 'crime' 
              ? "bg-red_crime/10 border-red_crime text-red_crime" 
              : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10"
          )}
        >
          <div className={clsx(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
            selected === 'crime' ? "bg-red_crime text-white" : "bg-white/10 text-gray-400 group-hover:bg-white/20"
          )}>
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="text-center">
            <span className="block font-bold text-lg mb-1">Kejahatan</span>
            <span className="text-sm text-gray-400">Pencurian, kekerasan, atau tindakan kriminal</span>
          </div>
        </button>
      </div>
    </div>
  );
};
