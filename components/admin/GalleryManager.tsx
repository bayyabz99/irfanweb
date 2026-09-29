'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  Upload, 
  Plus, 
  Filter, 
  Search, 
  Sparkles, 
  X, 
  Check, 
  Clock, 
  User, 
  Layers, 
  ArrowUpDown,
  AlertTriangle,
  Globe,
  Lock,
  Maximize2,
  LayoutGrid,
  List,
  Loader2
} from 'lucide-react';
import { GalleryItem, GalleryItemStatus } from '@/lib/types';
import { 
  getStoredGallery, 
  saveStoredGallery, 
  adminAddGalleryItem, 
  adminAddGalleryItems,
  moderateGalleryItem, 
  bulkModerateGallery, 
  deleteGalleryItem,
  compressImageFile
} from '@/lib/storage';
import { isSupabaseConfigured, uploadImageToSupabaseStorage } from '@/lib/supabase';

export default function GalleryManager() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'admin_upload' | 'user_submissions' | 'published'>('admin_upload');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | GalleryItemStatus>('all');

  // Selected items for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Admin Direct Upload Form State
  const [adminUploadData, setAdminUploadData] = useState({
    title: '',
    description: '',
    category: 'etkinlik' as 'etkinlik' | 'komisyon' | 'kulis' | 'video',
    mediaType: 'image' as 'image' | 'video',
    mediaUrl: '',
    visibility: 'public' as 'public' | 'members',
    order: 1,
    isPublished: true
  });
  const [adminUploadFiles, setAdminUploadFiles] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rejection note modal
  const [rejectItem, setRejectItem] = useState<GalleryItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadData = () => {
    setGallery(getStoredGallery());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('igm_gallery_updated', handleUpdate);
    return () => window.removeEventListener('igm_gallery_updated', handleUpdate);
  }, []);

  // Filtered lists
  const pendingSubmissions = gallery.filter((g) => !g.isApproved || g.status === 'pending');
  const publishedItems = gallery.filter((g) => g.isApproved && g.status !== 'rejected');

  const filteredItems = (activeTab === 'user_submissions' ? pendingSubmissions : publishedItems)
    .filter((g) => {
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchUploader = (g.uploaderName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchUploader) return false;
      }
      return true;
    });

  // Handle local multiple file selection with canvas compression to prevent localStorage quota exhaustion
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSizeBytes = 15 * 1024 * 1024; // 15 MB

    setIsProcessingFiles(true);

    try {
      const validProcessedUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
          setUploadError(`"${file.name}" desteklenmeyen dosya türü! Sadece JPEG, PNG, WEBP ve GIF yükleyebilirsiniz.`);
          continue;
        }
        if (file.size > maxSizeBytes) {
          setUploadError(`"${file.name}" çok büyük! Maksimum dosya boyutu 15 MB'dir.`);
          continue;
        }

        // Compress image using canvas: scales large images down to 1200px and JPEG quality 0.82
        // This drops file size from ~5MB down to ~90KB, easily fitting tens of images into storage!
        const { blob, dataUrl } = await compressImageFile(file, 1200, 0.82);
        let finalUrl = dataUrl;

        // If Supabase cloud storage is configured, upload for cloud permanence
        if (isSupabaseConfigured) {
          try {
            const ext = file.name.split('.').pop() || 'jpg';
            const cleanName = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
            const uploadRes = await uploadImageToSupabaseStorage('gallery', cleanName, blob);
            if (uploadRes.url) {
              finalUrl = uploadRes.url;
            }
          } catch (cloudErr) {
            console.warn('Supabase cloud upload fallback to dataUrl:', cloudErr);
          }
        }

        validProcessedUrls.push(finalUrl);
      }

      if (validProcessedUrls.length > 0) {
        setAdminUploadFiles((prev) => [...prev, ...validProcessedUrls]);
        if (!adminUploadData.mediaUrl) {
          setAdminUploadData((prev) => ({ ...prev, mediaUrl: validProcessedUrls[0] }));
        }
      }
    } catch (err: any) {
      console.error('Error processing files:', err);
      setUploadError(err?.message || 'Görseller işlenirken bir sorun oluştu.');
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Submit Admin Direct Upload Form (Rule 11)
  const handleAdminUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const targetUrls = adminUploadFiles.length > 0 ? adminUploadFiles : [adminUploadData.mediaUrl.trim()];

    if (targetUrls.length === 0 || !targetUrls[0]) {
      setUploadError('Lütfen en az bir görsel dosyası seçiniz veya geçerli bir görsel URL adresi giriniz.');
      return;
    }

    if (!adminUploadData.title.trim()) {
      setUploadError('Lütfen görsel için bir başlık giriniz.');
      return;
    }

    // Add ALL images in an atomic batch
    const itemsToAdd = targetUrls.map((url, idx) => ({
      title: targetUrls.length > 1 ? `${adminUploadData.title} (${idx + 1})` : adminUploadData.title,
      description: adminUploadData.description,
      mediaUrl: url,
      category: adminUploadData.category,
      mediaType: adminUploadData.mediaType,
      visibility: adminUploadData.visibility,
      order: Number(adminUploadData.order) + idx,
      uploaderName: 'Divan Heyeti (Admin)',
      isApproved: adminUploadData.isPublished
    }));

    adminAddGalleryItems(itemsToAdd);

    setUploadSuccess(true);
    setAdminUploadFiles([]);
    setAdminUploadData({
      title: '',
      description: '',
      category: 'etkinlik',
      mediaType: 'image',
      mediaUrl: '',
      visibility: 'public',
      order: gallery.length + itemsToAdd.length + 1,
      isPublished: true
    });
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setUploadSuccess(false);
      setActiveTab('published');
    }, 1200);
  };

  // Moderation Handlers (Rules 12 & 13)
  const handleApprove = (id: string) => {
    moderateGalleryItem(id, 'approved', undefined, 'public');
    loadData();
    if (previewItem?.id === id) setPreviewItem(null);
  };

  const handleOpenReject = (item: GalleryItem) => {
    setRejectItem(item);
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectItem) return;
    moderateGalleryItem(rejectItem.id, 'rejected', rejectionReason.trim() || 'İçerik kurallarına uygun bulunmadı.');
    loadData();
    setRejectItem(null);
    if (previewItem?.id === rejectItem.id) setPreviewItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu görseli silmek istediğinize emin misiniz?')) {
      deleteGalleryItem(id);
      loadData();
      if (previewItem?.id === id) setPreviewItem(null);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Bulk Handlers (Rule 13)
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkAction = (action: 'approved' | 'rejected' | 'delete') => {
    if (selectedIds.length === 0) return;
    const confirmMsg = 
      action === 'approved' 
        ? `${selectedIds.length} görseli onaylayıp yayına almak istediğinize emin misiniz?` 
        : action === 'rejected'
        ? `${selectedIds.length} görseli reddetmek istediğinize emin misiniz?`
        : `${selectedIds.length} görseli kalıcı olarak silmek istediğinize emin misiniz?`;

    if (confirm(confirmMsg)) {
      bulkModerateGallery(selectedIds, action, action === 'rejected' ? 'Toplu red işlemi' : undefined);
      loadData();
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              Medya ve Galeri
            </span>
            <span className="text-xs text-slate-400">İki Kademeli Görsel & Moderasyon Merkezi</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#1E6FFB]" />
            Medya Yönetim Sistemi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Doğrudan galeriye görsel yükleyin veya delegelerden gelen gönderileri inceleyip onaylayarak yayına alın.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('admin_upload')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin_upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#1E6FFB]" />
            Galeriye Görsel Ekle
          </button>

          <button
            onClick={() => setActiveTab('user_submissions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === 'user_submissions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Kullanıcı Gönderileri
            {pendingSubmissions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingSubmissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'published'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            Yayındaki Galeri ({publishedItems.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION A: ADMİN GALERİ YÜKLEME (RULE 11)                              */}
      {/* ========================================================================= */}
      {activeTab === 'admin_upload' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#1E6FFB]" />
              Yönetici Doğrudan Galeri Yükleme Alanı
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Buradan yüklenen tüm görseller doğrudan web sitesi galerisine eklenir. Tek seferde birden fazla görsel seçebilirsiniz.
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Görseller başarıyla galeriye eklendi ve yayına alındı!</span>
            </div>
          )}

          {uploadError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleAdminUploadSubmit} className="space-y-5 text-xs">
            {/* File Dropzone Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-bold text-slate-700">
                  Görselleri Seçin veya Sürükleyin * (JPEG, PNG, WEBP - Maks. 15MB)
                </label>
                {adminUploadFiles.length > 0 && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {adminUploadFiles.length} Görsel Seçildi
                  </span>
                )}
              </div>
              <div 
                onClick={() => !isProcessingFiles && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isProcessingFiles 
                    ? 'border-blue-400 bg-blue-50/40 cursor-wait'
                    : 'border-slate-300 hover:border-[#1E6FFB] hover:bg-blue-50/20 cursor-pointer'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {isProcessingFiles ? (
                  <div className="py-2 space-y-2">
                    <Loader2 className="w-8 h-8 text-[#1E6FFB] animate-spin mx-auto" />
                    <p className="font-bold text-slate-800 text-sm">Görseller Optimize Ediliyor...</p>
                    <p className="text-slate-400 text-xs">Yüksek çözünürlüklü fotoğraflar işleniyor ve sıkıştırılıyor, lütfen bekleyin.</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1E6FFB] flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      Bilgisayarınızdan Görselleri Seçmek İçin Tıklayın
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Tek seferde birden fazla fotoğraf seçebilir veya sürükleyip bırakabilirsiniz.
                    </p>
                  </>
                )}
              </div>

              {/* Previews of Selected Files - Side by Side (Yan Yana) */}
              {adminUploadFiles.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">
                      Yüklenecek Görseller ({adminUploadFiles.length} Adet - Yan Yana Önizleme):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminUploadFiles([]);
                        setAdminUploadData((prev) => ({ ...prev, mediaUrl: '' }));
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Tümünü Temizle
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {adminUploadFiles.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100 shadow-2xs">
                        <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                          #{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdminUploadFiles((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 hover:bg-rose-600 transition-all cursor-pointer"
                          title="Bu görseli kaldır"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Direct URL Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Veya Doğrudan Görsel URL Linki Girin (İsteğe Bağlı)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... veya harici görsel linki"
                value={adminUploadData.mediaUrl}
                onChange={(e) => setAdminUploadData({ ...adminUploadData, mediaUrl: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
              />
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Görsel / Albüm Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Sultan Selim Salonu Genel Kurul Açılışı"
                  value={adminUploadData.title}
                  onChange={(e) => setAdminUploadData({ ...adminUploadData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori / Albüm</label>
                <select
                  value={adminUploadData.category}
                  onChange={(e) => setAdminUploadData({ ...adminUploadData, category: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
                >
                  <option value="etkinlik">Genel Kurul & Etkinlik</option>
                  <option value="komisyon">Komisyon Müzakereleri</option>
                  <option value="kulis">Kulis & Sohbet Anları</option>
                  <option value="video">Video ve Röportajlar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Açıklama / Detay</label>
              <textarea
                rows={2}
                placeholder="Fotoğraf hakkında kısa bilgi..."
                value={adminUploadData.description}
                onChange={(e) => setAdminUploadData({ ...adminUploadData, description: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sıralama Önceliği</label>
                <input
                  type="number"
                  value={adminUploadData.order}
                  onChange={(e) => setAdminUploadData({ ...adminUploadData, order: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Görünürlük Seviyesi</label>
                <select
                  value={adminUploadData.visibility}
                  onChange={(e) => setAdminUploadData({ ...adminUploadData, visibility: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
                >
                  <option value="public">Herkese Açık (Genel Galeri)</option>
                  <option value="members">Sadece Onaylı Delegeler</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yayın Durumu</label>
                <div className="flex items-center gap-4 mt-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublished"
                      checked={adminUploadData.isPublished}
                      onChange={() => setAdminUploadData({ ...adminUploadData, isPublished: true })}
                      className="text-blue-600"
                    />
                    <span>Doğrudan Yayında</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublished"
                      checked={!adminUploadData.isPublished}
                      onChange={() => setAdminUploadData({ ...adminUploadData, isPublished: false })}
                      className="text-blue-600"
                    />
                    <span>Taslak / Gizli</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E6FFB] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Görselleri Galeriye Ekle ve Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION B & C: SUBMISSIONS & PUBLISHED GALLERY TABLE (RULES 12, 13)    */}
      {/* ========================================================================= */}
      {activeTab !== 'admin_upload' && (
        <div className="space-y-4">
          {/* Filter & Bulk Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="etkinlik">Etkinlik</option>
                <option value="komisyon">Komisyon</option>
                <option value="kulis">Kulis</option>
                <option value="video">Video</option>
              </select>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Başlık veya yükleyen ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
                />
              </div>

              {/* View Mode Toggle: Yan Yana (Izgara) vs Tablo */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Görselleri Yan Yana Göster"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#1E6FFB]" />
                  <span>Yan Yana ({filteredItems.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tablo Listesi Görünümü"
                >
                  <List className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tablo</span>
                </button>
              </div>
            </div>

            {/* Bulk Action Controls */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">
                  {selectedIds.length} Öğe Seçildi:
                </span>
                <button
                  onClick={() => handleBulkAction('approved')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  Seçilenleri Onayla
                </button>
                <button
                  onClick={() => handleBulkAction('rejected')}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  Seçilenleri Reddet
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  Sil
                </button>
              </div>
            )}
          </div>

          {/* Grid View (Yan Yana Kartlar) */}
          {viewMode === 'grid' && (
            <div>
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 italic">
                  Bu alanda görüntülenecek medya ögesi bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`group bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between relative shadow-2xs hover:shadow-md ${
                          isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Card Image Area */}
                        <div 
                          className="relative aspect-[4/3] bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
                          onClick={() => setPreviewItem(item)}
                        >
                          <img
                            src={item.mediaUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none"
                          />
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-contain p-1 relative z-10 group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Checkbox overlay */}
                          <div 
                            className="absolute top-2 left-2 z-20" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(item.id)}
                              className="rounded text-blue-600 w-4 h-4 cursor-pointer bg-white/90 shadow-sm"
                            />
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-2 right-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-xs text-white uppercase">
                              {item.category}
                            </span>
                          </div>

                          {/* Zoom Hover Overlay */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs line-clamp-1" title={item.title}>
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {item.uploaderName || 'Admin'} • {item.createdAt}
                            </p>
                          </div>

                          <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              item.status === 'approved' || item.isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.isApproved ? 'Yayında' : item.status === 'rejected' ? 'Red' : 'Bekliyor'}
                            </span>

                            <div className="flex items-center gap-1">
                              {(!item.isApproved || item.status !== 'approved') && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(item.id)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer transition-colors"
                                  title="Görseli Onayla ve Galeriye Al"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {item.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReject(item)}
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg cursor-pointer transition-colors"
                                  title="Görseli Reddet"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                          onChange={handleSelectAll}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 w-28">Görsel</th>
                      <th className="py-3 px-4">Başlık ve Kategori</th>
                      <th className="py-3 px-4">Yükleyen Kişi</th>
                      <th className="py-3 px-4">Yükleme Tarihi</th>
                      <th className="py-3 px-4 text-center">Durum</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                          Bu alanda görüntülenecek medya ögesi bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(item.id)}
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>

                            {/* Thumbnail with Click to Expand Modal */}
                            <td className="py-3 px-4">
                              <div 
                                onClick={() => setPreviewItem(item)}
                                className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative cursor-pointer group shadow-2xs"
                              >
                                <img
                                  src={item.mediaUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Maximize2 className="w-4 h-4" />
                                </div>
                              </div>
                            </td>

                            {/* Title & Category */}
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{item.title}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  {item.category.toUpperCase()}
                                </span>
                                {item.visibility && (
                                  <span className="text-[10px] text-slate-400">
                                    {item.visibility === 'public' ? 'Herkese Açık' : 'Delegelere Özel'}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Uploader */}
                            <td className="py-3 px-4 text-slate-700">
                              <span className="font-medium block">{item.uploaderName || 'Bilinmiyor'}</span>
                              <span className="text-[10px] text-slate-400">{item.uploaderEmail || '-'}</span>
                            </td>

                            {/* Date */}
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                              {item.createdAt}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'approved' || item.isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.isApproved ? 'Yayında' : item.status === 'rejected' ? 'Reddedildi' : 'Onay Bekliyor'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {(!item.isApproved || item.status !== 'approved') && (
                                  <button
                                    onClick={() => handleApprove(item.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                    title="Görseli Onayla ve Galeriye Al"
                                  >
                                    <Check className="w-3 h-3" />
                                    Onayla
                                  </button>
                                )}

                                {item.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleOpenReject(item)}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Görseli Reddet"
                                  >
                                    <X className="w-3 h-3" />
                                    Reddet
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LIGHTBOX / LARGE MEDIA PREVIEW MODAL                                   */}
      {/* ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{previewItem.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Yükleyen: {previewItem.uploaderName} • {previewItem.createdAt}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={previewItem.mediaUrl}
                alt={previewItem.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between text-xs">
              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                previewItem.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {previewItem.isApproved ? 'Onaylandı (Yayında)' : 'Moderasyon Bekliyor'}
              </span>

              <div className="flex items-center gap-2">
                {!previewItem.isApproved && (
                  <button
                    onClick={() => handleApprove(previewItem.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Onayla ve Yayına Al
                  </button>
                )}
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REJECTION NOTE MODAL                                                    */}
      {/* ========================================================================= */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-2">
              Görseli Reddet
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              <strong>{rejectItem.title}</strong> görseli reddedilecek ve public galeride gösterilmeyecektir. İsteğe bağlı red nedeni girebilirsiniz.
            </p>

            <textarea
              rows={3}
              placeholder="Reddetme gerekçesi (Örn: Çözünürlük yetersiz, meclis kurallarına uygun değil...)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
              >
                Reddi Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
