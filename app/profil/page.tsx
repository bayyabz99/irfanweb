'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  GraduationCap, 
  MapPin, 
  Layers, 
  QrCode, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Printer, 
  LogOut, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Plus, 
  X,
  FileText,
  Bell,
  Megaphone,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Menu,
  Home,
  MessageSquare,
  Lightbulb,
  Edit3,
  MoreHorizontal,
  Users
} from 'lucide-react';
import { 
  getCurrentUser, 
  logoutParticipant, 
  updateParticipantAvatar, 
  updateUserProfile,
  getUserGalleryItems, 
  submitUserMedia, 
  getUserAnnouncements,
  compressImageFile
} from '@/lib/storage';
import { isSupabaseConfigured, uploadImageToSupabaseStorage } from '@/lib/supabase';
import { Application, GalleryItem, Announcement } from '@/lib/types';
import { COMMISSIONS } from '@/lib/data';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
];

// Clean brand SVG icons for the sidebar
function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function YoutubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function XTwitterIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
    </svg>
  );
}

// Seljuk Arabesque Corner Ornament for Membership Card
function SeljukCornerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-8 h-8 pointer-events-none ${className}`} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 38V12C2 6.477 6.477 2 12 2H38" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.65" />
      <path d="M6 38V14C6 9.582 9.582 6 14 6H38" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="2.5" fill="#22d3ee" fillOpacity="0.8" />
      <path d="M12 5L14.5 12L12 19L9.5 12Z" fill="#38bdf8" fillOpacity="0.4" />
      <path d="M5 12L12 14.5L19 12L12 9.5Z" fill="#38bdf8" fillOpacity="0.4" />
    </svg>
  );
}

export default function ProfileDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  // Announcement State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isAllAnnouncementsModalOpen, setIsAllAnnouncementsModalOpen] = useState(false);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: '',
    school: '',
    department: '',
    city: '',
    password: ''
  });
  const [editSuccess, setEditSuccess] = useState(false);

  // User Gallery State
  const [userGallery, setUserGallery] = useState<GalleryItem[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCategory, setNewImageCategory] = useState<'etkinlik' | 'komisyon' | 'kulis'>('etkinlik');
  const [newImageBase64, setNewImageBase64] = useState<string>('');
  const [uploadSubmitting, setUploadSubmitting] = useState(false);

  useEffect(() => {
    const active = getCurrentUser();
    if (!active) {
      router.push('/giris');
      return;
    }
    setUser(active);
    setUserGallery(getUserGalleryItems(active.fullName, active.email));
    setAnnouncements(getUserAnnouncements(active.status));
    setEditFormData({
      phone: active.phone || '',
      school: active.school || '',
      department: active.department || '',
      city: active.city || 'Konya',
      password: active.password || ''
    });

    // Generate QR Code from secureQrToken or qrCodeId
    const qrCodeValue = active.secureQrToken || active.qrCodeId;
    if (qrCodeValue) {
      QRCode.toDataURL(
        qrCodeValue,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#051326',
            light: '#ffffff'
          }
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }

    setLoading(false);
  }, [router]);

  // Listen for real-time announcements & auth changes
  useEffect(() => {
    const handleAnnouncementsUpdate = () => {
      const active = getCurrentUser();
      if (active) {
        setAnnouncements(getUserAnnouncements(active.status));
        setUser(active);
      }
    };
    window.addEventListener('igm_announcements_updated', handleAnnouncementsUpdate);
    window.addEventListener('igm_auth_change', handleAnnouncementsUpdate);
    window.addEventListener('storage', handleAnnouncementsUpdate);
    return () => {
      window.removeEventListener('igm_announcements_updated', handleAnnouncementsUpdate);
      window.removeEventListener('igm_auth_change', handleAnnouncementsUpdate);
      window.removeEventListener('storage', handleAnnouncementsUpdate);
    };
  }, []);

  const handleLogout = () => {
    logoutParticipant();
    router.push('/giris');
  };

  const handleAvatarSelect = (url: string) => {
    if (!user) return;
    const updated = updateParticipantAvatar(user.id, url);
    if (updated) {
      setUser(updated);
      setIsAvatarModalOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file || !user) return;

    e.target.value = '';

    if (file.type && !file.type.startsWith('image/')) {
      setAvatarError('Lütfen sadece fotoğraf dosyası seçiniz (JPG, PNG veya WEBP).');
      return;
    }

    setAvatarUploadLoading(true);

    try {
      const { blob, dataUrl } = await compressImageFile(file, 800, 0.85);
      let finalAvatarUrl = dataUrl;

      if (isSupabaseConfigured) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const sanitizedExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt.toLowerCase()) ? fileExt.toLowerCase() : 'jpg';
        const fileName = `${user.id}-${Date.now()}.${sanitizedExt}`;

        const uploadResult = await uploadImageToSupabaseStorage('avatars', fileName, blob);
        if (uploadResult.url) {
          finalAvatarUrl = uploadResult.url;
        }
      }

      const updated = updateParticipantAvatar(user.id, finalAvatarUrl);
      if (updated) {
        setUser(updated);
      }
      setIsAvatarModalOpen(false);
    } catch (err: any) {
      console.error('Avatar upload processing error:', err);
      setAvatarError(err?.message || 'Fotoğraf işlenirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setAvatarUploadLoading(false);
    }
  };

  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updated = updateUserProfile(user.id, editFormData);
    if (updated) {
      setUser(updated);
      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        setIsEditModalOpen(false);
      }, 1500);
    }
  };

  const handleGalleryMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await compressImageFile(file, 1200, 0.85);
      setNewImageBase64(dataUrl);
    } catch (err) {
      console.error('Gallery image compression failed:', err);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImageBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newImageBase64 || !newImageTitle.trim()) return;

    setUploadSubmitting(true);
    try {
      submitUserMedia({
        title: newImageTitle.trim(),
        mediaUrl: newImageBase64,
        mediaType: 'image',
        category: newImageCategory as any,
        uploaderName: user.fullName,
        uploaderEmail: user.email
      });

      setUserGallery(getUserGalleryItems(user.fullName, user.email));
      setIsUploadModalOpen(false);
      setNewImageTitle('');
      setNewImageBase64('');
    } catch (err) {
      console.error(err);
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    const code = user?.secureQrToken || user?.qrCodeId || '';
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020b16] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3.5">
          <div className="w-10 h-10 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
          <p className="text-xs tracking-wider uppercase text-cyan-200 font-mono">İrfan Meclisi Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const commission = COMMISSIONS.find((c) => c.id === user.commissionId);
  const attendedCount = (user.attendanceDays || []).length;
  const userRoleTitle = user.status === 'approved' ? 'Onaylı Delege' : 'Delege Adayı';

  return (
    <div className="min-h-screen bg-[#020B16] text-slate-100 flex relative overflow-x-hidden font-sans selection:bg-[#06b6d4] selection:text-white">

      {/* ========================================================================= */}
      {/* 1. FIXED LEFT SIDEBAR (DESKTOP) & OFF-CANVAS (MOBILE)                      */}
      {/* ========================================================================= */}
      
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#040f1d] border-r border-[#183659]/60 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Top: Logo & Title & Toggle */}
        <div className="p-6 border-b border-[#183659]/50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-cyan-400/40 bg-[#020B16] shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-all flex items-center justify-center p-1.5">
              <Image 
                src="/logo.png" 
                alt="İrfan Meclisi" 
                width={36}
                height={36}
                className="object-contain" 
              />
            </div>
            <div>
              <span className="font-serif font-black tracking-wider text-white text-base block leading-none">
                İRFAN MECLİSİ
              </span>
              <span className="text-[9px] font-mono tracking-[0.22em] text-[#38bdf8] uppercase block mt-1">
                KÖKÜMÜZ İRFAN
              </span>
            </div>
          </Link>

          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white lg:hidden cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 no-scrollbar">
          
          {/* Ana Sayfa */}
          <Link
            href="/"
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-[#0a1e36]/70 border border-transparent hover:border-cyan-500/20 transition-all group cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-400 group-hover:text-[#38bdf8] transition-colors" />
            <span>Ana Sayfa</span>
          </Link>

          {/* Profilim - Active Glowing Turquoise Pill Capsule */}
          <Link
            href="/profil"
            className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#22d3ee] shadow-[0_4px_20px_rgba(6,182,212,0.4)] border border-cyan-200/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <User className="w-4 h-4 text-white" />
              <span>Profilim</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
          </Link>

          {/* Duyurular with badge */}
          <button
            type="button"
            onClick={() => setIsAllAnnouncementsModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-[#0a1e36]/70 border border-transparent hover:border-cyan-500/20 transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-4 h-4 text-slate-400 group-hover:text-[#38bdf8] transition-colors" />
              <span>Duyurular</span>
            </div>
            {announcements.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500 text-white shadow-sm shadow-rose-500/50">
                {announcements.length}
              </span>
            )}
          </button>



        </div>

        {/* Sidebar Bottom: Mevlana Artwork Card, Quote & Social Links */}
        <div className="p-4 border-t border-[#183659]/50 space-y-3">
          
          <div className="relative rounded-2xl overflow-hidden p-4 border border-cyan-500/20 bg-gradient-to-b from-[#071d37] to-[#030e1d] shadow-xl text-center space-y-2.5 group">
            
            {/* Mevlana Artwork Image with night atmosphere */}
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-cyan-500/20">
              <Image 
                src="/images/sidebar-mevlana.png" 
                alt="Mevlana Kubbe-i Hadra" 
                fill 
                sizes="260px"
                className="object-cover object-top filter saturate-125 contrast-110 group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030e1d] via-[#030e1d]/40 to-transparent" />
            </div>

            {/* Inspiring Quote */}
            <p className="text-[11px] font-serif italic text-slate-200 leading-relaxed px-1">
              “İyi insan, iyi bir toplumun temelidir.”
            </p>
            <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] block uppercase font-semibold">
              — İrfan Meclisi
            </span>

            {/* Social Brand Icons */}
            <div className="pt-2 flex items-center justify-center gap-3.5 text-slate-400 border-t border-white/5">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
                title="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
                title="YouTube"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
                title="X (Twitter)"
              >
                <XTwitterIcon className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 rounded-xl bg-red-950/30 border border-red-500/25 hover:bg-red-900/40 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Oturumu Kapat</span>
          </button>

        </div>

      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                                            */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 bg-[#020B16]">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 sm:h-20 bg-[#040f1d]/90 backdrop-blur-xl border-b border-[#183659]/60 px-4 sm:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Hamburger & Search Input */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white lg:hidden cursor-pointer"
              title="Menüyü Aç"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar matching reference image */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Site içinde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-full bg-[#030914] border border-[#183659] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Right: Notifications & User Profile Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Notification Bell */}
            <button
              onClick={() => setIsAllAnnouncementsModalOpen(true)}
              className="relative p-2.5 rounded-full bg-[#030914] border border-[#183659] text-slate-300 hover:text-white hover:border-cyan-400/60 transition-all cursor-pointer shadow-md"
              title="Duyurular"
            >
              <Bell className="w-4 h-4" />
              {announcements.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/50">
                  {announcements.length}
                </span>
              )}
            </button>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                className="flex items-center gap-2.5 sm:gap-3 p-1 sm:pr-3.5 rounded-full bg-[#030914] border border-[#183659] hover:border-cyan-400/50 transition-all cursor-pointer shadow-md"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-cyan-400 bg-[#071d37] flex items-center justify-center text-xs font-serif font-bold text-white shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-white block leading-tight truncate max-w-[130px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono block">
                    Üye
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {headerDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#06182e] border border-cyan-500/30 shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setHeaderDropdownOpen(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Profili Düzenle</span>
                  </button>
                  <button
                    onClick={() => {
                      setHeaderDropdownOpen(false);
                      setIsAvatarModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Fotoğrafı Değiştir</span>
                  </button>
                  <button
                    onClick={() => {
                      setHeaderDropdownOpen(false);
                      handlePrintCard();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Kartvizit / Bilet Yazdır</span>
                  </button>
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Dashboard Main Container */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-7 max-w-[1600px] w-full mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-[#38bdf8] transition-colors">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#38bdf8] font-semibold">Profilim</span>
          </div>

          {/* ========================================================================= */}
          {/* 3. PROFILE HERO CARD (BİREBİR REFERANS TASARIM)                           */}
          {/* ========================================================================= */}
          <div className="relative rounded-3xl overflow-hidden border border-[#1d446f]/70 bg-[#07192f] shadow-2xl">
            
            {/* Background Image: Mevlana & Konya Panorama with semazen */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image 
                src="/images/anasayfa-arkaplan.png" 
                alt="İrfan Meclisi Arka Plan"
                fill
                sizes="100vw"
                priority
                className="object-cover object-right opacity-45 filter saturate-125 contrast-125"
              />
              {/* Left-to-right deep navy gradient overlay to keep text super clear */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#030c18] via-[#041326]/90 to-[#030c18]/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07192f] via-transparent to-transparent" />
            </div>

            {/* Hero Foreground Content */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              
              {/* Left Identity: Avatar + User Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6 text-center md:text-left">
                
                {/* Circular Avatar with Glowing Turquoise Ring */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-cyan-400 ring-4 ring-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.45)] bg-[#020b16] flex items-center justify-center text-3xl font-serif font-bold text-white">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.fullName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Profil Fotoğrafını Değiştir"
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#020B16] shadow-lg shadow-cyan-900/60 transition-transform active:scale-95 cursor-pointer border-2 border-[#07192f]"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Identity Information */}
                <div className="space-y-2">
                  
                  {/* Status badge: Onaylı Üye */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Onaylı Üye</span>
                  </div>

                  {/* Name */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white tracking-tight">
                    {user.fullName}
                  </h1>

                  {/* Meta: Location, Class/Role, Email */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-slate-300 font-sans">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{user.city || 'Konya'}</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{user.department || user.school || '13'}</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-slate-300 break-all">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{user.email}</span>
                    </span>
                  </div>

                  {/* Motto / Bio Quote */}
                  <p className="text-xs sm:text-sm text-slate-300 font-sans italic pt-1 max-w-xl">
                    “Daha iyi bir toplum için, daha çok çalışmak...”
                  </p>

                </div>

              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                
                {/* Profili Düzenle Button */}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#22d3ee] hover:from-[#0369a1] hover:to-[#06b6d4] text-[#020B16] hover:text-white font-bold text-xs flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(6,182,212,0.35)] cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#020B16]" />
                  <span>Profili Düzenle</span>
                </button>

                {/* Kartvizit Button */}
                <button
                  onClick={handlePrintCard}
                  className="px-5 py-2.5 rounded-full bg-[#051629]/90 hover:bg-[#082240] border border-cyan-500/30 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kartvizit</span>
                </button>

                {/* More Options Button */}
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="p-2.5 rounded-full bg-[#051629]/90 hover:bg-[#082240] border border-cyan-500/30 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Fotoğraf Paylaş"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* 4. STATS CARDS ROW (4 STATS + 1 INSPIRATIONAL BANNER CARD)                 */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-4">
            
            {/* Stat 1: Oturum Katılımı */}
            <div className="lg:col-span-3 rounded-2xl bg-[#06182e] border border-[#183659]/70 p-4 sm:p-5 flex items-center justify-between hover:border-cyan-400/50 transition-all group shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Oturum Katılımı
                  </span>
                  <span className="text-xl font-serif font-black text-white block mt-0.5">
                    {attendedCount > 0 ? `${attendedCount} Oturum` : '3 Oturum'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>

            {/* Stat 2: Komisyon */}
            <div className="lg:col-span-3 rounded-2xl bg-[#06182e] border border-[#183659]/70 p-4 sm:p-5 flex items-center justify-between hover:border-cyan-400/50 transition-all group shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Komisyon
                  </span>
                  <span className="text-sm sm:text-base font-serif font-bold text-white block mt-0.5 truncate max-w-[150px]">
                    {commission?.name ? commission.name.replace('Komisyonu', '').trim() : (user.commissionId || 'Sağlık')}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </div>

            {/* Stat 3: Üyelik Tarihi */}
            <div className="lg:col-span-2 rounded-2xl bg-[#06182e] border border-[#183659]/70 p-4 sm:p-5 flex items-center justify-between hover:border-cyan-400/50 transition-all group shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Üyelik Tarihi
                  </span>
                  <span className="text-xs sm:text-sm font-serif font-bold text-white block mt-0.5 whitespace-nowrap">
                    23 Ekim 2026
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>

            {/* Stat 4: Quote Card (Right) */}
            <div className="lg:col-span-4 rounded-2xl bg-gradient-to-r from-[#06182e] to-[#0a2342] border border-cyan-500/30 p-4 sm:p-5 flex items-center justify-between relative overflow-hidden shadow-xl group">
              <div className="space-y-1 relative z-10 pr-2">
                <p className="text-xs font-serif italic text-slate-200 leading-snug">
                  “İrfan, insanı insana, toplumu topluma bağlar.”
                </p>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#38bdf8] uppercase block">
                  — İrfan Meclisi
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 5. MAIN CONTENT 3-COLUMN DASHBOARD GRID                                   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* --------------------------------------------------------------------- */}
            {/* COLUMN 1 (5 COLS): KIŞISEL BILGILER & MOTIVASYON                      */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card: Kişisel Bilgiler */}
              <div className="rounded-3xl bg-[#06182e] border border-[#183659]/70 p-6 sm:p-7 shadow-xl space-y-6">
                
                {/* Header with Edit Button */}
                <div className="flex items-center justify-between border-b border-[#183659]/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <User className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                      Kişisel Bilgiler
                    </h2>
                  </div>

                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs font-semibold text-[#38bdf8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Düzenle</span>
                  </button>
                </div>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Ad Soyad */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      Ad Soyad
                    </span>
                    <p className="font-semibold text-white text-sm">{user.fullName}</p>
                  </div>

                  {/* T.C. Kimlik No */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      T.C. Kimlik No
                    </span>
                    <p className="font-semibold text-white font-mono text-sm">{user.identityNo}</p>
                  </div>

                  {/* E-posta */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      E-posta
                    </span>
                    <p className="font-semibold text-white break-all">{user.email}</p>
                  </div>

                  {/* Telefon */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      Telefon
                    </span>
                    <p className="font-semibold text-white font-mono">{user.phone}</p>
                  </div>

                  {/* Üniversite & Şehir */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      Üniversite & Şehir
                    </span>
                    <p className="font-semibold text-white">{user.school} ({user.city || 'Konya'})</p>
                  </div>

                  {/* Bölüm & Sınıf */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      Bölüm & Sınıf
                    </span>
                    <p className="font-semibold text-white">{user.department || 'Öğrenci'}</p>
                  </div>

                  {/* Adres */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      Adres
                    </span>
                    <p className="font-semibold text-white">{user.city ? `${user.city} / Konya` : 'Selçuklu / Konya'}</p>
                  </div>

                  {/* Tercih Komisyonu */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Tercih Komisyonu
                    </span>
                    <p className="font-bold text-[#38bdf8]">{commission?.name || user.commissionId || 'Sağlık Komisyonu'}</p>
                  </div>

                </div>

                {/* Masked Password Row matching reference design */}
                <div className="p-4 rounded-2xl bg-[#030a14] border border-[#183659]/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Hanevi Giriş Şifreniz</span>
                      <span className="text-[10px] text-slate-400">Oturum ve delege yoklamalarında kullanılır</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm tracking-[0.25em] text-[#38bdf8] font-bold bg-[#06182e] px-3 py-1 rounded-lg border border-cyan-500/30">
                      {showPassword ? (user.password || '123456') : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-lg bg-[#06182e] text-slate-400 hover:text-white border border-[#183659] transition-colors cursor-pointer"
                      title={showPassword ? 'Gizle' : 'Göster'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Card: Motivasyon & Yasa Tasarısı / Fikir Önerisi */}
              <div className="rounded-3xl bg-[#06182e] border border-[#183659]/70 p-6 sm:p-7 shadow-xl space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-white">
                      Motivasyon & Yasa Tasarısı / Fikir Önerisi
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-sans italic leading-relaxed pt-1">
                  “{user.motivation || 'Daha adil, daha bilinçli ve daha üretken bir toplum için çalışmalara katkı sunmak istiyorum.'}”
                </p>
              </div>

            </div>

            {/* --------------------------------------------------------------------- */}
            {/* COLUMN 2 (4 COLS): ÜYELIK KARTI & SON ETKINLIKLERIM                   */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Card: Üyelik Kartı (Seljuk Motifs & Cyan Border) */}
              <div className="rounded-3xl bg-gradient-to-b from-[#06182e] to-[#030c18] border-2 border-cyan-500/40 p-6 sm:p-7 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-5 text-center relative overflow-hidden">
                
                {/* Seljuk Geometric Corner Ornaments */}
                <SeljukCornerOrnament className="absolute top-2 left-2" />
                <SeljukCornerOrnament className="absolute top-2 right-2 rotate-90" />
                <SeljukCornerOrnament className="absolute bottom-2 right-2 rotate-180" />
                <SeljukCornerOrnament className="absolute bottom-2 left-2 -rotate-90" />

                {/* Card Title & Location */}
                <div className="space-y-1 border-b border-[#183659]/60 pb-4">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#38bdf8] uppercase font-bold block">
                    ÜYELİK KARTI
                  </span>
                  <h3 className="text-base font-serif font-bold text-white">
                    İrfan Meclisi 2026
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Selçuklu Kongre Merkezi / Konya
                  </p>
                </div>

                {/* QR Code Graphic Box with white contrast card */}
                <div className="p-3 rounded-2xl bg-white shadow-2xl inline-block mx-auto border-4 border-[#030a14]">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Yoklama QR Kodu" className="w-40 h-40 sm:w-44 sm:h-44 mx-auto" />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-slate-500 text-xs font-mono">
                      QR Üretiliyor...
                    </div>
                  )}
                </div>

                {/* Verification Code with Copy Button */}
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xs px-3.5 py-1.5 rounded-full bg-[#030914] text-[#38bdf8] border border-cyan-500/40 font-bold tracking-wider">
                    KOD: {user.secureQrToken ? user.secureQrToken.substring(0, 14) : (user.qrCodeId || '1A26-ADA-5296')}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-full bg-[#030914] text-slate-400 hover:text-white border border-[#183659] cursor-pointer transition-colors"
                    title="Kodu Kopyala"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Explanatory text */}
                <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Etkinlik girişinde ve konaklama durumlarında bu QR kodu görevli ekibin ile paylaşarak hızlı giriş sağlayabilirsin.
                </p>

                {/* Print Ticket Button */}
                <button
                  onClick={handlePrintCard}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0284c7] text-[#020B16] hover:text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Yaka Kartı & Bilet Çıktısı Al</span>
                </button>

              </div>



            </div>

            {/* --------------------------------------------------------------------- */}
            {/* COLUMN 3 (3 COLS): HIZLI İŞLEMLER, DUYURULAR & MEDYA                  */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Card: Hızlı İşlemler */}
              <div className="rounded-3xl bg-[#06182e] border border-[#183659]/70 p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-serif font-bold text-white border-b border-[#183659]/60 pb-3">
                  Hızlı İşlemler
                </h3>

                <div className="space-y-2">
                  
                  <button
                    type="button"
                    onClick={() => setIsAllAnnouncementsModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#030a14] hover:bg-[#082240] border border-white/5 hover:border-cyan-500/40 text-xs text-slate-200 hover:text-white transition-all group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Duyurular</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {announcements.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-rose-500 text-white">
                          {announcements.length}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#030a14] hover:bg-[#082240] border border-white/5 hover:border-cyan-500/40 text-xs text-slate-200 hover:text-white transition-all group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Edit3 className="w-4 h-4 text-cyan-400" />
                      <span>Profili Düzenle</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintCard}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#030a14] hover:bg-[#082240] border border-white/5 hover:border-cyan-500/40 text-xs text-slate-200 hover:text-white transition-all group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>Kartvizit & Bilet Yazdır</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#030a14] hover:bg-[#082240] border border-white/5 hover:border-cyan-500/40 text-xs text-slate-200 hover:text-white transition-all group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span>Fotoğraf Paylaş</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </button>

                </div>
              </div>

              {/* Card: Duyurular */}
              <div className="rounded-3xl bg-[#06182e] border border-[#183659]/70 p-6 shadow-xl space-y-4">
                
                <div className="flex items-center justify-between border-b border-[#183659]/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-serif font-bold text-white">Duyurular</h3>
                  </div>
                  <button
                    onClick={() => setIsAllAnnouncementsModalOpen(true)}
                    className="text-[11px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                  >
                    Tümünü Gör
                  </button>
                </div>

                {announcements.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#030a14] border border-white/5 text-center space-y-2">
                    <Megaphone className="w-6 h-6 text-cyan-400/50 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">Yeni Duyuru Bulunmuyor</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Site admini tarafından yayınlanan resmi duyuru metinleri burada anlık olarak listelenir.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {announcements.slice(0, 3).map((ann) => (
                      <div
                        key={ann.id}
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="p-3.5 rounded-2xl bg-[#030a14] border border-white/5 hover:border-cyan-500/50 transition-all cursor-pointer space-y-1.5 group text-left"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-semibold uppercase ${
                            ann.priority === 'urgent'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : ann.priority === 'important'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {ann.targetGroup === 'approved_delegates' ? 'Komisyon' : ann.priority === 'urgent' ? 'Acil' : 'Genel'}
                          </span>
                          <span className="text-slate-400">
                            {new Date(ann.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {ann.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Card: Yüklediğiniz Fotoğraflar & Anılar */}
              <div className="rounded-3xl bg-[#06182e] border border-[#183659]/70 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#183659]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-serif font-bold text-white">Fotoğraflarım</h3>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Paylaş</span>
                  </button>
                </div>

                {userGallery.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#030a14] text-center space-y-2 border border-dashed border-white/10">
                    <p className="text-xs text-slate-400">Henüz fotoğraf yüklemediniz.</p>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition-colors cursor-pointer"
                    >
                      İlk Fotoğrafı Paylaş
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {userGallery.slice(0, 4).map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                        <img src={img.mediaUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] text-white">
                          {img.isApproved ? 'Yayında' : 'İnceleniyor'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </main>

      </div>

      {/* ========================================================================= */}
      {/* 6. MODALS: AVATAR, PROFILE EDIT, GALLERY UPLOAD & ANNOUNCEMENT            */}
      {/* ========================================================================= */}

      {/* AVATAR CHANGE MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl bg-[#06182e] border border-cyan-500/40 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>Profil Fotoğrafını Değiştir</span>
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {avatarError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{avatarError}</span>
              </div>
            )}

            {/* Custom Image Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cihazınızdan Yeni Fotoğraf Seçin (Galeri veya Kamera)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploadLoading}
                className="w-full py-3.5 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-[#030a14] text-sm font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>{avatarUploadLoading ? 'Yükleniyor ve Doğrulanıyor...' : 'Fotoğraf Dosyası Yükle'}</span>
              </button>
            </div>

            {/* Ready Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Veya Hazır Delege Avatarlarından Seçin
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_PRESETS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAvatarSelect(presetUrl)}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-cyan-400 transition-all cursor-pointer group"
                  >
                    <img src={presetUrl} alt="Avatar Preset" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#030a14] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl bg-[#06182e] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <span>Profil Bilgilerini Düzenle</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Bilgileriniz başarıyla güncellendi!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  required
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#030a14] border border-[#183659] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Üniversite / Kurum</label>
                <input
                  type="text"
                  required
                  value={editFormData.school}
                  onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#030a14] border border-[#183659] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bölüm / Program</label>
                <input
                  type="text"
                  required
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#030a14] border border-[#183659] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">İkamet Şehri</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#030a14] border border-[#183659] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">6 Haneli Giriş PIN</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#030a14] border border-[#183659] rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-[#030a14] text-slate-300 hover:text-white rounded-xl font-semibold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0284c7] text-[#020B16] hover:text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW GALLERY MEDIA MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl bg-[#06182e] border border-cyan-500/40 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <span>Meclis Galerisine Fotoğraf Ekle</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Fotoğraf Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Adalet Komisyonu Açılış Oturumu"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  className="w-full bg-[#030a14] border border-[#183659] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  value={newImageCategory}
                  onChange={(e) => setNewImageCategory(e.target.value as any)}
                  className="w-full bg-[#030a14] border border-[#183659] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="etkinlik">Genel Etkinlik</option>
                  <option value="komisyon">Komisyon Masası</option>
                  <option value="kulis">Kulis & İstişare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Görsel Dosyası *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleGalleryMediaUpload}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-[#020B16] file:cursor-pointer hover:file:bg-cyan-400"
                />
                {newImageBase64 && (
                  <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-cyan-400/30">
                    <img src={newImageBase64} alt="Önizleme" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#030a14] text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={uploadSubmitting || !newImageBase64}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0284c7] text-[#020B16] hover:text-white font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadSubmitting ? 'Kaydediliyor...' : 'Galeriye Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT DETAIL MODAL */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full rounded-3xl bg-[#06182e] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                  selectedAnnouncement.priority === 'urgent'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : selectedAnnouncement.priority === 'important'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {selectedAnnouncement.priority === 'urgent' ? 'Acil Duyuru' : selectedAnnouncement.priority === 'important' ? 'Önemli Bilgilendirme' : 'Resmi Duyuru'}
                </span>
                <h3 className="text-lg font-serif font-bold text-white pt-1">
                  {selectedAnnouncement.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 rounded-lg bg-[#030a14] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#030a14]/90 border border-white/5 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {selectedAnnouncement.content}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-3">
              <span>Gönderen: {selectedAnnouncement.authorName || 'Divan Heyeti'}</span>
              <span>{new Date(selectedAnnouncement.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0284c7] text-[#020B16] hover:text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* ALL ANNOUNCEMENTS MODAL */}
      {isAllAnnouncementsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-2xl w-full rounded-3xl bg-[#06182e] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Resmi Meclis Duyuruları</h3>
                  <p className="text-xs text-slate-400">Site admini ve Divan Heyeti tarafından yayınlanan tüm bildirimler</p>
                </div>
              </div>
              <button
                onClick={() => setIsAllAnnouncementsModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#030a14] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {announcements.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-slate-400">
                  <Megaphone className="w-8 h-8 mx-auto text-cyan-400/40" />
                  <p className="text-sm font-semibold text-slate-300">Henüz yayınlanmış bir duyuru bulunmuyor.</p>
                  <p className="text-xs">Yönetim tarafından yeni bir duyuru girildiğinde burada anlık olarak listelenecektir.</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => {
                      setSelectedAnnouncement(ann);
                    }}
                    className="p-4 rounded-2xl bg-[#030a14] border border-white/5 hover:border-cyan-500/50 transition-all cursor-pointer space-y-2 group text-left"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ann.priority === 'urgent'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : ann.priority === 'important'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {ann.priority === 'urgent' ? 'Acil Duyuru' : ann.priority === 'important' ? 'Önemli' : 'Genel'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {ann.authorName || 'Divan Heyeti'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(ann.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {ann.title}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {ann.content}
                    </p>

                    <span className="text-[11px] text-[#38bdf8] font-semibold inline-flex items-center gap-1 group-hover:underline pt-1">
                      Metnin Tamamını Oku &rarr;
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setIsAllAnnouncementsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#06b6d4] text-[#020B16] font-bold text-xs shadow-md cursor-pointer hover:from-[#0369a1] hover:to-[#0284c7] hover:text-white transition-colors"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PRINTABLE BADGE / TICKET (VISIBLE ONLY WHEN PRINTING)                   */}
      {/* ========================================================================= */}
      <div id="printable-ticket" className="hidden print:block text-black p-8 font-sans max-w-xl mx-auto border-2 border-black rounded-3xl">
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-serif font-black tracking-wider uppercase">İRFAN MECLİSİ 2026</h1>
          <p className="text-xs font-mono tracking-widest text-slate-600 uppercase">Resmi Delege Giriş ve Yaka Kartı</p>
          <p className="text-xs text-slate-700 mt-1">23 - 25 Ekim 2026 • Selçuklu Kongre Merkezi / Konya</p>
        </div>

        <div className="flex items-center justify-between gap-6 my-6">
          <div className="space-y-2 text-sm flex-1">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Delege Adı Soyadı</span>
              <p className="text-lg font-bold text-black">{user.fullName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">T.C. Kimlik No</span>
              <p className="font-mono font-semibold">{user.identityNo}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Komisyon</span>
              <p className="font-semibold">{commission?.name || user.commissionId || 'Genel Kurul'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Kurum / Üniversite</span>
              <p className="text-xs">{user.school} ({user.city || 'Konya'})</p>
            </div>
          </div>

          <div className="text-center shrink-0 border-2 border-black p-3 rounded-2xl">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Bilet" className="w-36 h-36 mx-auto" />
            )}
            <p className="text-[10px] font-mono font-bold mt-1 tracking-wider">
              {user.secureQrToken || user.qrCodeId}
            </p>
          </div>
        </div>

        <div className="border-t-2 border-black pt-3 text-center text-[10px] text-slate-600">
          Bu kart etkinlik boyunca delegenin üzerinde taşınmalıdır. Güvenlik ve oturum yoklamalarında görevli personele ibraz edilir.
        </div>
      </div>

    </div>
  );
}
