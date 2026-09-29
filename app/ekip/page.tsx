'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Users, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Building2,
  Briefcase
} from 'lucide-react';
import { TEAM_MEMBERS } from '@/lib/data';
import { getStoredCMSData, fetchServerCMSData, CMSData, INITIAL_CMS_DATA } from '@/lib/cmsStorage';
import InnerPageHero from '@/components/InnerPageHero';

export default function TeamPage() {
  const [cmsData, setCmsData] = React.useState<CMSData>(INITIAL_CMS_DATA);

  useEffect(() => {
    setCmsData(getStoredCMSData());
    fetchServerCMSData().then((serverData) => {
      if (serverData) setCmsData(serverData);
    });
    const handleUpdate = () => {
      setCmsData(getStoredCMSData());
    };
    window.addEventListener('igm_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('igm_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Smooth scroll to anchor on navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const isAkademiMember = (member: any) => {
    if (member.teamType === 'akademi') return true;
    if (member.teamType === 'organizasyon') return false;
    return (
      member.category === 'akademik' ||
      member.category === 'komisyon_baskani' ||
      (member.role && member.role.toLowerCase().includes('komisyon'))
    );
  };

  const rawList = cmsData.team && cmsData.team.length > 0 ? cmsData.team : TEAM_MEMBERS;
  
  // Guarantee both sections are populated properly
  const orgFiltered = rawList.filter((m: any) => !isAkademiMember(m));
  const acadFiltered = rawList.filter((m: any) => isAkademiMember(m));

  const organizasyonMembers = orgFiltered.length > 0 
    ? orgFiltered 
    : TEAM_MEMBERS.filter((m: any) => !isAkademiMember(m));

  const akademiMembers = acadFiltered.length > 0 
    ? acadFiltered 
    : TEAM_MEMBERS.filter((m: any) => isAkademiMember(m));

  return (
    <div className="igm-page">
      {/* 1. HERO BANNER */}
      <InnerPageHero
        badge={cmsData.ekipPage?.heroBadge || "GÖNÜLLÜ VE PROFESYONEL KADRO"}
        title={cmsData.ekipPage?.heroTitle || "Organizasyon ve Akademi Ekibi"}
        description={cmsData.ekipPage?.heroDesc || "“Kökümüz İrfan, Sözümüz İstikbal” — İrfan Meclisi'nin planlanmasından oturumların yönetilmesine kadar 3 gün boyunca sahada görev yapan organizasyon birimlerimiz ve komisyonları yöneten akademi kadromuz."}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Ekip' }
        ]}
      />

      {/* 2. BÖLÜM 1: ORGANİZASYON EKİBİ BÖLÜMÜ */}
      <section id="organizasyon-ekibi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-28">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#183659]">
          <div>
            <div className="flex items-center gap-2 text-[#4DA3FF] font-bold text-xs uppercase tracking-wider mb-2">
              <Briefcase className="w-4 h-4" />
              <span>Saha, Lojistik & Divan Heyeti</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
              <span>Organizasyon Ekibi</span>
              <span className="text-xs font-sans font-bold px-2.5 py-1 rounded-full bg-[#4DA3FF]/15 text-[#4DA3FF] border border-[#4DA3FF]/30">
                {organizasyonMembers.length} Üye
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Etkinliğin planlanmasından yürütülmesine, delege kabulünden genel kurul oturumlarına kadar sahada aktif görev alan birimlerimiz.
            </p>
          </div>
        </div>

        {/* Members Grid: Image, Name, Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {organizasyonMembers.map((member: any) => (
            <div
              key={member.id}
              className="group rounded-2xl bg-[#092746] border border-[#4DA3FF]/20 hover:border-[#4DA3FF]/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#4DA3FF]/10 hover:-translate-y-1"
            >
              <div>
                {/* Üyenin Görseli */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 bg-[#061A33] border border-[#4DA3FF]/20">
                  <Image
                    src={member.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={member.fullName || 'Ekip Üyesi'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061A33]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Floating team badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#061A33]/90 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm">
                      Organizasyon
                    </span>
                  </div>
                </div>

                {/* Üyenin İsmi */}
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#4DA3FF] transition-colors leading-snug">
                  {member.fullName}
                </h3>

                {/* Üyenin Görevi */}
                <p className="text-xs font-semibold text-[#4DA3FF] mt-1.5 font-sans leading-relaxed">
                  {member.role}
                </p>

                {/* Üniversite / Kurum Bilgisi */}
                {member.university && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                    <GraduationCap className="w-4 h-4 text-[#4DA3FF] shrink-0" />
                    <span className="truncate">{member.university}</span>
                  </div>
                )}

                {/* Biyografi / Tanım (Opsiyonel) */}
                {member.bio && (
                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* Alt Rozet */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4DA3FF] bg-[#061A33] px-2.5 py-1 rounded-full border border-[#4DA3FF]/20">
                  {member.category ? member.category.replace('_', ' ') : 'Organizasyon'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {member.affiliation || cmsData.ekipPage?.defaultAffiliation || 'ÖNDER Ekibi'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BÖLÜM 2: AKADEMİ EKİBİ BÖLÜMÜ */}
      <section id="akademi-ekibi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-28 border-t border-[#183659]/60">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#183659]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>Bilim, Müfredat & Komisyon Masaları</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
              <span>Akademi Ekibi</span>
              <span className="text-xs font-sans font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {akademiMembers.length} Üye
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              8 ana ihtisas komisyonunda yasa tekliflerini, madde müzakerelerini ve akademik içerik standartlarını yöneten komisyon başkanlarımız ve akademik mentörler.
            </p>
          </div>
        </div>

        {/* Members Grid: Image, Name, Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {akademiMembers.map((member: any) => (
            <div
              key={member.id}
              className="group rounded-2xl bg-[#092746] border border-amber-400/25 hover:border-amber-400/70 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
            >
              <div>
                {/* Üyenin Görseli */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 bg-[#061A33] border border-amber-400/25">
                  <Image
                    src={member.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={member.fullName || 'Akademi Ekip Üyesi'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061A33]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Floating team badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#061A33]/90 text-amber-300 border border-amber-400/30 backdrop-blur-sm">
                      Akademi
                    </span>
                  </div>
                </div>

                {/* Üyenin İsmi */}
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {member.fullName}
                </h3>

                {/* Üyenin Görevi */}
                <p className="text-xs font-semibold text-amber-300 mt-1.5 font-sans leading-relaxed">
                  {member.role}
                </p>

                {/* Üniversite / Kurum Bilgisi */}
                {member.university && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                    <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{member.university}</span>
                  </div>
                )}

                {/* Biyografi / Tanım (Opsiyonel) */}
                {member.bio && (
                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* Alt Rozet */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-[#061A33] px-2.5 py-1 rounded-full border border-amber-400/25">
                  {member.category ? member.category.replace('_', ' ') : 'Akademi'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {member.affiliation || cmsData.ekipPage?.defaultAffiliation || 'ÖNDER Ekibi'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BOTTOM JOIN CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#092746] to-[#0D3156] border border-[#4DA3FF]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Geleceği Birlikte İnşa Edelim
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Komisyon çalışmalarında delege olmak veya organizasyon ekibine katılmak için başvuru formunu doldurun.
            </p>
          </div>
          <Link
            href="/basvuru"
            className="px-8 py-4 rounded-full bg-[#4DA3FF] hover:bg-[#258BF5] text-[#061A33] font-bold text-sm shadow-xl hover:shadow-[#4DA3FF]/30 transition-all shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#061A33]" />
            <span>Hemen Başvuru Yap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
