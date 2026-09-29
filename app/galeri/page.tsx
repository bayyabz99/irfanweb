'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Image as ImageIcon, 
  Video, 
  Play, 
  Upload, 
  UploadCloud,
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  Lock,
  ShieldCheck,
  Users,
  Loader2
} from 'lucide-react';
import { GalleryItem, Application } from '@/lib/types';
import { getStoredGallery, submitUserMedia, getCurrentUser } from '@/lib/storage';
import { uploadImageToSupabaseStorage } from '@/lib/supabase';
import { getStoredCMSData, fetchServerCMSData, CMSData, INITIAL_CMS_DATA } from '@/lib/cmsStorage';
import Lightbox from '@/components/Lightbox';
import InnerPageHero from '@/components/InnerPageHero';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeTier, setActiveTier] = useState<'public' | 'members'>('public');
  const [currentUser, setCurrentUser] = useState<Application | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [cmsData, setCmsData] = useState<CMSData>(INITIAL_CMS_DATA);

  // Upload Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [uploadData, setUploadData] = useState({
    title: '',
    uploaderName: '',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    category: 'etkinlik' as 'etkinlik' | 'komisyon' | 'kulis' | 'video'
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const all = getStoredGallery();
    // Only approved items with status !== 'rejected' are shown in gallery
    setItems(all.filter((item) => item.isApproved && item.status !== 'rejected'));

    // CMS Synchronization
    setCmsData(getStoredCMSData());
    fetchServerCMSData().then((serverData) => {
      if (serverData) setCmsData(serverData);
    });

    const handleAuth = () => {
      setCurrentUser(getCurrentUser());
      const updatedAll = getStoredGallery();
      setItems(updatedAll.filter((item) => item.isApproved && item.status !== 'rejected'));
    };
    const handleCms = () => setCmsData(getStoredCMSData());

    window.addEventListener('igm_auth_change', handleAuth);
    window.addEventListener('igm_gallery_updated', handleAuth);
    window.addEventListener('igm_cms_updated', handleCms);
    window.addEventListener('storage', handleCms);
    return () => {
      window.removeEventListener('igm_auth_change', handleAuth);
      window.removeEventListener('igm_gallery_updated', handleAuth);
      window.removeEventListener('igm_cms_updated', handleCms);
      window.removeEventListener('storage', handleCms);
    };
  }, []);

  const isApprovedMember = currentUser?.status === 'approved';

  const filters = [
    { id: 'all', label: 'Tüm Medya' },
    { id: 'image', label: 'Fotoğraflar' },
    { id: 'video', label: 'Videolar & Tanıtımlar' },
    { id: 'komisyon', label: 'Komisyon Çalışmaları' },
    { id: 'kulis', label: 'Kulis & Mola Anları' },
  ];

  const tierItems = items.filter((item) => {
    if (activeTier === 'public') {
      return item.visibility === 'public' || !item.visibility;
    } else {
      return item.visibility === 'members' || item.visibility === 'public' || !item.visibility;
    }
  });

  const filteredItems = tierItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'image') return item.mediaType === 'image';
    if (selectedFilter === 'video') return item.mediaType === 'video';
    return item.category === selectedFilter;
  });

  // Handle file selection from device
  const processFile = (file: File) => {
    setUploadError(null);
    const maxSizeBytes = 15 * 1024 * 1024; // 15 MB
    if (file.size > maxSizeBytes) {
      setUploadError('Dosya boyutu çok büyük! Lütfen 15 MB\'den küçük bir fotoğraf veya video seçiniz.');
      return;
    }

    const isVideo = file.type.startsWith('video');
    const isImage = file.type.startsWith('image');

    if (!isImage && !isVideo) {
      setUploadError('Desteklenmeyen dosya türü! Yalnızca fotoğraf (JPG, PNG, WEBP, GIF) veya video (MP4) yükleyebilirsiniz.');
      return;
    }

    setSelectedFile(file);
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFilePreview(result);
      setUploadData((prev) => ({
        ...prev,
        mediaUrl: result,
        mediaType: isVideo ? 'video' : 'image',
        // Otomatik başlık önerisi (eğer başlık girilmediyse)
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      }));
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setUploadError('Dosya cihazdan okunurken bir hata oluştu. Lütfen tekrar deneyiniz.');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadData.title.trim()) {
      setUploadError('Lütfen görsel / video başlığını giriniz.');
      return;
    }

    if (!uploadData.mediaUrl && !selectedFile) {
      setUploadError('Lütfen cihazınızdan yüklenecek bir fotoğraf veya video seçiniz.');
      return;
    }

    setIsSubmitting(true);
    let finalMediaUrl = uploadData.mediaUrl;

    // Supabase Storage'a yüklemeyi dene (bulut aktifse)
    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split('.').pop() || 'jpg';
        const fileName = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { url, error } = await uploadImageToSupabaseStorage('gallery', fileName, selectedFile);
        if (url && !error) {
          finalMediaUrl = url;
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback to local data URL:', err);
      }
    }

    submitUserMedia({
      title: uploadData.title.trim(),
      uploaderName: uploadData.uploaderName.trim() || currentUser?.fullName || 'Delege',
      uploaderEmail: currentUser?.email,
      mediaUrl: finalMediaUrl,
      mediaType: uploadData.mediaType,
      category: uploadData.category
    });

    setIsSubmitting(false);
    setUploadSuccess(true);
    setSelectedFile(null);
    setFilePreview(null);
    setUploadData({
      title: '',
      uploaderName: currentUser?.fullName || '',
      mediaUrl: '',
      mediaType: 'image',
      category: 'etkinlik'
    });

    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadOpen(false);
    }, 3000);
  };

  const gp = cmsData.galeriPage || INITIAL_CMS_DATA.galeriPage;

  return (
    <div className="min-h-screen bg-[#061A33] text-white">
      
      {/* 1. HERO BANNER */}
      <InnerPageHero
        badge={gp.heroBadge || "MEDYA & ETKİNLİK ALANI"}
        title={gp.heroTitle || "Fotoğraf ve Video Galerisi"}
        description={gp.heroDesc || "“Kökümüz İrfan, Sözümüz İstikbal” — İrfan Meclisi'nin genel kurul oturumları, komisyon müzakereleri ve kulis anlarından yüksek çözünürlüklü kareler."}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Galeri' }
        ]}
      />

      {/* 2. TWO-TIER GALLERY SWITCHER & FILTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-10 space-y-4">
        
        {/* Tier Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 p-1.5 rounded-3xl bg-[#081f38] border border-[#4DA3FF]/30 shadow-2xl gap-2">
          <button
            onClick={() => setActiveTier('public')}
            className={`py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              activeTier === 'public'
                ? 'bg-[#4DA3FF] text-[#061A33] shadow-lg shadow-[#4DA3FF]/25'
                : 'text-slate-300 hover:text-white hover:bg-[#0c2b4e]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Genel Ziyaretçi Galerisi (Herkese Açık)</span>
          </button>

          <button
            onClick={() => setActiveTier('members')}
            className={`py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              activeTier === 'members'
                ? 'bg-gradient-to-r from-[#1a68d1] to-[#258BF5] text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-300 hover:text-white hover:bg-[#0c2b4e]'
            }`}
          >
            {isApprovedMember ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>Etkinlik İçi Üye Galerisi {!isApprovedMember && '(Özel Alan 🔒)'}</span>
            {isApprovedMember && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                Erişim Açık
              </span>
            )}
          </button>
        </div>

        {/* Filter & Upload Bar (Visible if public OR if approved member) */}
        {(activeTier === 'public' || isApprovedMember) && (
          <div className="p-6 rounded-2xl bg-[#092746] border border-[#4DA3FF]/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              {filters.map((flt) => (
                <button
                  key={flt.id}
                  onClick={() => setSelectedFilter(flt.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedFilter === flt.id
                      ? 'bg-[#4DA3FF] text-[#061A33] font-bold shadow-lg shadow-[#4DA3FF]/20'
                      : 'bg-[#061A33] text-slate-300 hover:text-white border border-[#4DA3FF]/20 hover:border-[#4DA3FF]/40'
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (currentUser) {
                  setUploadData((prev) => ({ ...prev, uploaderName: currentUser.fullName }));
                }
                setIsUploadOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4DA3FF] hover:bg-[#258BF5] text-[#061A33] font-bold text-xs shadow-xl hover:shadow-[#4DA3FF]/30 transition-all shrink-0 cursor-pointer w-full md:w-auto justify-center"
            >
              <Upload className="w-4 h-4 text-[#061A33]" />
              <span>Fotoğraf / Video Yükle</span>
            </button>
          </div>
        )}
      </section>

      {/* 3. MEDIA GRID OR LOCKED TEASER STATE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {activeTier === 'members' && !isApprovedMember ? (
          /* LOCKED TEASER STATE FOR UNAPPROVED / GUEST VISITORS */
          <div className="p-10 sm:p-16 text-center rounded-3xl bg-[#092746]/90 border border-[#4DA3FF]/30 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#061A33] border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider inline-block">
                Yalnızca Onaylı Delegelere Özel Alan
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">Etkinlik İçi Delege Galerisi</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                Komisyon içi anlar, kulis hatıraları ve delegelerimizin yüklediği özel fotoğraflara yalnızca divan heyeti tarafından onaylanmış resmi meclis delegelerimiz erişebilir.
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/giris"
                className="px-6 py-3 rounded-full bg-[#4DA3FF] hover:bg-[#258BF5] text-[#061A33] font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Delege Girişi Yap</span>
              </Link>
              <Link
                href="/basvuru"
                className="px-6 py-3 rounded-full bg-[#061A33] border border-[#4DA3FF]/30 hover:border-[#4DA3FF] text-white text-xs font-semibold transition-all w-full sm:w-auto cursor-pointer"
              >
                <span>Yeni Delege Başvurusu</span>
              </Link>
            </div>
          </div>
        ) : (
          /* REGULAR UNLOCKED MEDIA GRID */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-6">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative rounded-2xl overflow-hidden bg-[#092746] border border-[#4DA3FF]/20 hover:border-[#4DA3FF]/60 cursor-pointer shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#4DA3FF]/15 flex flex-col justify-between"
                >
                  {/* Media Viewport - Full Image (Tamamen Gözükür, Kırpma Yok) */}
                  <div className="relative aspect-[4/3] w-full bg-[#051527] overflow-hidden flex items-center justify-center p-2">
                    {/* Atmospheric blurred backdrop */}
                    <Image
                      src={item.mediaUrl}
                      alt=""
                      fill
                      unoptimized={item.mediaUrl.startsWith('data:')}
                      className="object-cover blur-xl opacity-35 scale-125 pointer-events-none"
                    />

                    {/* Main Image with object-contain to be 100% visible */}
                    <Image
                      src={item.mediaUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      unoptimized={item.mediaUrl.startsWith('data:')}
                      className="object-contain p-1 relative z-10 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Member Badge indicator */}
                    {item.visibility === 'members' && (
                      <div className="absolute top-2.5 left-2.5 p-1 px-2 rounded-lg bg-[#061A33]/90 text-amber-300 backdrop-blur border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 z-20">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        <span>Üye</span>
                      </div>
                    )}

                    {item.mediaType === 'video' ? (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-11 h-11 rounded-full bg-[#4DA3FF] text-[#061A33] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-[#061A33] ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#061A33]/85 text-[#4DA3FF] backdrop-blur border border-[#4DA3FF]/30 z-20">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Clean Card Meta Bar - Doesn't obscure the image */}
                  <div className="p-3 bg-[#081e36] border-t border-[#4DA3FF]/15">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-[#4DA3FF] uppercase tracking-wider block">
                        {item.category}
                      </span>
                      {item.createdAt && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          {item.createdAt}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-white line-clamp-1 group-hover:text-[#4DA3FF] transition-colors" title={item.title}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-300 block mt-0.5 font-sans truncate">
                      {item.uploaderName || 'ÖNDER Medya'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="p-16 text-center bg-[#092746] rounded-3xl border border-[#4DA3FF]/20 space-y-2">
                <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-slate-300 text-sm font-medium">Bu kategoride henüz yayınlanmış bir medya bulunamadı.</p>
                <p className="text-xs text-slate-400">Yukarıdaki "Fotoğraf / Video Yükle" butonuna tıklayarak ilk medyayı gönderebilirsiniz.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((prev) => ((prev ?? 0) + 1) % filteredItems.length)}
          onPrev={() => setLightboxIndex((prev) => ((prev ?? 0) - 1 + filteredItems.length) % filteredItems.length)}
        />
      )}

      {/* 5. DELEGATE MEDIA UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061A33]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsUploadOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-[#092746] border border-[#4DA3FF]/40 rounded-3xl overflow-hidden shadow-2xl shadow-[#061A33]/90 z-10 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#4DA3FF]" />
                <h3 className="text-lg font-serif font-bold text-white">Etkinlik Medyası Gönder</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-lg bg-[#061A33] text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-serif font-bold text-white">Medyayı Başarıyla Gönderdiniz!</h4>
                <p className="text-xs text-slate-300">
                  Fotoğrafınız / videonuz moderasyon kuruluna iletilmiştir. Admin onayının ardından galeride yayınlanacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Görsel / Video Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Adalet Komisyonu 2. Oturum Müzakeresi"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full bg-[#061A33] border border-[#4DA3FF]/30 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#4DA3FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                      Adınız Soyadınız / Komisyon
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Ali Yılmaz (Adalet)"
                      value={uploadData.uploaderName}
                      onChange={(e) => setUploadData({ ...uploadData, uploaderName: e.target.value })}
                      className="w-full bg-[#061A33] border border-[#4DA3FF]/30 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#4DA3FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                      Medya Türü
                    </label>
                    <select
                      value={uploadData.mediaType}
                      onChange={(e) => setUploadData({ ...uploadData, mediaType: e.target.value as any })}
                      className="w-full bg-[#061A33] border border-[#4DA3FF]/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#4DA3FF]"
                    >
                      <option value="image">Fotoğraf</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Kategori
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as any })}
                    className="w-full bg-[#061A33] border border-[#4DA3FF]/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#4DA3FF]"
                  >
                    <option value="etkinlik">Genel Etkinlik</option>
                    <option value="komisyon">Komisyon Çalışması</option>
                    <option value="kulis">Kulis & Mola</option>
                    <option value="video">Özel Video</option>
                  </select>
                </div>

                {/* Device Upload Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Fotoğraf / Video Dosyası Seçin *
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {filePreview ? (
                    /* Selected file preview card */
                    <div className="relative rounded-2xl border border-emerald-500/40 bg-[#061A33] p-3.5 flex items-center gap-3.5 shadow-lg">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                        {uploadData.mediaType === 'video' ? (
                          <video src={filePreview} className="w-full h-full object-cover" />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={filePreview} alt="Önizleme" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-semibold text-white uppercase">
                          {uploadData.mediaType === 'video' ? 'Video' : 'Fotoğraf'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Yüklemeye Hazır</span>
                        </div>
                        <p className="text-xs text-white font-medium truncate mt-0.5">
                          {selectedFile?.name || 'Seçilen Medya Dosyası'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                        </p>
                        <div className="flex items-center gap-2.5 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] font-semibold text-[#4DA3FF] hover:underline cursor-pointer"
                          >
                            Dosyayı Değiştir
                          </button>
                          <span className="text-slate-600">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setFilePreview(null);
                              setUploadData((prev) => ({ ...prev, mediaUrl: '' }));
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone when no file is selected */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                        isDragOver
                          ? 'border-[#4DA3FF] bg-[#4DA3FF]/15 shadow-xl shadow-[#4DA3FF]/20 scale-[1.01]'
                          : 'border-[#4DA3FF]/30 hover:border-[#4DA3FF] bg-[#061A33]/80 hover:bg-[#061A33]'
                      }`}
                    >
                      {isReadingFile ? (
                        <div className="py-4 space-y-2">
                          <Loader2 className="w-8 h-8 text-[#4DA3FF] animate-spin mx-auto" />
                          <p className="text-xs text-slate-300 font-medium">Dosya cihazdan okunuyor...</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="w-12 h-12 rounded-full bg-[#4DA3FF]/15 border border-[#4DA3FF]/30 text-[#4DA3FF] flex items-center justify-center mx-auto transition-transform hover:scale-110">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-white">
                              Cihazınızdan Fotoğraf veya Video Seçin
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Tıklayarak cihazınızdan dosya seçin veya buraya sürükleyip bırakın
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#092746] border border-white/10 text-[10px] text-slate-300 font-mono">
                            <span>JPG, PNG, WEBP, GIF, MP4 (Maks. 15 MB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                      setUploadError(null);
                      setIsUploadOpen(false);
                    }}
                    className="px-5 py-2.5 rounded-full text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isReadingFile}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4DA3FF] hover:bg-[#258BF5] text-[#061A33] font-bold text-xs shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmitting ? 'Gönderiliyor...' : 'Moderasyona Gönder'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
