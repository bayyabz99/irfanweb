'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Sparkles, ArrowRight, Search, CheckCircle2, FileText, Users } from 'lucide-react';
import { COMMISSIONS } from '@/lib/data';
import { getStoredCMSData, fetchServerCMSData, CMSData, INITIAL_CMS_DATA } from '@/lib/cmsStorage';
import CommissionCard from '@/components/CommissionCard';
import InnerPageHero from '@/components/InnerPageHero';

export default function CommissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
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

  // Smooth scroll to hash section when navigated from another page
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

  const commissionsList = cmsData.commissions && cmsData.commissions.length > 0 ? cmsData.commissions : COMMISSIONS;

  const filteredCommissions = commissionsList.filter((c: any) => {
    const name = c.name || c.title || '';
    const shortName = c.shortName || c.shortTitle || '';
    const desc = c.description || c.summary || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="igm-page">
      {/* 1. HERO BANNER */}
      <InnerPageHero
        badge="MÜZAKERE VE KANUN YAPMA MASALARI"
        title="8 Ana İhtisas Komisyonu"
        description="Her komisyon, ilgili alanda akademik ve sivil toplum deneyimine sahip başkanlar ile raportörler rehberliğinde çalışır. Komisyon detaylarına tıklayarak tartışılacak konuları, yasa hedeflerini inceleyebilir ve doğrudan başvuru yapabilirsiniz."
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Komisyonlar' }
        ]}
        actionButton={{
          label: 'Delege Başvurusu Yap',
          href: '/basvuru'
        }}
      />

      {/* 2. SEARCH & OVERVIEW BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="p-6 rounded-3xl bg-[#06182e] border border-[#183659]/70 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl igm-icon">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">İhtisas Alanınızı Seçin</h3>
              <p className="text-xs text-slate-300">Toplam 8 komisyonda 250 delege görev alacaktır.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#4DA3FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Komisyon veya konu ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#030a14] border border-[#183659] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 8 KOMİSYON GRID */}
      <section id="komisyonlar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCommissions.map((commission, idx) => (
            <div key={commission.id} id={commission.id}>
              <CommissionCard 
                commission={commission} 
                number={String(idx + 1).padStart(2, '0')}
              />
            </div>
          ))}
        </div>

        {filteredCommissions.length === 0 && (
          <div className="mt-6">
            <p className="text-slate-300 text-sm">Aradığınız kriterlere uygun komisyon bulunamadı.</p>
          </div>
        )}
      </section>

      {/* 4. KOMİSYON İŞLEYİŞİ & KURALLAR (Executive Section) */}
      <section className="py-16 bg-[#06182e]/40 border-y border-[#183659]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 uppercase tracking-wider">
              Prosedür & Süreç
            </span>
            <h2 className="mt-4 text-3xl font-serif font-bold text-white">
              Komisyon Çalışma Disiplini
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Meclis simülasyonu süresince komisyonlarda izlenecek demokratik yasa yapım aşamaları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-[#06182e] border border-[#183659]/70 shadow-lg space-y-4">
              <div className="w-10 h-10 rounded-xl igm-icon font-serif font-bold text-lg">
                01
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Madde Müzakeresi</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Komisyon raportörleri tarafından sunulan taslak kanun maddeleri üzerinde delegeler söz alarak görüş bildirir ve lehte/aleyhte argümanlar sunar.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#06182e] border border-[#183659]/70 shadow-lg space-y-4">
              <div className="w-10 h-10 rounded-xl igm-icon font-serif font-bold text-lg">
                02
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Değişiklik Önergeleri</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Delegeler yasa metnini zenginleştirmek veya düzeltmek amacıyla yazılı değişiklik önergeleri verir; önergeler oylanarak metne işlenir.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#06182e] border border-[#183659]/70 shadow-lg space-y-4">
              <div className="w-10 h-10 rounded-xl igm-icon font-serif font-bold text-lg">
                03
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Genel Kurul Oylaması</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Komisyonda kabul edilen nihai kanun teklifi, 250 delegenin katıldığı Genel Kurul oturumunda oylanarak ÖNDER İrfan Meclisi Bildirisi'ne dahil edilir.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 6. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#06182e] border border-cyan-400/25 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Seçtiğiniz Masada Fikrinizi Yasalaştırın
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              23-24-25 Ekim tarihlerinde Selçuklu Kongre Merkezi'nde gerçekleşecek oturumlarda yerinizi ayırtın.
            </p>
          </div>
          <Link
            href="/basvuru"
            className="px-8 py-4 rounded-full bg-[#4DA3FF] hover:bg-[#38bdf8] text-[#020B16] font-bold text-sm shadow-[0_8px_24px_-6px_rgba(56,189,248,0.5)] transition-all shrink-0 flex items-center gap-2"
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
