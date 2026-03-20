'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { AppShell } from '@/components/AppShell';
import { StepCategory } from '@/components/ReportFlow/StepCategory';
import { StepUpload } from '@/components/ReportFlow/StepUpload';
import { StepConfirm } from '@/components/ReportFlow/StepConfirm';
import { StepSuccess } from '@/components/ReportFlow/StepSuccess';
import { GPSCoords } from '@/lib/exif';
import { ArrowLeft } from 'lucide-react';

export type ReportCategory = 'pothole' | 'crime';

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<GPSCoords | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  const handleBack = () => {
    if (step === 1) router.push('/');
    else prevStep();
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="rounded-lg px-2 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="text-lg font-semibold text-white">Buat Laporan</div>
            <div className="text-sm text-slate-400">Step {step} dari 4</div>
          </div>
        </div>

        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={clsx('h-1 flex-1 rounded-full', s <= step ? 'bg-accent' : 'bg-white/10')}
            />
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-card p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Pilih kategori laporan</div>
              <StepCategory selected={category} onSelect={(cat) => setCategory(cat)} />
              <button
                onClick={() => category && nextStep()}
                disabled={!category}
                className={clsx(
                  'mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
                  category ? 'bg-accent text-white hover:bg-accent/90' : 'bg-white/10 text-slate-400'
                )}
              >
                Lanjut
              </button>
            </div>
          )}

          {step === 2 && (
            <StepUpload
              onUpload={(file, gps) => {
                setPhoto(file);
                setCoords(gps);
                nextStep();
              }}
              onBack={prevStep}
              category={category!}
            />
          )}

          {step === 3 && (
            <StepConfirm
              category={category!}
              photo={photo!}
              coords={coords!}
              onConfirm={(hash) => {
                setTxHash(hash);
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {step === 4 && <StepSuccess txHash={txHash!} />}
        </div>
      </div>
    </AppShell>
  );
}
