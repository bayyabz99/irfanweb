'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import TimavLogo from './TimavLogo';
import { COMMISSIONS } from '@/lib/data';
import { getStoredCMSData, fetchServerCMSData, CMSData, INITIAL_CMS_DATA } from '@/lib/cmsStorage';

// Custom X (Twitter) icon
function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Custom Instagram icon
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

// Custom Youtube icon
function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
    </svg>
  );
}


export default function Footer() {
  const pathname = usePathname();
  const [cmsData, setCmsData] = useState<CMSData>(INITIAL_CMS_DATA);

  useEffect(() => {
    setCmsData(getStoredCMSData());
    fetchServerCMSData().then((serverData) => {
      if (serverData) setCmsData(serverData);
    });
    const handleUpdate = () => setCmsData(getStoredCMSData());
    window.addEventListener('igm_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('igm_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (pathname?.startsWith('/profil') || pathname?.startsWith('/admin-igm-secret-dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  const contact = cmsData.contact || INITIAL_CMS_DATA.contact;
  const settings = cmsData.siteSettings || INITIAL_CMS_DATA.siteSettings;
  const commissionsList = cmsData.commissions && cmsData.commissions.length > 0 ? cmsData.commissions : COMMISSIONS;

  return (
    <footer className="bg-[#030D1A] border-t border-blue-900/30 text-slate-400 relative overflow-hidden">
      
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-[#4DA3FF]/5 blur-[120px] pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Top 3-Column Executive Grid (Matching screenshot layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1 (5 cols): Left Branding & Mission */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#4DA3FF]/40 shadow-lg shadow-[#061A33] bg-[#061A33] group-hover:scale-105 group-hover:border-[#4DA3FF] transition-all">
                <Image
                  src="/logo.png"
                  alt="İrfan Meclis Simülasyonu"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#4DA3FF] font-medium leading-none mb-1">
                  {settings.organizationName ? `${settings.organizationName.toUpperCase()}` : 'ÖNDER DERNEĞİ ÖNCÜLÜĞÜNDE'}
                </span>
                <span className="text-xl font-serif font-black tracking-tight text-white leading-tight">
                  {settings.siteName ? settings.siteName.toUpperCase() : 'İRFAN MECLİSİ'}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-6 mt-4">
              ÖNDER İmam Hatipliler Derneği öncülüğünde “Kökümüz İrfan, Sözümüz İstikbal” anlayışıyla hayata geçirilen İrfan Meclisi; kadim irfan geleneğimizi çağdaş meclis simülasyonuyla buluşturarak, geleceğin lider gençlerini ortak akıl, yasa yapma kültürü ve medeniyet inşasında bir araya getiriyor.
            </p>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4DA3FF] shrink-0" />
                <span>23-24-25 Ekim 2026 • Selçuklu Kongre Merkezi (SKM), Konya</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/basvuru"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#092746] hover:bg-[#0D3156] border border-[#4DA3FF]/30 text-white text-xs font-semibold transition-all group"
              >
                <span>Delege Başvuru Formu</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#4DA3FF] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Col 2 (3 cols): Center Contact (Matching screenshot) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
              İletişim
            </h4>
            
            <div className="space-y-3 text-xs text-slate-300">
              {contact.phoneCoord && (
                <a 
                  href={`tel:${contact.phoneCoord.replace(/\s+/g, '')}`} 
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4DA3FF] shrink-0" />
                  <span>{contact.phoneCoord}</span>
                </a>
              )}
              {contact.phoneTimav && (
                <a 
                  href={`tel:${contact.phoneTimav.replace(/\s+/g, '')}`} 
                  className="flex items-center gap-2.5 hover:text-white transition-colors text-slate-400"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{contact.phoneTimav}</span>
                </a>
              )}
              {contact.email && (
                <a 
                  href={`mailto:${contact.email.split('/')[0].trim()}`} 
                  className="flex items-center gap-2.5 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#4DA3FF] shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact.address && (
                <div className="flex items-start gap-2.5 text-slate-400 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#4DA3FF] shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 3 (4 cols): Right Slogan & Socials */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-6 md:pl-4">
            <div>
              <p className="font-serif italic text-xl sm:text-2xl text-white font-normal leading-snug">
                “{settings.slogan ? settings.slogan.split(',')[0] || 'Kökümüz İrfan' : 'Kökümüz İrfan'}, <br />
                <span className="text-[#4DA3FF] font-semibold">{settings.slogan ? settings.slogan.split(',')[1] || 'Sözümüz İstikbal' : 'Sözümüz İstikbal'}”</span>
              </p>
              <div className="w-16 h-0.5 bg-[#4DA3FF] mt-3" />
            </div>

            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#092746] hover:bg-[#0D3156] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#092746] hover:bg-[#0D3156] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <XIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#092746] hover:bg-[#0D3156] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>

            <div>
              <Link
                href="/admin-igm-secret-dashboard"
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-[#4DA3FF] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Yönetici & Moderatör Masası</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Secondary Navigation Strip: All 8 Commissions & Quick Links (Preserved content) */}
        <div className="py-6 border-b border-slate-800/40 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-[11px] text-slate-400">
          {commissionsList.map((c: any) => (
            <Link
              key={c.id}
              href={`/komisyonlar#${c.id}`}
              className="hover:text-white transition-colors truncate"
            >
              • {c.name}
            </Link>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© İrfan Meclisi. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-5">
            <Link href="/hakkinda" className="hover:text-slate-300 transition-colors">
              KVKK
            </Link>
            <span>|</span>
            <Link href="/hakkinda" className="hover:text-slate-300 transition-colors">
              Gizlilik Politikası
            </Link>
            <span>|</span>
            <Link href="/iletisim" className="hover:text-slate-300 transition-colors">
              İletişim
            </Link>
          </div>
        </div>

        {/* Developer Credit - ZiftStudio */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400">
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white shrink-0 shadow-md border border-slate-700/60 flex items-center justify-center p-0.5">
              <Image 
                src="/ziftstudio.png" 
                alt="Zift Studio Logo" 
                width={28} 
                height={28} 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <p className="text-center font-normal">
              Bu site bir Muhammed Ali Kıtır kuruluşu olan{' '}
              <a 
                href="https://ziftstudio.site" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-[#4DA3FF] font-semibold transition-colors underline underline-offset-4 decoration-[#4DA3FF]/50"
              >
                ZiftStudio.site
              </a>{' '}
              tarafından yapılmıştır.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
