'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Link as LinkIcon, 
  ChevronDown, 
  ChevronUp,
  ExternalLink 
} from 'lucide-react';
import { compressImageFile } from '@/lib/storage';
import { isSupabaseConfigured, uploadImageToSupabaseStorage } from '@/lib/supabase';

interface CMSImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'banner' | 'auto';
  compact?: boolean;
}

export default function CMSImageUploader({
  value,
  onChange,
  label,
  helperText,
  aspectRatio = 'auto',
  compact = false
}: CMSImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = '';
    setUploadError(null);

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      setUploadError('Lütfen geçerli bir görsel formatı seçin (JPG, PNG, WEBP, GIF veya SVG).');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Görsel boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    setIsUploading(true);

    try {
      let finalUrl = '';

      // For SVG, read as dataURL directly
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        finalUrl = dataUrl;
      } else {
        // Compress image using canvas
        const { blob, dataUrl } = await compressImageFile(file, 1600, 0.88);
        finalUrl = dataUrl;

        // If Supabase is available, also upload to cloud storage
        if (isSupabaseConfigured) {
          try {
            const ext = file.name.split('.').pop() || 'jpg';
            const cleanName = `cms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
            const uploadRes = await uploadImageToSupabaseStorage('gallery', cleanName, blob);
            if (uploadRes.url) {
              finalUrl = uploadRes.url;
            }
          } catch (cloudErr) {
            console.warn('Supabase cloud storage upload fallback to dataUrl:', cloudErr);
          }
        }
      }

      onChange(finalUrl);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err?.message || 'Görsel işlenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  // Determine aspect ratio class
  const aspectClass = 
    aspectRatio === 'video' ? 'aspect-video' :
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'banner' ? 'aspect-[21/9]' :
    aspectRatio === 'wide' ? 'aspect-[16/9]' :
    'min-h-[110px]';

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
          {helperText && (
            <span className="text-[10px] text-slate-400 font-normal">
              {helperText}
            </span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error alert */}
      {uploadError && (
        <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* COMPACT MODE (for tight grid cards like atmosphere photos & team members) */}
      {compact ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            {/* Thumbnail Preview */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-cyan-400/60 shrink-0 cursor-pointer group transition-all"
              title="Görseli değiştirmek için tıklayın"
            >
              {value ? (
                <>
                  <img src={value} alt="Önizleme" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-4 h-4 text-cyan-400" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 group-hover:text-cyan-400">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[8px] mt-0.5 font-bold">YÜKLE</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    <span>{value ? 'Görseli Değiştir' : 'Cihazdan Görsel Yükle'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-slate-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  {showUrlInput ? 'URL Gizle' : 'veya URL gir'}
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>
          </div>

          {showUrlInput && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 text-[10px] font-mono focus:outline-none focus:border-cyan-400"
            />
          )}
        </div>
      ) : (
        /* STANDARD / HERO MODE */
        <div className="space-y-2">
          {value ? (
            /* ACTIVE IMAGE PREVIEW CARD */
            <div className={`relative ${aspectClass} rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-md`}>
              <img
                src={value}
                alt="Yüklenen Görsel"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay controls on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 flex flex-col justify-between p-3.5 transition-opacity">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                    Görsel Yayında
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white shadow-lg transition-colors cursor-pointer"
                    title="Görseli Kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05101F] font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Yeni Görsel Yükle (Cihazdan)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold backdrop-blur-md cursor-pointer"
                    title="URL Göster / Düzenle"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY DROP / UPLOAD ZONE */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative p-5 sm:p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {isUploading ? 'Görsel yükleniyor ve işleniyor...' : 'Cihazınızdan Görsel Seçin / Yükleyin'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                PNG, JPG, WEBP veya GIF (Maks. 10MB)
              </p>
              <button
                type="button"
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-[#05101F] text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-all"
              >
                Dosya Seç
              </button>
            </div>
          )}

          {/* Toggleable URL input for fallback / copy */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 px-1">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="hover:text-cyan-300 underline inline-flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? 'URL kutusunu gizle' : 'veya harici URL ile gir'}</span>
            </button>
            {value && (
              <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                {value.startsWith('data:') ? 'Yerel Base64 Yüklendi' : value}
              </span>
            )}
          </div>

          {showUrlInput && (
            <div className="pt-1">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://images.unsplash.com/... veya /images/..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
