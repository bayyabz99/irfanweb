'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';

interface InnerPageHeroProps {
  badge: string;
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  actionButton?: { label: string; href: string };
}

export default function InnerPageHero({
  badge,
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  actionButton
}: InnerPageHeroProps) {
  const displayDesc = description || subtitle;

  return (
    <section className="relative overflow-hidden border-b border-[#1d446f]/50 pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover object-center opacity-35 saturate-125 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020B16] via-[#041326]/92 to-[#030c18]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020B16] via-transparent to-[#020B16]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_42%)]" />
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-7">
            <Link href="/" className="hover:text-[#38bdf8] transition-colors">
              Ana Sayfa
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={`${crumb.label}-${idx}`}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#38bdf8] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#38bdf8] font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 uppercase tracking-[0.18em]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-serif font-black text-white tracking-tight leading-[1.12]">
              {title}
            </h1>

            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#4DA3FF]" />

            {displayDesc && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-sans">
                {displayDesc}
              </p>
            )}
          </div>

          {(actions || actionButton) && (
            <div className="shrink-0 flex items-center gap-3">
              {actions}
              {actionButton && (
                <Link
                  href={actionButton.href}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#4DA3FF] hover:bg-[#38bdf8] text-[#020B16] font-bold text-xs shadow-[0_8px_24px_-6px_rgba(56,189,248,0.55)] transition-all cursor-pointer"
                >
                  {actionButton.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
