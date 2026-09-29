'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Home,
  Info,
  Layers,
  Users,
  Calendar,
  Image as ImageIcon,
  Mail,
  QrCode,
  ArrowRight,
  User as UserIcon,
  LogOut,
  Flag,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { getCurrentUser, logoutParticipant } from '@/lib/storage';
import { Application } from '@/lib/types';

/* ========================================================================= */
/* Seljuk / Ottoman Gold Active Indicator Ornament                           */
/* ========================================================================= */
function GoldActiveOrnament() {
  return (
    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 pointer-events-none select-none">
      <svg width="60" height="9" viewBox="0 0 60 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#dfbe7a]">
        {/* Left tapered accent line */}
        <line x1="2" y1="4.5" x2="21" y2="4.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.8" />
        {/* Left accent leaf node */}
        <circle cx="22.5" cy="4.5" r="1.1" fill="currentColor" fillOpacity="0.9" />
        {/* Central Seljuk floral-diamond knot motif */}
        <g transform="translate(30, 4.5)">
          <path 
            d="M-4 0 C-4 -2.4, -2.4 -4, 0 -4 C2.4 -4, 4 -2.4, 4 0 C4 2.4, 2.4 4, 0 4 C-2.4 4, -4 2.4, -4 0 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.85" 
          />
          <polygon points="0,-2.3 2.3,0 0,2.3 -2.3,0" fill="currentColor" fillOpacity="0.95" />
        </g>
        {/* Right accent leaf node */}
        <circle cx="37.5" cy="4.5" r="1.1" fill="currentColor" fillOpacity="0.9" />
        {/* Right tapered accent line */}
        <line x1="39" y1="4.5" x2="58" y2="4.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.8" />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileCommissionOpen, setMobileCommissionOpen] = useState(false);
  const [mobileTeamOpen, setMobileTeamOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Application | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Initial check
    setCurrentUser(getCurrentUser());

    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('igm_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('igm_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Admin panelinde sitenin ana navigasyon barını gizle
  if (pathname?.startsWith('/admin-igm-secret-dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  type NavLinkItem = {
    name: string;
    href: string;
    hasDropdown?: boolean;
    subLinks?: {
      name: string;
      href: string;
      targetId?: string;
      desc?: string;
      badge?: string;
      icon?: any;
    }[];
  };

  // Desktop navigation links matching reference
  const navLinks: NavLinkItem[] = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Hakkımızda', href: '/hakkinda' },
    { name: 'Komisyonlar', href: '/komisyonlar' },
    { 
      name: 'Ekip', 
      href: '/ekip',
      hasDropdown: true,
      subLinks: [
        { 
          name: 'Organizasyon Ekibi', 
          href: '/ekip#organizasyon-ekibi', 
          targetId: 'organizasyon-ekibi',
          desc: 'Saha Koordinasyonu, Lojistik & Divan Heyeti',
          badge: 'Saha Kadrosu',
          icon: Users
        },
        { 
          name: 'Akademi Ekibi', 
          href: '/ekip#akademi-ekibi', 
          targetId: 'akademi-ekibi',
          desc: 'Komisyon Başkanları & Akademik Danışmanlar',
          badge: 'Akademik Masalar',
          icon: GraduationCap
        },
      ]
    },
    { name: 'Program', href: '/program' },
    { name: 'Başvuru', href: '/basvuru' },
    { name: 'Galeri', href: '/galeri' },
    { name: 'İletişim', href: '/iletisim' },
  ];

  // Mobile drawer links
  const mobileNavLinks = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Hakkında', href: '/hakkinda', icon: Info },
    { name: 'Komisyonlar', href: '/komisyonlar', icon: Layers },
    { name: 'Ekip', href: '/ekip', icon: Users },
    { name: 'Program & Akış', href: '/program', icon: Calendar },
    { name: 'Medya Galerisi', href: '/galeri', icon: ImageIcon },
    { name: 'İletişim & Ulaşım', href: '/iletisim', icon: Mail },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (pathname?.startsWith('/profil')) {
    return null;
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP & MOBILE HEADER                                                   */}
      {/* Soft rounded bottom, petrol teal gradient, Seljuk pattern overlay         */}
      {/* ========================================================================= */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 w-full px-2 sm:px-4 transition-all duration-300 pointer-events-none ${
          isScrolled ? 'pt-1 sm:pt-1.5' : 'pt-2 sm:pt-2.5'
        }`}
      >
        <div
          className={`pointer-events-auto relative w-full max-w-[1380px] mx-auto transition-all duration-300 ${
            /* Curved corners matching reference design */
            'rounded-2xl sm:rounded-3xl'
          } ${
            isScrolled 
              ? 'bg-gradient-to-b from-[#092530]/98 via-[#061d26]/96 to-[#04161e]/98 backdrop-blur-xl shadow-2xl shadow-[#020b10]/70 border border-[#cca663]/40'
              : 'bg-gradient-to-b from-[#0b2f3d]/94 via-[#08242f]/92 to-[#051a23]/96 backdrop-blur-md shadow-xl shadow-[#020b10]/50 border border-[#cca663]/35'
          }`}
        >
          {/* Subtle Authentic Islamic Geometric / Seljuk Pattern Texture Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.09] mix-blend-screen bg-repeat rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              backgroundImage: `url('/images/nav-pattern.svg')`,
              backgroundSize: '54px 54px',
              maskImage: 'radial-gradient(ellipse 90% 120% at 50% 10%, black 50%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 120% at 50% 10%, black 50%, transparent 95%)',
            }}
            aria-hidden="true"
          />

          {/* Soft ambient center glow behind navigation items */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-8 pointer-events-none opacity-40 bg-gradient-to-b from-[#2dd4bf]/20 to-transparent blur-md rounded-full overflow-hidden"
            aria-hidden="true"
          />

          {/* Inner Header Content Container */}
          <div className="relative w-full mx-auto px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between">
            
            {/* Left: Emblem Logo + "İRFAN MECLİSİ" */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 select-none">
              {/* Circular Emblem with Golden Border Ring */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 border border-[#dfbe7a]/80 shadow-[0_0_14px_rgba(223,190,122,0.25)] bg-[#08242f] group-hover:border-[#f3d99d] group-hover:shadow-[0_0_18px_rgba(223,190,122,0.4)] transition-all duration-300 shrink-0">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="İrfan Meclisi"
                    fill
                    sizes="(max-width: 640px) 40px, 44px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
              </div>

              {/* Title in Elegant Serif */}
              <div className="flex items-center shrink-0">
                <span className="text-base sm:text-lg lg:text-[18px] xl:text-[19px] font-serif font-black tracking-wide text-white leading-tight whitespace-nowrap drop-shadow-sm group-hover:text-[#f8f9fa] transition-colors">
                  İRFAN MECLİSİ
                </span>
              </div>
            </Link>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 whitespace-nowrap">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                if (link.hasDropdown) {
                  const isDropdownOpen = activeDropdown === link.name;
                  return (
                    <div 
                      key={link.name} 
                      className="relative group"
                      onMouseEnter={() => setActiveDropdown(link.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          if (pathname === link.href) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={`relative px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-[13.5px] xl:text-[14px] font-serif transition-all inline-flex items-center gap-1.5 whitespace-nowrap ${
                          active
                            ? 'text-white font-semibold'
                            : 'text-[#c6d7e0] hover:text-white font-normal'
                        }`}
                      >
                        <span className="tracking-wide">{link.name}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#dfbe7a] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#cca663]' : ''}`} />
                        {active && <GoldActiveOrnament />}
                      </Link>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 pt-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="relative p-2.5 rounded-2xl bg-gradient-to-b from-[#092530]/98 via-[#061d26]/98 to-[#04161e]/98 border border-[#cca663]/40 shadow-2xl shadow-[#020b10]/90 backdrop-blur-2xl space-y-1.5 overflow-hidden">
                            {/* Texture inside dropdown */}
                            <div 
                              className="absolute inset-0 pointer-events-none opacity-10 bg-repeat rounded-2xl"
                              style={{
                                backgroundImage: `url('/images/nav-pattern.svg')`,
                                backgroundSize: '40px 40px',
                              }}
                            />
                            
                            {/* Dropdown Header Accent */}
                            <div className="relative px-3 pt-1.5 pb-2 border-b border-[#cca663]/20 flex items-center justify-between">
                              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#dfbe7a]">
                                {link.name} Bölümleri
                              </span>
                              <span className="text-[10px] text-slate-400">Hızlı Bölüm Seçimi</span>
                            </div>

                            {/* Section Items */}
                            {link.subLinks?.map((sub) => {
                              const SubIcon = sub.icon || Users;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={(e) => {
                                    setActiveDropdown(null);
                                    if (pathname === link.href && sub.targetId) {
                                      e.preventDefault();
                                      const el = document.getElementById(sub.targetId);
                                      if (el) {
                                        el.scrollIntoView({ behavior: 'smooth' });
                                        window.history.pushState(null, '', sub.href);
                                      }
                                    }
                                  }}
                                  className="relative flex items-center gap-3 p-2.5 rounded-xl bg-transparent hover:bg-[#0e3b4b]/80 border border-transparent hover:border-[#cca663]/30 transition-all duration-200 group/sub cursor-pointer"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-[#07212b] border border-[#dfbe7a]/30 group-hover/sub:border-[#dfbe7a] group-hover/sub:bg-[#0c3544] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                                    <SubIcon className="w-4 h-4 text-[#dfbe7a] group-hover/sub:scale-110 transition-transform" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white group-hover/sub:text-[#dfbe7a] transition-colors truncate">
                                        {sub.name}
                                      </span>
                                      {sub.badge && (
                                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#dfbe7a]/15 text-[#dfbe7a] border border-[#dfbe7a]/30">
                                          {sub.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-slate-300 block mt-0.5 leading-snug">
                                      {sub.desc}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover/sub:text-[#dfbe7a] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-[13.5px] xl:text-[14px] font-serif transition-all whitespace-nowrap ${
                      active
                        ? 'text-white font-semibold'
                        : 'text-[#c6d7e0] hover:text-white font-normal'
                    }`}
                  >
                    <span className="tracking-wide">{link.name}</span>
                    {active && <GoldActiveOrnament />}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Pill Styled Action Button ("Giriş Yap" / "Profilim") */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profil"
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#cca663]/50 bg-[#0e3b4b]/70 hover:bg-[#124d60]/90 text-white text-xs font-semibold transition-all duration-300 shadow-md shadow-[#04161e]/50 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#dfbe7a]/20 text-[#dfbe7a] border border-[#dfbe7a]/50 flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        currentUser.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="max-w-[110px] truncate">{currentUser.fullName.split(' ')[0]}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#dfbe7a]/20 text-[#dfbe7a] font-sans">Profilim</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logoutParticipant();
                      setCurrentUser(null);
                    }}
                    title="Çıkış Yap"
                    className="p-2 rounded-full border border-[#cca663]/30 bg-[#08242f]/80 hover:bg-red-950/60 hover:border-red-500/50 text-slate-300 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Sleek Pill Login Button (exact match with reference image) */
                <Link
                  href="/giris"
                  className="group inline-flex items-center rounded-full border border-[#2d6477]/75 hover:border-[#dfbe7a]/85 bg-gradient-to-r from-[#0c3340]/90 to-[#0e3c4c]/90 hover:from-[#0e3c4c] hover:to-[#134e63] text-white text-xs font-medium transition-all duration-300 shadow-md shadow-[#04161e]/50 hover:shadow-[0_0_16px_rgba(223,190,122,0.22)] active:scale-95 overflow-hidden"
                >
                  {/* Left User Icon Container */}
                  <span className="flex items-center justify-center pl-3.5 pr-2.5 py-2 border-r border-[#2d6477]/60 group-hover:border-[#dfbe7a]/40 transition-colors">
                    <UserIcon className="w-3.5 h-3.5 text-[#9cd8e6] group-hover:text-[#dfbe7a] transition-colors" />
                  </span>
                  {/* Right Action Text */}
                  <span className="px-3.5 py-2 font-serif font-medium tracking-wide text-[13px]">
                    Giriş Yap
                  </span>
                </Link>
              )}
            </div>

            {/* Mobile Menu & Action Trigger */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              {currentUser ? (
                <Link
                  href="/profil"
                  className="text-xs border border-[#cca663]/50 px-3 py-1.5 rounded-full text-[#dfbe7a] font-semibold bg-[#0e3b4b]/80 flex items-center gap-1.5"
                >
                  <UserIcon className="w-3 h-3" />
                  <span>Profil</span>
                </Link>
              ) : (
                <Link
                  href="/giris"
                  className="text-xs border border-[#2d6477]/75 px-3 py-1.5 rounded-full text-white font-medium bg-[#0c3340]/90 flex items-center gap-1.5"
                >
                  <UserIcon className="w-3 h-3 text-[#9cd8e6]" />
                  <span>Giriş</span>
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl bg-[#08242f]/90 border border-[#cca663]/40 text-[#dfbe7a] hover:text-white shrink-0 cursor-pointer transition-all active:scale-95"
                aria-label={mobileOpen ? "Menüyü Kapat" : "Menüyü Aç"}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE RIGHT-TO-LEFT SLIDE-OVER DRAWER                                     */}
      {/* Enhanced with dark petrol teal, Seljuk pattern texture, gold accents      */}
      {/* ========================================================================= */}
      
      {/* Backdrop Overlay */}
      <div 
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[999] bg-[#020b10]/85 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-[1000] h-full h-[100dvh] w-[85vw] max-w-sm bg-gradient-to-b from-[#092530] via-[#061d26] to-[#04161e] border-l border-[#cca663]/35 shadow-2xl shadow-[#020b10] flex flex-col justify-between p-4 sm:p-5 transition-all duration-300 ease-out transform lg:hidden ${
          mobileOpen ? 'translate-x-0 opacity-100 visible pointer-events-auto' : 'translate-x-full opacity-0 invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobil Gezinme Menüsü"
      >
        {/* Subtle Seljuk pattern inside drawer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-screen bg-repeat"
          style={{
            backgroundImage: `url('/images/nav-pattern.svg')`,
            backgroundSize: '50px 50px',
          }}
          aria-hidden="true"
        />

        {/* 1. Drawer Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-[#cca663]/25 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-full p-0.5 border border-[#dfbe7a]/80 bg-[#08242f] shadow-md shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="İrfan Meclis Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex items-center min-w-0">
              <span className="text-base sm:text-lg font-serif font-black tracking-wide text-white leading-tight truncate">
                İRFAN MECLİSİ
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 rounded-xl bg-[#08242f] border border-[#cca663]/30 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Menüyü Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Drawer Navigation Items */}
        <div className="relative flex-1 py-4 overflow-y-auto space-y-1.5 no-scrollbar">
          {mobileNavLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;

            if (link.href === '/ekip') {
              return (
                <div key={link.name} className="space-y-1">
                  <div className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm transition-all ${
                    active
                      ? 'bg-[#0e3b4b]/90 border border-[#dfbe7a]/50 text-[#dfbe7a] shadow-md font-semibold'
                      : 'text-slate-200 hover:text-white hover:bg-[#0c3340]/60 border border-transparent'
                  }`}>
                    <Link
                      href="/ekip"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#dfbe7a]' : 'text-slate-400'}`} />
                      <span className={`truncate font-serif ${active ? 'text-white font-semibold' : 'text-slate-200'}`}>
                        {link.name}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileTeamOpen(!mobileTeamOpen)}
                      className="p-1.5 text-[#dfbe7a] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      aria-label="Ekip Bölümleri"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileTeamOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {mobileTeamOpen && (
                    <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#dfbe7a]/30 ml-4 animate-in fade-in slide-in-from-top-1 duration-150">
                      <Link
                        href="/ekip#organizasyon-ekibi"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-[#0c3340]/60 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-[#dfbe7a]" />
                        <span>Organizasyon Ekibi</span>
                      </Link>
                      <Link
                        href="/ekip#akademi-ekibi"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-[#0c3340]/60 transition-colors"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Akademi Ekibi</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            if (link.href === '/komisyonlar') {
              return (
                <div key={link.name} className="space-y-1">
                  <div className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm transition-all ${
                    active
                      ? 'bg-[#0e3b4b]/90 border border-[#dfbe7a]/50 text-[#dfbe7a] shadow-md font-semibold'
                      : 'text-slate-200 hover:text-white hover:bg-[#0c3340]/60 border border-transparent'
                  }`}>
                    <Link
                      href="/komisyonlar"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#dfbe7a]' : 'text-slate-400'}`} />
                      <span className={`truncate font-serif ${active ? 'text-white font-semibold' : 'text-slate-200'}`}>
                        {link.name}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileCommissionOpen(!mobileCommissionOpen)}
                      className="p-1.5 text-[#dfbe7a] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      aria-label="Komisyon Bölümleri"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCommissionOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {mobileCommissionOpen && (
                    <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-[#dfbe7a]/30 ml-4 animate-in fade-in slide-in-from-top-1 duration-150">
                      <Link
                        href="/komisyonlar#komisyonlar"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-[#0c3340]/60 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#dfbe7a]" />
                        <span>İhtisas Komisyonları (8 Masa)</span>
                      </Link>
                      <Link
                        href="/komisyonlar-ve-ekip"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>100 Kişilik Ekip Tablosu</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm transition-all ${
                  active
                    ? 'bg-[#0e3b4b]/90 border border-[#dfbe7a]/50 text-[#dfbe7a] shadow-md font-semibold'
                    : 'text-slate-200 hover:text-white hover:bg-[#0c3340]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#dfbe7a]' : 'text-slate-400'}`} />
                  <span className={`truncate font-serif ${active ? 'text-white font-semibold' : 'text-slate-200'}`}>
                    {link.name}
                  </span>
                </div>
                {active ? (
                  <span className="w-2 h-2 rounded-full bg-[#dfbe7a] shadow-[0_0_8px_#dfbe7a] shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* 3. Drawer Bottom Action Buttons */}
        <div className="relative pt-3 border-t border-[#cca663]/25 shrink-0 space-y-2.5">
          {currentUser ? (
            <div className="space-y-2">
              <Link
                href="/profil"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0e3b4b] border border-[#cca663]/50 text-white font-semibold text-xs sm:text-sm shadow-md"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#dfbe7a]/20 text-[#dfbe7a] border border-[#dfbe7a]/40 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-white text-xs font-bold truncate">{currentUser.fullName}</span>
                    <span className="text-[10px] text-[#dfbe7a]">Profilim & QR Kartım</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#dfbe7a]" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logoutParticipant();
                  setCurrentUser(null);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Oturumu Kapat</span>
              </button>
            </div>
          ) : (
            <Link
              href="/giris"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#0c3340] border border-[#2d6477] hover:border-[#dfbe7a]/60 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99]"
            >
              <QrCode className="w-4 h-4 text-[#dfbe7a]" />
              <span>Bilet Sorgula / Giriş</span>
            </Link>
          )}

          {/* Delege Başvurusu Yap Button */}
          <Link
            href="/basvuru"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#cca663] via-[#dfbe7a] to-[#cca663] hover:brightness-110 text-[#071d26] font-serif font-bold text-xs sm:text-sm shadow-lg shadow-[#cca663]/20 transition-all active:scale-[0.99]"
          >
            <span>Delege Başvurusu Yap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Location & Date Footer */}
          <p className="text-center text-[11px] text-[#cca663]/80 font-serif tracking-wide pt-2 pb-0.5">
            23-24-25 Ekim 2026 • SKM Konya
          </p>
        </div>
      </div>
    </>
  );
}
