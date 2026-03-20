'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GPSCoords, getGoogleMapsUrl } from '@/lib/exif';
import { Loader2, ArrowLeft, Send, MapPin, Calendar, Wallet } from 'lucide-react';
import { ReportCategory } from '@/app/report/page';

interface StepConfirmProps {
  category: ReportCategory;
  photo: File;
  coords: GPSCoords;
  onConfirm: (txHash: string) => void;
  onBack: () => void;
}

export const StepConfirm = ({ category, photo, coords, onConfirm, onBack }: StepConfirmProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Load preview if not already set
  React.useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(photo);
  }, [photo]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Silakan login dengan wallet Anda terlebih dahulu.");
        return;
      }

      const walletAddress = user.user_metadata.wallet;

      // 1. Upload photo to Supabase Storage
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, photo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      // 2. AI Validation (Placeholder - call FastAPI later)
      // For now, we assume it's valid for this step implementation
      
      // 3. Save report to Supabase
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          reporter_wallet: walletAddress,
          category,
          lat: coords.lat,
          lng: coords.lng,
          photo_url: publicUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // 4. Solana transaction (Placeholder - will implement after contract)
      // For now, we simulate a TX hash
      const mockTxHash = '5f2k...3h9m';
      
      onConfirm(mockTxHash);

    } catch (err: any) {
      console.error('Submit report error:', err);
      setError(err.message || "Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Konfirmasi Laporan</h2>
        <p className="text-gray-400 text-sm">Tinjau detail laporan Anda sebelum dikirim ke blockchain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square rounded-2xl overflow-hidden border border-white/10">
          {preview && <img src={preview} alt="Evidence" className="w-full h-full object-cover" />}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Lokasi</p>
                <a 
                  href={getGoogleMapsUrl(coords.lat, coords.lng)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline text-accent"
                >
                  Lihat di Google Maps
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Waktu</p>
                <p className="text-sm font-medium">{new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Kategori</p>
                <p className="text-sm font-medium capitalize">{category === 'pothole' ? 'Jalan Rusak' : 'Kejahatan'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <p className="text-xs text-orange-400 leading-relaxed">
              * Laporan akan diproses oleh AI dan komunitas. Reward akan didistribusikan jika laporan dikonfirmasi oleh author sayembara.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Kirim Laporan
            </>
          )}
        </button>
      </div>
    </div>
  );
};
