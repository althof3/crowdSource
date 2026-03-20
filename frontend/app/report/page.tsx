'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { StepCategory } from '@/components/ReportFlow/StepCategory';
import { StepUpload } from '@/components/ReportFlow/StepUpload';
import { StepConfirm } from '@/components/ReportFlow/StepConfirm';
import { StepSuccess } from '@/components/ReportFlow/StepSuccess';
import { GPSCoords } from '@/lib/exif';

export type ReportCategory = 'pothole' | 'crime';

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<GPSCoords | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-background pt-24 px-4 pb-12">
      <Header />
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Laporkan Masalah</h1>
          <div className="text-sm text-gray-400">Step {step} of 4</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-6 sm:p-8">
          {step === 1 && (
            <StepCategory 
              selected={category} 
              onSelect={(cat) => {
                setCategory(cat);
                nextStep();
              }} 
            />
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

          {step === 4 && (
            <StepSuccess txHash={txHash!} />
          )}
        </div>
      </div>
    </div>
  );
}
