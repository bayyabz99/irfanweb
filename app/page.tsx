'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Layers, 
  Calendar, 
  Award, 
  ArrowRight, 
  Play, 
  Scale, 
  GraduationCap, 
  QrCode,
  Landmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  MapPin,
  FileText,
  Clock,
  Globe,
  Shield,
  HeartPulse,
  Crosshair,
  Compass
} from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import CommissionCard from '@/components/CommissionCard';
import SponsorsMarquee from '@/components/SponsorsMarquee';
import VideoModal from '@/components/VideoModal';
import WhyIrfanMeclisi from '@/components/WhyIrfanMeclisi';
import { COMMISSIONS, PROGRAM_DAYS, FAQ_ITEMS } from '@/lib/data';
import { getStoredCMSData, fetchServerCMSData, CMSData, INITIAL_CMS_DATA } from '@/lib/cmsStorage';

const iconComponentMap: Record<string, any> = {
  Users,
  Landmark,
  GraduationCap,
  QrCode,
  Scale,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Globe,
  Shield,
  HeartPulse,
  Crosshair,
  Compass
};

export default function HomePage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [atmosphereIndex, setAtmosphereIndex] = useState(0);
  const [cmsData, setCmsData] = useState<CMSData>(INITIAL_CMS_DATA);

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

  const hp = cmsData.homepage || INITIAL_CMS_DATA.homepage;
  const settings = cmsData.siteSettings || INITIAL_CMS_DATA.siteSettings;

  // Stats dynamically read from CMS or fallback
  const rawStats = hp.stats && hp.stats.length > 0 ? hp.stats : INITIAL_CMS_DATA.homepage.stats;
  const stats = rawStats.map((s, idx) => ({
    ...s,
    icon: idx === 0 ? Users : idx === 1 ? Layers : idx === 2 ? Award : Calendar
  }));

  // Atmosphere photos from CMS
  const atmospherePhotos = hp.atmosphere?.photos && hp.atmosphere.photos.length > 0 
    ? hp.atmosphere.photos 
    : INITIAL_CMS_DATA.homepage.atmosphere.photos;

  const nextAtmosphere = () => {
    setAtmosphereIndex((prev) => (prev + 1) % atmospherePhotos.length);
  };

  const prevAtmosphere = () => {
    setAtmosphereIndex((prev) => (prev - 1 + atmospherePhotos.length) % atmospherePhotos.length);
  };

  const features = hp.features && hp.features.length > 0
    ? hp.features
    : INITIAL_CMS_DATA.homepage.features;

  const commissionsList = cmsData.commissions && cmsData.commissions.length > 0
    ? cmsData.commissions
    : COMMISSIONS;

  const programDays = cmsData.program && cmsData.program.length > 0
    ? cmsData.program
    : PROGRAM_DAYS;

  const currentAtmosphereSlice = atmospherePhotos.length <= 3 
    ? atmospherePhotos 
    : [
        atmospherePhotos[atmosphereIndex % atmospherePhotos.length],
        atmospherePhotos[(atmosphereIndex + 1) % atmospherePhotos.length],
        atmospherePhotos[(atmosphereIndex + 2) % atmospherePhotos.length]
      ];

  return (
    <div className="min-h-screen bg-[#061A33] text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (BİREBİR REFERANS GÖRSEL TASARIMI)                        */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden flex items-center min-h-screen min-h-[100dvh] sm:min-h-[720px] md:min-h-[780px] lg:min-h-[calc(100vw*575/1024)]">
        
        {/* Background Image: Managed via CMS */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={hp.heroBgImage || "/images/anasayfa-arkaplan.png"}
            alt={settings.siteName || "İrfan Meclisi"}
            fill
            sizes="100vw"
            priority
            className="object-cover"
            style={{ objectPosition: 'center top' }}
          />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 w-full pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-12 sm:pb-14 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Title, Subtitle, Countdown, CTA */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">

              {/* Main Title in Serif */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-serif font-black tracking-tight leading-[1.15] break-words">
                <span className="text-[#4DA3FF] block">{hp.heroTitle || 'İRFAN MECLİSİ'}</span>
                <span className="text-white block text-sm sm:text-lg md:text-xl lg:text-2xl font-sans font-semibold tracking-wide mt-1.5 sm:mt-2">{hp.heroPrefix || 'ÖNDER DERNEĞİ KATKILARIYLA'}</span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-lg md:text-xl text-slate-200 font-serif italic max-w-xl leading-relaxed">
                {hp.heroDesc || "“Kökümüz İrfan, Sözümüz İstikbal”"}
              </p>

              {/* Countdown Timer Component with CMS dynamic target date & text */}
              <div className="pt-1 sm:pt-2">
                <CountdownTimer 
                  targetDate={settings.targetDate || "2026-10-23T09:00:00+03:00"} 
                  countdownText={settings.countdownText}
                />
              </div>

              {/* Modern Rectangular CTA Buttons (matching site aesthetics) */}
              <div className="pt-8 sm:pt-4 mt-2 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full max-w-md">
                <Link
                  href="/basvuru"
                  className="group relative w-full sm:flex-1 inline-flex items-center justify-center h-12 sm:h-[52px] min-h-[48px] shrink-0 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-[#00A8C6] via-[#008ea9] to-[#006e85] hover:from-[#00bde0] hover:to-[#007f99] border border-[#00d2ff]/50 hover:border-[#00d2ff] text-white font-serif font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[#0089a8]/35 hover:shadow-[0_0_24px_rgba(0,180,216,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none"
                >
                  <span className="flex items-center gap-2.5 drop-shadow-sm">
                    <span>Delege Başvuru Formu</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="group relative w-full sm:flex-1 inline-flex items-center justify-center h-12 sm:h-[52px] min-h-[48px] shrink-0 px-5 sm:px-6 rounded-xl bg-[#051829]/85 hover:bg-[#092842]/95 backdrop-blur-md border border-[#4DA3FF]/35 hover:border-[#4DA3FF]/80 text-white font-serif font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-black/40 hover:shadow-[0_0_20px_rgba(77,163,255,0.25)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none"
                >
                  <span className="flex items-center gap-2.5 drop-shadow-sm">
                    <Play className="w-4 h-4 fill-[#00d2ff] text-[#00d2ff] group-hover:scale-110 transition-transform" />
                    <span>Tanıtım Filmi</span>
                  </span>
                </button>
              </div>

            </div>

            {/* Right Column: Editorial Quote Text Overlay (positioned further right per user request) */}
            <div className="hidden lg:flex lg:col-span-5 justify-end lg:pr-2 xl:pr-6 2xl:pr-10 lg:translate-x-6 xl:translate-x-12 2xl:translate-x-16">
              <div className="text-right space-y-2">
                <p className="font-serif italic text-4xl xl:text-5xl 2xl:text-6xl text-white/95 font-light leading-tight tracking-wide whitespace-pre-line drop-shadow-md">
                  {hp.editorialQuote || "Fikir\nÜreten\nGençlik\nMeclisi"}
                </p>
                <div className="w-20 h-1 bg-[#4DA3FF] ml-auto mt-4 rounded-full shadow-sm" />
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. NEDEN İRFAN MECLİSİ SECTION (BİREBİR REFERANS GÖRSEL TASARIMI)        */}
      {/* ========================================================================= */}
      <WhyIrfanMeclisi 
        tag={hp.aboutSummary?.tag}
        heading={hp.aboutSummary?.heading}
        paragraph={hp.aboutSummary?.paragraph}
        quote={hp.aboutSummary?.quote}
        imageUrl={hp.aboutSummary?.imageUrl}
      />

      {/* ========================================================================= */}
      {/* 3. FOUR-COLUMN FEATURE STRIP (BİREBİR REFERANS GÖRSEL TASARIMI)           */}
      {/* ========================================================================= */}
      <section className="bg-[#061A33] border-b border-blue-900/30 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {features.map((feat, idx) => {
              const IconComponent = iconComponentMap[feat.iconName] || Users;
              return (
                <div 
                  key={idx} 
                  className={`pt-6 sm:pt-0 sm:px-6 flex flex-col items-center text-center space-y-3 ${
                    idx === 0 ? 'first:pl-0' : ''
                  } ${idx === features.length - 1 ? 'last:pr-0' : ''}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#092746] border border-[#4DA3FF]/30 flex items-center justify-center text-[#4DA3FF] mb-1">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                    {feat.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EVENT ATMOSPHERE SHOWCASE (BİREBİR REFERANS GÖRSEL TASARIMI)           */}
      {/* ========================================================================= */}
      <section className="bg-[#030D1A] py-20 border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-xl">
              <div className="text-xs font-bold tracking-wider text-[#4DA3FF] uppercase">
                {hp.atmosphere?.tag || "— ETKİNLİKTE YAŞAMAK İÇİN"}
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
                {hp.atmosphere?.heading || "Geleceğin Liderleri Burada Buluşuyor"}
              </h2>
              <p className="text-sm text-slate-400 font-sans">
                {hp.atmosphere?.description || "İrfan Meclisi, fikirlerin gerçeğe dönüştüğü, gençliğin gücünün hissedildiği bir platformdur."}
              </p>
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevAtmosphere}
                className="w-10 h-10 rounded-full border border-slate-700 bg-[#092746] hover:bg-[#0D3156] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Önceki Fotoğraf"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextAtmosphere}
                className="w-10 h-10 rounded-full border border-slate-700 bg-[#092746] hover:bg-[#0D3156] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Sonraki Fotoğraf"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 3 Photo Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAtmosphereSlice.map((photo, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#092746] border border-white/10 shadow-xl transition-all duration-300 hover:border-[#4DA3FF]/50"
              >
                <Image
                  src={photo.url}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030D1A] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[11px] text-[#4DA3FF] font-semibold block mb-0.5">
                    {photo.subtitle}
                  </span>
                  <h3 className="text-base font-serif font-bold text-white">
                    {photo.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRESERVED: SAYILARLA İRFAN GENÇ MECLİSİ 2026                            */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. RAKAMLARLA İRFAN MECLİSİ (BİREBİR REFERANS GÖRSEL TASARIMI)             */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. SAYILARLA İRFAN MECLİSİ (SADE & ORTALI SİTE TEMASI)                    */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 lg:py-20 bg-[#061A33] border-b border-blue-900/30 text-white relative overflow-hidden">
        {/* Arka Plan Zarif Işıma Detayı */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#4DA3FF]/5 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Bölüm Başlığı & Rozet (Ortalı & Sade) */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-8 sm:w-12 h-[1px] bg-[#4DA3FF]/40" />
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider bg-[#092746] text-[#4DA3FF] border border-[#4DA3FF]/30 uppercase select-none">
                {hp.statsSection?.tag || "RAKAMLARLA MECLİS"}
              </span>
              <div className="w-8 sm:w-12 h-[1px] bg-[#4DA3FF]/40" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-black text-white tracking-tight leading-tight">
              {hp.statsSection?.heading || "Sayılarla İrfan Meclisi 2026"}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
              {hp.statsSection?.description || "Dünya Selçuklu Kongre Merkezi'nde gerçekleşecek tarihi buluşmanın organizasyon gücü ve delege kapasitesi."}
            </p>
          </div>

          {/* İstatistik Kartları (Ortalı, Sade ve Görselsiz Kompakt Düzen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {stats.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 sm:p-7 rounded-2xl bg-[#092746]/60 hover:bg-[#092746] border border-[#4DA3FF]/15 hover:border-[#4DA3FF]/40 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:shadow-black/30"
                >
                  {/* Ortalı İkon Yuvası */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#0D3156] border border-[#4DA3FF]/30 flex items-center justify-center text-[#4DA3FF] mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <IconComp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />
                  </div>

                  {/* Büyük Stat Rakamı & Artı */}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl sm:text-5xl font-sans font-black text-white tracking-tight leading-none">
                      {item.value}
                    </span>
                    {item.suffix && (
                      <span className="text-2xl sm:text-3xl font-bold text-[#4DA3FF]">
                        {item.suffix}
                      </span>
                    )}
                  </div>

                  {/* Başlık */}
                  <h3 className="mt-3 text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                    {item.label}
                  </h3>

                  {/* Mavi Vurgu Çizgisi */}
                  <div className="w-8 h-0.5 bg-[#4DA3FF] rounded-full my-2.5" />

                  {/* Açıklama */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xs">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PRESERVED: 8 İHTİSAS MASASI (KOMİSYONLAR) ÖNİZLEME VİTRİNİ             */}
      {/* ========================================================================= */}
      <section className="py-24 bg-[#030D1A] border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-[#4DA3FF] uppercase mb-2 block">
                {hp.commissionsSection?.tag || "— GELECEĞE YÖN VEREN MASALAR"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                {hp.commissionsSection?.heading || "8 İhtisas Komisyonu"}
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                {hp.commissionsSection?.description || "Her komisyon, alanında uzman mentörler ve raportörler eşliğinde Türkiye'nin ve dünyanın stratejik meselelerini masaya yatırır."}
              </p>
            </div>

            <Link
              href="/komisyonlar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#092746] hover:bg-[#0D3156] border border-[#4DA3FF]/30 text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
            >
              <span>Tüm Komisyonları İncele</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#4DA3FF]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {commissionsList.map((commission, idx) => (
              <CommissionCard
                key={commission.id}
                commission={commission}
                number={`0${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRESERVED: 3 GÜNLÜK MECLİS ZİRVESİ PROGRAM ÖZETİ                       */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#061A33] border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#0D3156] border border-[#4DA3FF]/30 text-[#4DA3FF] uppercase tracking-wider">
              {hp.programSection?.tag || "Meclis Takvimi"}
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {hp.programSection?.heading || "Üç Günlük Zirve Akışı"}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {hp.programSection?.description || "23-24-25 Ekim 2026 Selçuklu Kongre Merkezi'nde adım adım meclis heyecanı."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programDays.map((day) => (
              <div
                key={day.dayNumber}
                className="p-6 rounded-2xl bg-[#092746] border border-[#4DA3FF]/20 flex flex-col justify-between hover:border-[#4DA3FF]/50 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0D3156] text-[#4DA3FF] border border-[#4DA3FF]/30">
                      {day.dayNumber}. GÜN
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {day.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-white mb-2">
                    {day.title}
                  </h3>
                  <p className="text-xs text-[#4DA3FF] font-medium mb-4">
                    {day.theme}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-700/50 text-xs text-slate-300">
                    {day.sessions.slice(0, 3).map((sess) => (
                      <div key={sess.id} className="flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-mono text-slate-400 mr-1.5">{sess.time}</span>
                          <span className="text-slate-200">{sess.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/program"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-[#0D3156] hover:bg-[#258BF5] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Günün Detaylı Akışı</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PRESERVED: SPONSORS & DESTEKÇİLER ŞERİDİ                                */}
      {/* ========================================================================= */}
      <SponsorsMarquee sponsors={hp.sponsors} />

      {/* ========================================================================= */}
      {/* 9. PRESERVED: SIKÇA SORULAN SORULAR (FAQ)                                 */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#030D1A] border-b border-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#0D3156] border border-[#4DA3FF]/30 text-[#4DA3FF] uppercase tracking-wider">
              Merak Edilenler
            </span>
            <h2 className="mt-3 text-3xl font-serif font-bold text-white tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-4">
            {(hp.faq || FAQ_ITEMS).map((item: any, idx: number) => {
              const isOpen = activeFaq === idx;
              const question = item.question || item.q;
              const answer = item.answer || item.a;
              return (
                <div
                  key={item.id || idx}
                  className="rounded-xl bg-[#092746] border border-[#4DA3FF]/15 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 text-white font-serif font-semibold text-base hover:text-[#4DA3FF] transition-colors cursor-pointer"
                  >
                    <span>{question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#4DA3FF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-700/40">
                      {answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. PRESERVED: FİNAL DELEGE BAŞVURU ÇAĞRISI                               */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#061A33]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#092746] to-[#0D3156] border border-[#4DA3FF]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-3xl font-serif font-bold text-white">
                {hp.finalCta?.heading || "Geleceğin Meclisinde Yerinizi Alın"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                {hp.finalCta?.description || "250 asil delege kontenjanı için başvurular devam etmektedir. Kişisel QR kodlu biletiniz başvuru sonrası anında oluşturulur."}
              </p>
            </div>
            <Link
              href="/basvuru"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#258BF5] hover:bg-[#1e7bdc] text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-900/50 transition-all shrink-0 transform hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{hp.finalCta?.buttonText || "Delege Başvuru Formuna Git"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal Trigger */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={cmsData.aboutPage?.timav?.videoUrl}
        title="İrfan Meclisi 2026 Tanıtım Filmi"
      />

    </div>
  );
}
