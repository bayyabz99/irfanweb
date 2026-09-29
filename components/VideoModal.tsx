'use client';

import React, { useEffect, useMemo } from 'react';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import { getStoredCMSData } from '@/lib/cmsStorage';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title?: string;
}

export function parseVideoUrl(rawUrl?: string): {
  type: 'youtube' | 'vimeo' | 'video';
  embedUrl: string;
  originalUrl: string;
} {
  const fallback = 'https://assets.mixkit.co/videos/preview/mixkit-curved-lines-of-an-auditorium-hall-with-warm-lights-42971-large.mp4';
  let target = rawUrl?.trim();

  if (!target) {
    try {
      const cms = getStoredCMSData();
      target = cms.aboutPage?.timav?.videoUrl?.trim() || fallback;
    } catch {
      target = fallback;
    }
  }

  // If user pasted an <iframe> snippet
  const iframeMatch = target.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    target = iframeMatch[1];
  }

  // YouTube match
  // e.g. https://youtu.be/dkgl6Nxb-Vc?t=4, https://www.youtube.com/watch?v=dkgl6Nxb-Vc, etc.
  const ytMatch = target.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+?&v=|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const timeMatch = target.match(/[?&]t=(\d+)s?/i);
    const startParam = timeMatch ? `&start=${timeMatch[1]}` : '';
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1${startParam}`,
      originalUrl: target
    };
  }

  // Vimeo match
  const vimeoMatch = target.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`,
      originalUrl: target
    };
  }

  return {
    type: 'video',
    embedUrl: target,
    originalUrl: target
  };
}

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = 'İrfan Meclisi 2026 Tanıtım Filmi'
}: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const parsed = useMemo(() => parseVideoUrl(videoUrl), [videoUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-slate-950 border border-blue-600/40 rounded-2xl overflow-hidden shadow-2xl shadow-blue-950/60 z-10 flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{title}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {parsed.originalUrl && (
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Yeni sekmede aç"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
            <iframe
              src={parsed.embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              key={parsed.embedUrl}
              src={parsed.embedUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
          )}
        </div>

        {/* Modal Footer note */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>ÖNDER Medya & Gençlik Yapımı • 23-24-25 Ekim 2026 Selçuklu Kongre Merkezi</span>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-medium uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">
              {parsed.type === 'youtube' ? 'YouTube HD' : parsed.type === 'vimeo' ? 'Vimeo' : 'Video Oynatıcı'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

