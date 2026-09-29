'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface WhyIrfanMeclisiProps {
  tag?: string;
  heading?: string;
  paragraph?: string;
  quote?: string;
  imageUrl?: string;
}

export default function WhyIrfanMeclisi({
  tag = 'NEDEN İRFAN MECLİSİ?',
  heading = 'Sadece Dinleyen Değil,\nGeleceği Şekillendiren',
  paragraph = 'İrfan Meclisi, gençlerin fikirlerini, değerlerini ve potansiyelini bir araya getirerek daha güçlü bir gelecek inşa etmeyi amaçlar.',
  quote = '“Daha iyi bir gelecek, gençlerin fikirleriyle mümkün.”',
  imageUrl = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
}: WhyIrfanMeclisiProps) {
  // Clean tag from existing tildes or dashes so we render canonical ~ TAG ~
  const cleanTag = (tag || 'NEDEN İRFAN MECLİSİ?')
    .replace(/^[-—~~\s]+/, '')
    .replace(/[-—~~\s]+$/, '')
    .trim();

  // Split heading into two lines
  const headingLines = heading.includes('\n') 
    ? heading.split('\n') 
    : heading.includes(',')
      ? [heading.substring(0, heading.indexOf(',') + 1).trim(), heading.substring(heading.indexOf(',') + 1).trim()]
      : [heading];

  return (
    <section className="bg-white text-[#061A33] py-16 sm:py-20 lg:py-24 border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: GÖRSELDEKİ "NEDEN İRFAN MECLİSİ" TASARIMI                   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Ornamental Divider & Tag */}
            <div className="space-y-1.5">
              <div className="inline-flex flex-col items-center">
                {/* Symmetrical Rosette Divider Line */}
                <div className="flex items-center justify-center gap-2.5">
                  <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-[#008EA9]/60 to-[#008EA9]" />
                  <div className="text-[#008EA9] flex items-center justify-center shrink-0">
                    <svg 
                      viewBox="0 0 32 32" 
                      className="w-5 h-5 sm:w-5.5 sm:h-5.5" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.75" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="13" y="13" width="6" height="6" transform="rotate(45 16 16)" fill="#008EA9" fillOpacity="0.2" />
                      <path d="M16 12 C13.2 6.5 18.8 6.5 16 2 C13.2 6.5 18.8 6.5 16 12 Z" fill="#008EA9" fillOpacity="0.25" />
                      <path d="M16 20 C13.2 25.5 18.8 25.5 16 30 C13.2 25.5 18.8 25.5 16 20 Z" fill="#008EA9" fillOpacity="0.25" />
                      <path d="M12 16 C6.5 13.2 6.5 18.8 2 16 C6.5 13.2 6.5 18.8 12 16 Z" fill="#008EA9" fillOpacity="0.25" />
                      <path d="M20 16 C25.5 13.2 25.5 18.8 30 16 C25.5 13.2 25.5 18.8 20 16 Z" fill="#008EA9" fillOpacity="0.25" />
                      <circle cx="16" cy="16" r="1.3" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-l from-transparent via-[#008EA9]/60 to-[#008EA9]" />
                </div>

                {/* Subtitle Badge: ~ NEDEN İRFAN MECLİSİ? ~ */}
                <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-extrabold tracking-[0.22em] text-[#008EA9] uppercase select-none mt-1">
                  <span className="opacity-70 font-light">~</span>
                  <span>{cleanTag}</span>
                  <span className="opacity-70 font-light">~</span>
                </div>
              </div>
            </div>

            {/* Main Headline (2 lines in bold serif) */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-black text-[#061A33] tracking-tight leading-[1.18]">
              {headingLines.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </h2>

            {/* Description Paragraph */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
              {paragraph}
            </p>

            {/* Three Pillars (Güçlü Topluluk | Nitelikli Eğitim | Kalıcı Değerler) */}
            <div className="pt-2">
              <div className="flex items-center justify-between max-w-lg py-3.5 px-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8]/70 shadow-sm">
                
                {/* Pillar 1: Güçlü Topluluk */}
                <div className="flex-1 flex flex-col items-center text-center px-1 sm:px-2 group">
                  <div className="w-10 h-10 flex items-center justify-center text-[#008EA9] group-hover:scale-105 transition-transform duration-300">
                    <svg
                      viewBox="0 0 52 52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 sm:w-9 sm:h-9"
                    >
                      <circle cx="26" cy="18" r="5.5" />
                      <path d="M17 37c0-5 4-9 9-9s9 4 9 9" />
                      <circle cx="14" cy="22" r="4.2" />
                      <path d="M6 37c0-4.2 3.4-7.8 7.6-7.8 1.4 0 2.8.4 4 1.1" />
                      <circle cx="38" cy="22" r="4.2" />
                      <path d="M34.4 30.3c1.2-.7 2.6-1.1 4-1.1 4.2 0 7.6 3.6 7.6 7.8" />
                    </svg>
                  </div>
                  <span className="font-serif font-bold text-xs sm:text-[13px] text-[#0B2545] mt-1.5 tracking-wide">
                    Güçlü Topluluk
                  </span>
                </div>

                {/* Vertical Divider 1 */}
                <div className="w-[1.5px] h-11 bg-[#DFD6C8] shrink-0" />

                {/* Pillar 2: Nitelikli Eğitim */}
                <div className="flex-1 flex flex-col items-center text-center px-1 sm:px-2 group">
                  <div className="w-10 h-10 flex items-center justify-center text-[#008EA9] group-hover:scale-105 transition-transform duration-300">
                    <svg
                      viewBox="0 0 52 52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 sm:w-9 sm:h-9"
                    >
                      <line x1="26" y1="4" x2="26" y2="9" />
                      <line x1="11" y1="10" x2="14.5" y2="13.5" />
                      <line x1="5" y1="25" x2="10" y2="25" />
                      <line x1="41" y1="10" x2="37.5" y2="13.5" />
                      <line x1="47" y1="25" x2="42" y2="25" />
                      <path d="M17 23a9 9 0 1 1 18 0c0 3.6-2 6.5-3.8 8.5-.9 1-1.5 2.1-1.8 3.5h-6.8c-.3-1.4-.9-2.5-1.8-3.5C19 29.5 17 26.6 17 23z" />
                      <line x1="21.5" y1="39" x2="30.5" y2="39" />
                      <line x1="23" y1="42.5" x2="29" y2="42.5" />
                      <path d="M23.5 24.5l2.5-3 2.5 3" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <span className="font-serif font-bold text-xs sm:text-[13px] text-[#0B2545] mt-1.5 tracking-wide">
                    Nitelikli Eğitim
                  </span>
                </div>

                {/* Vertical Divider 2 */}
                <div className="w-[1.5px] h-11 bg-[#DFD6C8] shrink-0" />

                {/* Pillar 3: Kalıcı Değerler */}
                <div className="flex-1 flex flex-col items-center text-center px-1 sm:px-2 group">
                  <div className="w-10 h-10 flex items-center justify-center text-[#008EA9] group-hover:scale-105 transition-transform duration-300">
                    <svg
                      viewBox="0 0 52 52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 sm:w-9 sm:h-9"
                    >
                      <path d="M19 44c4-5 6-13 5-21" strokeWidth="2.2" />
                      <path d="M22 30c-6-1-11.5-6-13.5-11.5 5 0 11.5 2.5 13.5 11.5z" />
                      <line x1="19" y1="28" x2="12" y2="23" strokeWidth="1.5" />
                      <path d="M23 28c6-3.5 12-4.5 16-2-1.5 4.5-6 9.5-16 2z" />
                      <line x1="26" y1="27" x2="34" y2="26" strokeWidth="1.5" />
                      <path d="M24 23c2.5-8 8.5-13.5 14-14.5-1 5.5-2.5 10-14 14.5z" />
                      <line x1="27" y1="20" x2="34" y2="13.5" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="font-serif font-bold text-xs sm:text-[13px] text-[#0B2545] mt-1.5 tracking-wide">
                    Kalıcı Değerler
                  </span>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/hakkinda"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-[#061A33] hover:bg-[#0D3156] text-white text-xs sm:text-sm font-bold shadow-lg transition-all text-center cursor-pointer"
              >
                <span>Vizyon ve Tarihçeyi Oku</span>
                <ArrowRight className="w-4 h-4 text-[#4DA3FF]" />
              </Link>

              <Link
                href="/basvuru"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-slate-300 hover:border-[#061A33] text-[#061A33] text-xs sm:text-sm font-bold transition-all text-center cursor-pointer"
              >
                <span>Delege Başvuru Formu</span>
              </Link>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: GERİ GETİRİLEN GÖRSEL & ALINTI KARTI                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#061A33] flex flex-col md:flex-row items-stretch border border-slate-800">
              
              {/* Photo / Emblem from CMS or default */}
              <div className="relative w-full md:w-3/5 h-64 sm:h-72 md:h-96">
                <Image
                  src={imageUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80"}
                  alt="İrfan Meclisi"
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#061A33]/80 md:block hidden" />
              </div>

              {/* Attached dark navy quote panel */}
              <div className="w-full md:w-2/5 bg-[#061A33] p-6 sm:p-8 flex flex-col justify-center text-white relative">
                <p className="font-serif italic text-lg sm:text-xl text-white/95 leading-relaxed">
                  {quote}
                </p>
                <div className="w-12 h-0.5 bg-[#4DA3FF] mt-4" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
