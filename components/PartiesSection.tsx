'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Flag, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Landmark, 
  Award,
  Vote,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';
import { PartyGroup, PartiesSectionCMS } from '@/lib/cmsStorage';

interface PartiesSectionProps {
  data?: PartiesSectionCMS;
}

export function PartyDetailModal({
  party,
  isOpen,
  onClose,
  totalSeats = 250
}: {
  party: PartyGroup | null;
  isOpen: boolean;
  onClose: () => void;
  totalSeats?: number;
}) {
  if (!isOpen || !party) return null;

  const partyColor = party.color || '#00B4D8';
  const seats = Number(party.seatsCount) || 0;
  const percentage = ((seats / totalSeats) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#06182e] border border-[#183659] rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col">
        
        {/* Header with Party Color Accent */}
        <div 
          className="relative p-6 sm:p-8 border-b border-white/10"
          style={{
            background: `linear-gradient(135deg, ${partyColor}22 0%, #06182e 100%)`
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {party.logoUrl ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/10 p-2 border border-white/20 shrink-0">
                  <Image 
                    src={party.logoUrl} 
                    alt={party.name} 
                    fill 
                    className="object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-serif font-black text-xl shadow-lg shrink-0"
                  style={{ backgroundColor: partyColor }}
                >
                  {party.shortName || 'IGM'}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: partyColor }}
                  >
                    {party.shortName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#183659] text-slate-200 border border-white/10">
                    {seats} Delege Sandalyesi • %{percentage}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {party.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#092746] text-slate-400 hover:text-white hover:bg-[#183659] transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {party.slogan && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs sm:text-sm text-slate-200 italic font-serif flex items-center gap-2">
                <span className="text-[#4DA3FF] text-lg leading-none">“</span>
                {party.slogan}
                <span className="text-[#4DA3FF] text-lg leading-none">”</span>
              </p>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {/* Lider & Temsilci Bilgisi */}
          {party.leaderName && (
            <div className="p-4 rounded-2xl bg-[#030d1a] border border-[#183659] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: `${partyColor}33`, color: partyColor }}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">Grup Temsilcisi / Sözcüsü</span>
                  <span className="text-sm font-bold text-white">{party.leaderName}</span>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#06182e] border border-white/10 text-cyan-300">
                Meclis Grubu
              </span>
            </div>
          )}

          {/* Vizyon ve Duruş */}
          <div>
            <h4 className="text-white font-semibold mb-2 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4DA3FF]" />
              Grup Vizyonu ve Yasama Yaklaşımı
            </h4>
            <p className="leading-relaxed text-slate-300 text-xs sm:text-sm whitespace-pre-line bg-[#030d1a]/50 p-4 rounded-2xl border border-white/5">
              {party.description || 'Bu grup İrfan Meclisi simülasyonunda delegeleri temsil eder.'}
            </p>
          </div>

          {/* Temel İlkeler */}
          {party.principles && party.principles.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Temel İlkeler & Yasama Öncelikleri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {party.principles.map((principle, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[#030d1a] border border-[#183659]"
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: partyColor }}
                    />
                    <span className="text-xs sm:text-sm text-slate-200 font-medium">{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meclis Simülasyonundaki Rolü Bilgilendirme */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-cyan-300 block flex items-center gap-1.5">
              <Landmark className="w-4 h-4" />
              Komisyon ve Genel Kurul Süreci
            </span>
            <p className="leading-relaxed">
              Her delege, başvurusunda kabul edildiği ihtisas komisyonunda kendi grubu adına müzakere yürütür, kanun maddeleri teklif eder ve Genel Kurul oturumlarında grup disipliniyle oylamaya katılır.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-[#030d1a] border-t border-[#183659] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            250 Asil Delege İçin Siyasi Simülasyon Dağılımı
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-xs font-semibold hover:bg-white/5 transition-colors"
            >
              Kapat
            </button>
            <Link
              href="/basvuru"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-black font-bold text-xs shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
              style={{ backgroundColor: partyColor }}
            >
              <span>Meclise Delege Olarak Başvur</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PartiesSection({ data }: PartiesSectionProps) {
  const [selectedParty, setSelectedParty] = useState<PartyGroup | null>(null);

  const parties = data?.parties && data.parties.length > 0 ? data.parties : [];
  const tag = data?.tag || '— MECLİS GRUPLARI & SİYASİ YAPILANMA';
  const heading = data?.heading || 'Temsil Edilen Meclis Partileri';
  const description = data?.description || 'İrfan Meclisi simülasyonunda 250 asil delegenin fikirlerini, kanun tekliflerini ve Genel Kurul müzakerelerini yürüttüğü temsil grupları.';

  const totalSeats = parties.reduce((acc, p) => acc + (Number(p.seatsCount) || 0), 0) || 250;

  if (parties.length === 0) {
    return null;
  }

  return (
    <section id="partiler" className="py-20 bg-gradient-to-b from-[#020B16] via-[#041224] to-[#020B16] border-t border-[#183659]/60 relative overflow-hidden scroll-mt-28">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#4DA3FF]/10 border border-[#4DA3FF]/30 text-[#4DA3FF] uppercase tracking-wider mb-4">
            <Flag className="w-3.5 h-3.5" />
            <span>{tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            {heading}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {description}
          </p>
        </div>

        {/* PARLIAMENT SEAT DISTRIBUTION BAR (Meclis Koltuk Dağılımı Çubuğu) */}
        <div className="mb-14 p-6 rounded-3xl bg-[#06182e] border border-[#183659]/70 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0D3156] text-[#4DA3FF] flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Meclis Genel Kurulu Sandalye Dağılımı</h3>
                <p className="text-[11px] text-slate-400">8 İhtisas Komisyonu genelinde 250 asil delege kontenjanı</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-[#030a14] px-3.5 py-1.5 rounded-xl border border-cyan-500/20">
              <Users className="w-3.5 h-3.5" />
              <span>Toplam {totalSeats} Delege</span>
            </div>
          </div>

          {/* Segmented Parliament Bar */}
          <div className="h-4 w-full rounded-full overflow-hidden bg-slate-950 flex p-0.5 border border-white/10 shadow-inner">
            {parties.map((party, idx) => {
              const seats = Number(party.seatsCount) || 0;
              const widthPct = ((seats / totalSeats) * 100);
              const partyColor = party.color || '#00B4D8';
              return (
                <div
                  key={party.id || idx}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: partyColor
                  }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:brightness-125 cursor-pointer relative group"
                  onClick={() => setSelectedParty(party)}
                  title={`${party.name} (${party.shortName}): ${seats} Delege (%${widthPct.toFixed(1)})`}
                />
              );
            })}
          </div>

          {/* Legend Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2">
            {parties.map((party, idx) => {
              const seats = Number(party.seatsCount) || 0;
              const partyColor = party.color || '#00B4D8';
              const pct = ((seats / totalSeats) * 100).toFixed(1);
              return (
                <button
                  key={party.id || idx}
                  onClick={() => setSelectedParty(party)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#030a14] hover:bg-[#092746] border border-white/5 hover:border-white/20 transition-all text-left cursor-pointer group"
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full group-hover:scale-125 transition-transform" 
                    style={{ backgroundColor: partyColor }} 
                  />
                  <span className="text-xs font-bold text-white">{party.shortName}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {seats} ({pct}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PARTIES CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {parties.map((party, idx) => {
            const partyColor = party.color || '#00B4D8';
            const seats = Number(party.seatsCount) || 0;
            const percentage = ((seats / totalSeats) * 100).toFixed(1);

            return (
              <div
                key={party.id || idx}
                className="group relative rounded-3xl bg-[#06182e] border border-[#183659]/70 hover:border-cyan-400/50 p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-[#00B4D8]/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                style={{
                  borderLeftWidth: '5px',
                  borderLeftColor: partyColor
                }}
              >
                {/* Subtle Gradient Glow at Corner */}
                <div 
                  className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: partyColor }}
                />

                <div className="space-y-4">
                  {/* Top Bar: Emblem/Monogram, Short Name & Seats Count */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {party.logoUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#030a14] p-1.5 border border-white/10 shrink-0">
                          <Image
                            src={party.logoUrl}
                            alt={party.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif font-black text-base shadow-md shrink-0"
                          style={{ backgroundColor: partyColor }}
                        >
                          {party.shortName || 'IGM'}
                        </div>
                      )}

                      <div>
                        <span 
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white"
                          style={{ backgroundColor: partyColor }}
                        >
                          {party.shortName || `GRUP ${idx + 1}`}
                        </span>
                        <h3 className="text-xl font-serif font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                          {party.name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-mono text-white block">
                        {seats} <span className="text-xs font-normal text-slate-400">Koltuk</span>
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        %{percentage}
                      </span>
                    </div>
                  </div>

                  {/* Slogan */}
                  {party.slogan && (
                    <div className="p-3 rounded-xl bg-[#030a14]/60 border border-white/5">
                      <p className="text-xs text-slate-200 italic font-serif leading-relaxed">
                        “{party.slogan}”
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {party.description}
                  </p>

                  {/* Leader Info */}
                  {party.leaderName && (
                    <div className="flex items-center gap-2 pt-2 text-xs text-slate-300">
                      <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-medium text-slate-200">{party.leaderName}</span>
                    </div>
                  )}

                  {/* Principles Tags */}
                  {party.principles && party.principles.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {party.principles.slice(0, 3).map((pr, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#030a14] border border-white/10 text-slate-300"
                        >
                          {pr}
                        </span>
                      ))}
                      {party.principles.length > 3 && (
                        <span className="px-2 py-1 rounded-lg text-[10px] bg-[#030a14] text-slate-400 border border-white/5">
                          +{party.principles.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-6 mt-4 border-t border-[#183659]/70 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedParty(party)}
                    className="text-xs font-semibold text-[#4DA3FF] hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Detaylı Grup Tüzüğü & İlkeleri</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link
                    href="/basvuru"
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 flex items-center gap-1 text-black shadow-md shrink-0"
                    style={{ backgroundColor: partyColor }}
                  >
                    <span>Başvur</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* DETAIL MODAL */}
        <PartyDetailModal
          party={selectedParty}
          isOpen={!!selectedParty}
          onClose={() => setSelectedParty(null)}
          totalSeats={totalSeats}
        />

      </div>
    </section>
  );
}
