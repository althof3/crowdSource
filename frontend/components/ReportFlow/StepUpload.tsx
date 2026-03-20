'use client';

import React, { useRef, useState } from 'react';
import { Camera, MapPin, AlertCircle, Loader2, ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { extractGPS, GPSCoords, getGoogleMapsUrl } from '@/lib/exif';
import imageCompression from 'browser-image-compression';
import { ReportCategory } from '@/app/report/page';

interface StepUploadProps {
  onUpload: (file: File, gps: GPSCoords) => void;
  onBack: () => void;
  category: ReportCategory;
}

export const StepUpload = ({ onUpload, onBack, category }: StepUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<GPSCoords | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      // 1. Extract GPS from EXIF
      const gps = await extractGPS(file);
      if (!gps) {
        setError("Foto tidak memiliki data GPS. Pastikan lokasi aktif saat memotret.");
        return;
      }
      setGpsData(gps);

      // 2. Compress image
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      
      // 3. Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

    } catch (err) {
      console.error('File process error:', err);
      setError("Gagal memproses foto. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (preview && gpsData && fileInputRef.current?.files?.[0]) {
      // Create a new File from the compressed blob
      const originalFile = fileInputRef.current.files[0];
      onUpload(originalFile, gpsData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Upload Foto Bukti</h2>
        <p className="text-gray-400 text-sm">Pastikan foto jelas dan mengandung data lokasi (GPS).</p>
      </div>

      <div 
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`
          relative w-full aspect-square sm:aspect-video rounded-2xl border-2 border-dashed 
          flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
          ${preview ? 'border-accent' : 'border-white/10 hover:border-white/20 bg-white/5'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="p-4 bg-white/10 rounded-full">
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
            </div>
            <p className="font-medium">Klik untuk upload foto</p>
            <p className="text-xs">Maksimal 10MB (akan dicompress)</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {gpsData && (
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">Data GPS Terdeteksi</span>
          </div>
          <p className="text-xs text-gray-300">
            Lat: {gpsData.lat.toFixed(6)}, Lng: {gpsData.lng.toFixed(6)}
          </p>
          <a 
            href={getGoogleMapsUrl(gpsData.lat, gpsData.lng)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
          >
            <MapPin className="w-3 h-3" />
            Lihat di Google Maps
          </a>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <button
          onClick={handleSubmit}
          disabled={!preview || loading}
          className="flex-[2] px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
};
