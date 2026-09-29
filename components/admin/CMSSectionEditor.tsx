'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layout,
  Layers,
  Sparkles,
  Users,
  Calendar,
  MessageSquare,
  HelpCircle,
  MapPin,
  Eye,
  Sliders,
  Award,
  Link as LinkIcon,
  Video,
  Play,
  FileText,
  Phone,
  Mail,
  Clock,
  Car,
  Train,
  Plane,
  Bus,
  BookOpen,
  Building2,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { 
  CMSData, 
  SliderItem, 
  getStoredCMSData, 
  saveStoredCMSData,
  saveStoredCMSDataAsync,
  fetchServerCMSData,
  resetCMSData,
  INITIAL_CMS_DATA 
} from '@/lib/cmsStorage';
import { TEAM_MEMBERS } from '@/lib/data';
import CMSImageUploader from '@/components/admin/CMSImageUploader';

interface CMSSectionEditorProps {
  activeTab: 'anasayfa' | 'hakkimizda' | 'komisyonlar' | 'ekip' | 'program' | 'iletisim' | 'basvuru' | 'galeri';
}

export default function CMSSectionEditor({ activeTab }: CMSSectionEditorProps) {
  const [data, setData] = useState<CMSData>(getStoredCMSData());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Tüm değişiklikler başarıyla kaydedildi!');

  useEffect(() => {
    setData(getStoredCMSData());
    // Sunucudan en güncel kalıcı veriyi yükle
    fetchServerCMSData().then((serverData) => {
      if (serverData) {
        setData(serverData);
      }
    });
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveStoredCMSDataAsync(data);
    setIsSaving(false);
    if (res.success) {
      setHasUnsavedChanges(false);
      setSaveMessage('Tüm değişiklikler sunucuya (data/cms-content.json) ve canlı sayfaya kalıcı olarak kaydedildi!');
    } else {
      setSaveMessage(`Tarayıcıya kaydedildi, sunucu uyarısı: ${res.error || 'Bilinmeyen hata'}`);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
  };

  const handleReset = () => {
    if (confirm('Tüm CMS verilerini başlangıç varsayılanlarına sıfırlamak istediğinizden emin misiniz? Yapılan tüm özel değişiklikler silinecektir.')) {
      const reset = resetCMSData();
      setData(reset);
      setHasUnsavedChanges(false);
      setSaveMessage('Tüm CMS verileri başlangıç ayarlarına sıfırlandı.');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  const updateCMS = (updater: (prev: CMSData) => CMSData) => {
    setData((prev) => {
      const updated = updater({ ...prev });
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar with Sticky Save Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#092746]/50 border border-[#00B4D8]/20 backdrop-blur-xl p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30">
              CMS Editörü
            </span>
            <span className="text-xs text-slate-400 capitalize">
              {activeTab === 'anasayfa' && 'Ana Sayfa Metin, Görsel & İçerik Yönetimi'}
              {activeTab === 'hakkimizda' && 'Hakkımızda (Vizyon, Misyon, İrfan Meclisi, Medya)'}
              {activeTab === 'komisyonlar' && '8 İhtisas Komisyonu Yönetimi'}
              {activeTab === 'ekip' && 'Ekip & Divan Heyeti Yönetimi'}
              {activeTab === 'program' && '3 Günlük Etkinlik Takvimi'}
              {activeTab === 'basvuru' && 'Delege Başvuru Sayfası Ayarları'}
              {activeTab === 'galeri' && 'Galeri Sayfası Ayarları'}
              {activeTab === 'iletisim' && 'İletişim & Ulaşım Bilgileri'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-[#00B4D8]" />
            Dinamik Sayfa İçerik Yönetimi
          </h2>
        </div>

        {/* Global Save / Reset Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Varsayılanlara Sıfırla"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sıfırla
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-[#05101F] shadow-[#00B4D8]/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            } disabled:opacity-50`}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Sunucuya Kaydediliyor...' : hasUnsavedChanges ? 'Değişiklikleri Kalıcı Kaydet' : 'Kaydedildi (Kalıcı)'}
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400">
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{saveMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ANA SAYFA                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'anasayfa' && (
        <div className="space-y-6">
          
          {/* Section 1: Hero & Geri Sayım */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00B4D8]" />
              Ana Sayfa Hero & Geri Sayım Alanı
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Üst Başlık (Kurum Adı)</label>
                <input
                  type="text"
                  value={data.homepage.heroPrefix || 'ÖNDER DERNEĞİ ÖNCÜLÜĞÜNDE'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: { ...prev.homepage, heroPrefix: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-[#00B4D8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ana Başlık (Büyük Serif)</label>
                <input
                  type="text"
                  value={data.homepage.heroTitle || 'İRFAN MECLİSİ'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: { ...prev.homepage, heroTitle: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-[#00B4D8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motto / Slogan (Rozet)</label>
                <input
                  type="text"
                  value={data.siteSettings.slogan || 'KÖKÜMÜZ İRFAN, SÖZÜMÜZ İSTİKBAL'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      siteSettings: { ...prev.siteSettings, slogan: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-[#00B4D8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Geri Sayım Hedef Tarihi (ISO)</label>
                <input
                  type="text"
                  value={data.siteSettings.targetDate || '2026-10-23T09:00:00+03:00'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      siteSettings: { ...prev.siteSettings, targetDate: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-[#00B4D8] focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Geri Sayım Üst Duyuru Metni</label>
                <input
                  type="text"
                  value={data.siteSettings.countdownText || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      siteSettings: { ...prev.siteSettings, countdownText: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-[#00B4D8] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Açıklama Metni</label>
                <textarea
                  rows={2}
                  value={data.homepage.heroDesc || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: { ...prev.homepage, heroDesc: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:border-[#00B4D8] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <CMSImageUploader
                  label="Hero Arka Plan Görseli"
                  helperText="Ana sayfa üst karşılama arka planı (1024x575 veya geniş format)"
                  value={data.homepage.heroBgImage || '/images/anasayfa-arkaplan.png'}
                  onChange={(url) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: { ...prev.homepage, heroBgImage: url }
                    }))
                  }
                  aspectRatio="banner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sağ Sütun Tipografik Alıntı</label>
                <input
                  type="text"
                  value={data.homepage.editorialQuote || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: { ...prev.homepage, editorialQuote: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-[#00B4D8] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Neden İrfan Meclisi */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00B4D8]" />
              Neden İrfan Meclisi? (Beyaz Editöryal Bölüm)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Üst Etiket (Tag)</label>
                <input
                  type="text"
                  value={data.homepage.aboutSummary?.tag || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        aboutSummary: { ...prev.homepage.aboutSummary, tag: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bölüm Başlığı</label>
                <input
                  type="text"
                  value={data.homepage.aboutSummary?.heading || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        aboutSummary: { ...prev.homepage.aboutSummary, heading: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama Paragrafı</label>
                <textarea
                  rows={3}
                  value={data.homepage.aboutSummary?.paragraph || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        aboutSummary: { ...prev.homepage.aboutSummary, paragraph: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <CMSImageUploader
                  label="Bölüm Tanıtım Görseli"
                  helperText="Neden İrfan Meclisi yanındaki ana görsel"
                  value={data.homepage.aboutSummary?.imageUrl || ''}
                  onChange={(url) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        aboutSummary: { ...prev.homepage.aboutSummary, imageUrl: url }
                      }
                    }))
                  }
                  aspectRatio="video"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Görsel Yanı Vurgu Alıntısı</label>
                <input
                  type="text"
                  value={data.homepage.aboutSummary?.quote || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        aboutSummary: { ...prev.homepage.aboutSummary, quote: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: 4 Özellik Şeridi */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#00B4D8]" />
              4 Temel Özellik Şeridi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.homepage.features || INITIAL_CMS_DATA.homepage.features).map((feat, idx) => (
                <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-mono text-[#00B4D8] font-bold">Özellik #{idx + 1}</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Metin</label>
                    <textarea
                      rows={2}
                      value={feat.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...(prev.homepage.features || INITIAL_CMS_DATA.homepage.features)];
                          updated[idx] = { ...updated[idx], title: val };
                          return { ...prev, homepage: { ...prev.homepage, features: updated } };
                        });
                      }}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Etkinlik Atmosferi Fotoğrafları */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#00B4D8]" />
              Etkinlik Atmosferi Showcase
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bölüm Başlığı</label>
                <input
                  type="text"
                  value={data.homepage.atmosphere?.heading || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        atmosphere: { ...prev.homepage.atmosphere, heading: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={data.homepage.atmosphere?.description || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        atmosphere: { ...prev.homepage.atmosphere, description: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {(data.homepage.atmosphere?.photos || INITIAL_CMS_DATA.homepage.atmosphere.photos).map((photo, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-[#00B4D8] font-bold">Kare #{idx + 1}</span>
                  <input
                    type="text"
                    value={photo.title}
                    placeholder="Başlık"
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCMS((prev) => {
                        const updated = [...(prev.homepage.atmosphere?.photos || INITIAL_CMS_DATA.homepage.atmosphere.photos)];
                        updated[idx] = { ...updated[idx], title: val };
                        return {
                          ...prev,
                          homepage: {
                            ...prev.homepage,
                            atmosphere: { ...prev.homepage.atmosphere, photos: updated }
                          }
                        };
                      });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={photo.subtitle}
                    placeholder="Alt Başlık"
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCMS((prev) => {
                        const updated = [...(prev.homepage.atmosphere?.photos || INITIAL_CMS_DATA.homepage.atmosphere.photos)];
                        updated[idx] = { ...updated[idx], subtitle: val };
                        return {
                          ...prev,
                          homepage: {
                            ...prev.homepage,
                            atmosphere: { ...prev.homepage.atmosphere, photos: updated }
                          }
                        };
                      });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs"
                  />
                  <CMSImageUploader
                    value={photo.url}
                    onChange={(url) => {
                      updateCMS((prev) => {
                        const updated = [...(prev.homepage.atmosphere?.photos || INITIAL_CMS_DATA.homepage.atmosphere.photos)];
                        updated[idx] = { ...updated[idx], url };
                        return {
                          ...prev,
                          homepage: {
                            ...prev.homepage,
                            atmosphere: { ...prev.homepage.atmosphere, photos: updated }
                          }
                        };
                      });
                    }}
                    compact
                    aspectRatio="square"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Sayılarla Meclis Stats */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#00B4D8]" />
                Sayılarla İrfan Meclisi (İstatistik Kartları Yönetimi)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newStat = {
                    value: '100',
                    suffix: '+',
                    label: 'Yeni İstatistik',
                    description: 'İstatistik açıklaması'
                  };
                  updateCMS((prev) => ({
                    ...prev,
                    homepage: {
                      ...prev.homepage,
                      stats: [...(prev.homepage.stats || INITIAL_CMS_DATA.homepage.stats), newStat]
                    }
                  }));
                }}
                className="px-3 py-1.5 bg-[#00B4D8] text-[#05101F] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer w-fit"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Kart Ekle
              </button>
            </div>

            {/* Bölüm Başlık & Etiket Ayarları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Üst Rozet / Etiket</label>
                <input
                  type="text"
                  value={data.homepage.statsSection?.tag || 'RAKAMLARLA MECLİS'}
                  placeholder="RAKAMLARLA MECLİS"
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        statsSection: {
                          tag: val,
                          heading: prev.homepage.statsSection?.heading || 'Sayılarla İrfan Meclisi 2026',
                          description: prev.homepage.statsSection?.description || "Dünya Selçuklu Kongre Merkezi'nde gerçekleşecek tarihi buluşmanın organizasyon gücü ve delege kapasitesi."
                        }
                      }
                    }));
                  }}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bölüm Ana Başlığı</label>
                <input
                  type="text"
                  value={data.homepage.statsSection?.heading || 'Sayılarla İrfan Meclisi 2026'}
                  placeholder="Sayılarla İrfan Meclisi 2026"
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        statsSection: {
                          tag: prev.homepage.statsSection?.tag || 'RAKAMLARLA MECLİS',
                          heading: val,
                          description: prev.homepage.statsSection?.description || "Dünya Selçuklu Kongre Merkezi'nde gerçekleşecek tarihi buluşmanın organizasyon gücü ve delege kapasitesi."
                        }
                      }
                    }));
                  }}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bölüm Açıklaması</label>
                <input
                  type="text"
                  value={data.homepage.statsSection?.description || "Dünya Selçuklu Kongre Merkezi'nde gerçekleşecek tarihi buluşmanın organizasyon gücü ve delege kapasitesi."}
                  placeholder="Bölüm altındaki açıklama metni"
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        statsSection: {
                          tag: prev.homepage.statsSection?.tag || 'RAKAMLARLA MECLİS',
                          heading: prev.homepage.statsSection?.heading || 'Sayılarla İrfan Meclisi 2026',
                          description: val
                        }
                      }
                    }));
                  }}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-xs"
                />
              </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.homepage.stats || INITIAL_CMS_DATA.homepage.stats).map((stat, idx) => (
                <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#00B4D8] font-bold">Kart #{idx + 1}</span>
                    {(data.homepage.stats || INITIAL_CMS_DATA.homepage.stats).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          updateCMS((prev) => {
                            const updated = [...(prev.homepage.stats || INITIAL_CMS_DATA.homepage.stats)];
                            updated.splice(idx, 1);
                            return { ...prev, homepage: { ...prev.homepage, stats: updated } };
                          });
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 transition-colors"
                        title="Kartı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={stat.value}
                      placeholder="Değer (örn: 250)"
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...(prev.homepage.stats || INITIAL_CMS_DATA.homepage.stats)];
                          updated[idx] = { ...updated[idx], value: val };
                          return { ...prev, homepage: { ...prev.homepage, stats: updated } };
                        });
                      }}
                      className="w-2/3 p-2 bg-slate-950 border border-slate-800 rounded text-white text-base font-bold font-mono"
                    />
                    <input
                      type="text"
                      value={stat.suffix}
                      placeholder="+"
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...(prev.homepage.stats || INITIAL_CMS_DATA.homepage.stats)];
                          updated[idx] = { ...updated[idx], suffix: val };
                          return { ...prev, homepage: { ...prev.homepage, stats: updated } };
                        });
                      }}
                      className="w-1/3 p-2 bg-slate-950 border border-slate-800 rounded text-[#00B4D8] text-base font-bold font-mono"
                    />
                  </div>
                  <input
                    type="text"
                    value={stat.label}
                    placeholder="Etiket (örn: Asil Delege)"
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCMS((prev) => {
                        const updated = [...(prev.homepage.stats || INITIAL_CMS_DATA.homepage.stats)];
                        updated[idx] = { ...updated[idx], label: val };
                        return { ...prev, homepage: { ...prev.homepage, stats: updated } };
                      });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-xs font-semibold"
                  />
                  <textarea
                    rows={2}
                    value={stat.description}
                    placeholder="Açıklama"
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCMS((prev) => {
                        const updated = [...(prev.homepage.stats || INITIAL_CMS_DATA.homepage.stats)];
                        updated[idx] = { ...updated[idx], description: val };
                        return { ...prev, homepage: { ...prev.homepage, stats: updated } };
                      });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-400 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: SSS */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00B4D8]" />
                Sıkça Sorulan Sorular (SSS) ({data.homepage.faq.length})
              </h3>
              <button
                onClick={() => {
                  const newFaq = {
                    question: 'Yeni Soru Başlığı?',
                    answer: 'Cevap metni buraya yazılacaktır.'
                  };
                  updateCMS((prev) => ({
                    ...prev,
                    homepage: { ...prev.homepage, faq: [...prev.homepage.faq, newFaq] }
                  }));
                }}
                className="px-3 py-1.5 bg-[#00B4D8] text-[#05101F] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Soru Ekle
              </button>
            </div>

            <div className="space-y-3">
              {data.homepage.faq.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.homepage.faq];
                          updated[idx] = { ...updated[idx], question: val };
                          return { ...prev, homepage: { ...prev.homepage, faq: updated } };
                        });
                      }}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-xs font-bold"
                    />
                    <button
                      onClick={() => {
                        updateCMS((prev) => ({
                          ...prev,
                          homepage: { ...prev.homepage, faq: prev.homepage.faq.filter((_, i) => i !== idx) }
                        }));
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCMS((prev) => {
                        const updated = [...prev.homepage.faq];
                        updated[idx] = { ...updated[idx], answer: val };
                        return { ...prev, homepage: { ...prev.homepage, faq: updated } };
                      });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Final CTA */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00B4D8]" />
              Final Delege Başvuru Çağrısı (CTA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Başlık</label>
                <input
                  type="text"
                  value={data.homepage.finalCta?.heading || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        finalCta: { ...prev.homepage.finalCta, heading: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Buton Metni</label>
                <input
                  type="text"
                  value={data.homepage.finalCta?.buttonText || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        finalCta: { ...prev.homepage.finalCta, buttonText: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={data.homepage.finalCta?.description || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      homepage: {
                        ...prev.homepage,
                        finalCta: { ...prev.homepage.finalCta, description: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HAKKIMIZDA                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'hakkimizda' && (
        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Hakkımızda Hero Bölümü</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rozet Metni</label>
                <input
                  type="text"
                  value={data.aboutPage.heroBadge || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: { ...prev.aboutPage, heroBadge: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sayfa Başlığı</label>
                <input
                  type="text"
                  value={data.aboutPage.heroTitle}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: { ...prev.aboutPage, heroTitle: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={data.aboutPage.heroDesc}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: { ...prev.aboutPage, heroDesc: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* İRFAN MECLİSİ - MERKEZİ VİTRİN BÖLÜMÜ */}
          <div className="bg-[#05101F] border-2 border-[#00B4D8]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00B4D8]/20 text-[#00B4D8]">Merkezi Vitrin</span>
              <h3 className="text-lg font-bold text-white">İrfan Meclisi Modeli</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Başlık</label>
                <input
                  type="text"
                  value={data.aboutPage.irfanMeclisi.title}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        irfanMeclisi: { ...prev.aboutPage.irfanMeclisi, title: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alt Başlık</label>
                <input
                  type="text"
                  value={data.aboutPage.irfanMeclisi.subtitle}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        irfanMeclisi: { ...prev.aboutPage.irfanMeclisi, subtitle: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">İçerik Metni</label>
                <textarea
                  rows={4}
                  value={data.aboutPage.irfanMeclisi.content}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        irfanMeclisi: { ...prev.aboutPage.irfanMeclisi, content: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* VİZYON & MİSYON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vizyon */}
            <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-[#00B4D8] text-base">Vizyonumuz</h4>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Başlık</label>
                <input
                  type="text"
                  value={data.aboutPage.vizyon.title}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        vizyon: { ...prev.aboutPage.vizyon, title: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Alt Başlık</label>
                <input
                  type="text"
                  value={data.aboutPage.vizyon.subtitle}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        vizyon: { ...prev.aboutPage.vizyon, subtitle: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">İçerik</label>
                <textarea
                  rows={4}
                  value={data.aboutPage.vizyon.content}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        vizyon: { ...prev.aboutPage.vizyon, content: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Misyon */}
            <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-[#00B4D8] text-base">Misyonumuz</h4>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Başlık</label>
                <input
                  type="text"
                  value={data.aboutPage.misyon.title}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        misyon: { ...prev.aboutPage.misyon, title: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Alt Başlık</label>
                <input
                  type="text"
                  value={data.aboutPage.misyon.subtitle}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        misyon: { ...prev.aboutPage.misyon, subtitle: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">İçerik</label>
                <textarea
                  rows={4}
                  value={data.aboutPage.misyon.content}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        misyon: { ...prev.aboutPage.misyon, content: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Medya & Video Vitrini */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#00B4D8]" />
                  Hakkımızda Medya & Video Vitrini ({data.aboutPage.mediaGallery.length})
                </h3>
                <p className="text-xs text-slate-400">Sayfada gösterilecek etkinlik salonu, kongre merkezi ve tanıtım videoları.</p>
              </div>
              <button
                onClick={() => {
                  const newItem = {
                    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
                    title: 'Yeni Etkinlik Karesi',
                    subtitle: 'Selçuklu Kongre Merkezi',
                    type: 'image' as const
                  };
                  updateCMS((prev) => ({
                    ...prev,
                    aboutPage: {
                      ...prev.aboutPage,
                      mediaGallery: [...prev.aboutPage.mediaGallery, newItem]
                    }
                  }));
                }}
                className="px-3 py-1.5 bg-[#00B4D8] text-[#05101F] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Medya Ekle
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.aboutPage.mediaGallery.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#00B4D8] uppercase">{m.type}</span>
                    <button
                      onClick={() => {
                        updateCMS((prev) => ({
                          ...prev,
                          aboutPage: {
                            ...prev.aboutPage,
                            mediaGallery: prev.aboutPage.mediaGallery.filter((_, i) => i !== idx)
                          }
                        }));
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={m.title}
                    placeholder="Başlık"
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCMS((prev) => {
                        const updated = [...prev.aboutPage.mediaGallery];
                        updated[idx] = { ...updated[idx], title: val };
                        return { ...prev, aboutPage: { ...prev.aboutPage, mediaGallery: updated } };
                      });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={m.subtitle}
                    placeholder="Alt Başlık"
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCMS((prev) => {
                        const updated = [...prev.aboutPage.mediaGallery];
                        updated[idx] = { ...updated[idx], subtitle: val };
                        return { ...prev, aboutPage: { ...prev.aboutPage, mediaGallery: updated } };
                      });
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs"
                  />
                  <CMSImageUploader
                    label="Medya Görseli"
                    value={m.url}
                    onChange={(url) => {
                      updateCMS((prev) => {
                        const updated = [...prev.aboutPage.mediaGallery];
                        updated[idx] = { ...updated[idx], url };
                        return { ...prev, aboutPage: { ...prev.aboutPage, mediaGallery: updated } };
                      });
                    }}
                    compact
                    aspectRatio="video"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ÖNDER Tanıtımı */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00B4D8]" />
              ÖNDER Kurumsal Tanıtım Alanı
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Başlık</label>
                <input
                  type="text"
                  value={data.aboutPage.timav.heading}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        timav: { ...prev.aboutPage.timav, heading: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Video URL (Tanıtım Filmi)</label>
                <input
                  type="text"
                  value={data.aboutPage.timav.videoUrl}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        timav: { ...prev.aboutPage.timav, videoUrl: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">1. Paragraf</label>
                <textarea
                  rows={2}
                  value={data.aboutPage.timav.p1}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        timav: { ...prev.aboutPage.timav, p1: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">2. Paragraf</label>
                <textarea
                  rows={2}
                  value={data.aboutPage.timav.p2}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      aboutPage: {
                        ...prev.aboutPage,
                        timav: { ...prev.aboutPage.timav, p2: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KOMİSYONLAR                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'komisyonlar' && (
        <div className="space-y-6">
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#00B4D8]" />
                    İhtisas Komisyonları ({data.commissions.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Komisyonların isimlerini, açıklamalarını, gündem konularını ve hedeflerini düzenleyin, yeni komisyon ekleyin veya silin.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const id = `kom-${Date.now()}`;
                    const newComm = {
                      id,
                      name: 'Yeni İhtisas Komisyonu',
                      shortName: 'Yeni Komisyon',
                      description: 'Komisyon görev alanı ve çalışma hedefleri.',
                      coverImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
                      iconName: 'Scale',
                      topics: ['Gündem Maddesi 1', 'Gündem Maddesi 2'],
                      objectives: ['Hedef 1', 'Hedef 2']
                    };
                    updateCMS((prev) => ({
                      ...prev,
                      commissions: [...prev.commissions, newComm]
                    }));
                  }}
                  className="px-3.5 py-2 bg-[#00B4D8] text-[#05101F] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-[#00B4D8]/90"
                >
                  <Plus className="w-4 h-4" /> Yeni Komisyon Ekle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.commissions.map((comm, idx) => (
                  <div key={comm.id || idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00B4D8]/20 text-[#00B4D8]">
                        #{idx + 1} {comm.shortName}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`"${comm.name}" komisyonunu silmek istediğinize emin misiniz?`)) {
                            updateCMS((prev) => ({
                              ...prev,
                              commissions: prev.commissions.filter((_, i) => i !== idx)
                            }));
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                        title="Komisyonu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Komisyon Adı</label>
                      <input
                        type="text"
                        value={comm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCMS((prev) => {
                            const updated = [...prev.commissions];
                            updated[idx] = { ...updated[idx], name: val };
                            return { ...prev, commissions: updated };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Kısa İsim</label>
                      <input
                        type="text"
                        value={comm.shortName}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCMS((prev) => {
                            const updated = [...prev.commissions];
                            updated[idx] = { ...updated[idx], shortName: val };
                            return { ...prev, commissions: updated };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Açıklama</label>
                      <textarea
                        rows={2}
                        value={comm.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCMS((prev) => {
                            const updated = [...prev.commissions];
                            updated[idx] = { ...updated[idx], description: val };
                            return { ...prev, commissions: updated };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Kapak Görseli</label>
                      <CMSImageUploader
                        value={comm.coverImageUrl}
                        onChange={(url) => {
                          updateCMS((prev) => {
                            const updated = [...prev.commissions];
                            updated[idx] = { ...updated[idx], coverImageUrl: url };
                            return { ...prev, commissions: updated };
                          });
                        }}
                        compact
                        aspectRatio="wide"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Çalışma Konuları (Virgülle Ayırın)
                      </label>
                      <input
                        type="text"
                        value={(comm.topics || []).join(', ')}
                        onChange={(e) => {
                          const val = e.target.value.split(',').map((t) => t.trim());
                          updateCMS((prev) => {
                            const updated = [...prev.commissions];
                            updated[idx] = { ...updated[idx], topics: val };
                            return { ...prev, commissions: updated };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[#00B4D8] text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EKİP                                                               */}
      {/* ========================================================================= */}
      {activeTab === 'ekip' && (
        <div className="space-y-6">
          {/* Ekip Sayfası Genel Başlık ve Rozet Ayarları */}
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00B4D8]" />
                Ekip Sayfası Genel Bilgileri & Rozet Ayarları
              </h3>
              <p className="text-xs text-slate-400">
                Ekip sayfasının üst başlıkları ve üye kartlarının sağ altındaki "ÖNDER Ekibi" yazısını düzenleyin.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sayfa Üst Rozet Metni</label>
                <input
                  type="text"
                  value={data.ekipPage?.heroBadge || 'GÖNÜLLÜ VE PROFESYONEL KADRO'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      ekipPage: { ...prev.ekipPage, heroBadge: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sayfa Başlığı</label>
                <input
                  type="text"
                  value={data.ekipPage?.heroTitle || '100 Kişilik Organizasyon Ekibi'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      ekipPage: { ...prev.ekipPage, heroTitle: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama Metni</label>
                <textarea
                  rows={2}
                  value={data.ekipPage?.heroDesc || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      ekipPage: { ...prev.ekipPage, heroDesc: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-bold text-[#00B4D8] mb-1">
                  Varsayılan Kart Rozet Metni (Kart Sağ Alt Köşe — "ÖNDER Ekibi" Kısmı)
                </label>
                <input
                  type="text"
                  value={data.ekipPage?.defaultAffiliation ?? 'ÖNDER Ekibi'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      ekipPage: { ...prev.ekipPage, defaultAffiliation: e.target.value }
                    }))
                  }
                  placeholder="Örn: ÖNDER Ekibi"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-[#00B4D8]"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Tüm ekip üyelerinin kartlarında sağ alt köşede görünen varsayılan kurum/ekip rozet metnidir. Aşağıdaki üye kartlarından her üye için ayrı ayrı da özelleştirilebilir.
                </p>
              </div>
            </div>
          </div>

          {/* Helper: Ekip Üyesi Kartı Şablonu */}
          {(() => {
            const isAkademiMember = (m: any) =>
              m.teamType === 'akademi' ||
              (!m.teamType && (m.category === 'akademik' || m.category === 'komisyon_baskani' || (m.role && m.role.toLowerCase().includes('komisyon'))));

            const orgMembers = data.team
              .map((member, idx) => ({ member, idx }))
              .filter(({ member }) => !isAkademiMember(member));

            const acadMembers = data.team
              .map((member, idx) => ({ member, idx }))
              .filter(({ member }) => isAkademiMember(member));

            const renderMemberCard = (member: typeof data.team[0], idx: number, teamLabel: string, badgeBg: string) => (
              <div key={member.id || idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    {member.imageUrl ? (
                      <Image src={member.imageUrl} alt={member.fullName} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${badgeBg}`}>
                        {teamLabel}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={member.fullName}
                      placeholder="Ad Soyad"
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], fullName: val };
                          return { ...prev, team: updated };
                        });
                      }}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold text-xs"
                    />
                    <input
                      type="text"
                      value={member.role}
                      placeholder="Görev / Unvan"
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], role: val };
                          return { ...prev, team: updated };
                        });
                      }}
                      className="w-full px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[#00B4D8] text-[11px] mt-1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${member.fullName}" isimli üyeyi silmek istediğinizden emin misiniz?`)) {
                        updateCMS((prev) => ({
                          ...prev,
                          team: prev.team.filter((_, i) => i !== idx)
                        }));
                      }
                    }}
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    title="Üyeyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Ekip Bölümü Seçimi */}
                  <div>
                    <label className="text-[10px] text-cyan-400 uppercase font-bold block mb-0.5">
                      Ekip Bölümü (Sayfada Görüneceği Yer)
                    </label>
                    <select
                      value={member.teamType || (isAkademiMember(member) ? 'akademi' : 'organizasyon')}
                      onChange={(e) => {
                        const val = e.target.value as 'organizasyon' | 'akademi';
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], teamType: val };
                          return { ...prev, team: updated };
                        });
                      }}
                      className="w-full px-2 py-1 bg-slate-950 border border-cyan-500/40 rounded text-cyan-200 text-xs font-semibold focus:border-cyan-400"
                    >
                      <option value="organizasyon">Organizasyon Ekibi</option>
                      <option value="akademi">Akademi Ekibi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Üniversite / Kurum</label>
                    <input
                      type="text"
                      value={member.university || ''}
                      placeholder="Örn: Selçuk Üniversitesi"
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], university: val };
                          return { ...prev, team: updated };
                        });
                      }}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Birim / Kategori</label>
                    <select
                      value={member.category || (isAkademiMember(member) ? 'komisyon_baskani' : 'divan')}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], category: val };
                          return { ...prev, team: updated };
                        });
                      }}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 text-xs"
                    >
                      <option value="divan">Genel Koordinasyon & Divan</option>
                      <option value="komisyon_baskani">Komisyon Başkanları</option>
                      <option value="yonetim">Yönetim Kurulu</option>
                      <option value="akademik">Akademik Danışmanlar</option>
                      <option value="koordinasyon">Gençlik Koordinasyonu</option>
                      <option value="genel_koordinasyon">Genel Koordinasyon</option>
                      <option value="basin_medya">Basın & Medya</option>
                      <option value="lojistik">Lojistik & Protokol</option>
                      <option value="delege_iliskileri">Delege İlişkileri</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-amber-400 uppercase font-semibold block mb-0.5">
                      Görev Tanımı ve Biyografi Özeti
                    </label>
                    <textarea
                      rows={2}
                      value={member.bio || ''}
                      placeholder="Görev tanımı ve biyografi özeti yazın..."
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], bio: val };
                          return { ...prev, team: updated };
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#00B4D8] uppercase font-semibold block mb-0.5">
                      Kurum / Rozet Metni (Sağ Alt - "ÖNDER Ekibi" Kısmı)
                    </label>
                    <input
                      type="text"
                      value={member.affiliation ?? ''}
                      placeholder={data.ekipPage?.defaultAffiliation || 'ÖNDER Ekibi'}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], affiliation: val };
                          return { ...prev, team: updated };
                        });
                      }}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:border-[#00B4D8]"
                    />
                    <span className="text-[9px] text-slate-500">
                      Boş bırakılırsa varsayılan ({data.ekipPage?.defaultAffiliation || 'ÖNDER Ekibi'}) kullanılır.
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Üye Fotoğrafı</label>
                    <CMSImageUploader
                      value={member.imageUrl || ''}
                      onChange={(url) => {
                        updateCMS((prev) => {
                          const updated = [...prev.team];
                          updated[idx] = { ...updated[idx], imageUrl: url };
                          return { ...prev, team: updated };
                        });
                      }}
                      compact
                      aspectRatio="square"
                    />
                  </div>
                </div>
              </div>
            );

            return (
              <div className="space-y-8">
                {/* 1. BÖLÜM: ORGANİZASYON EKİBİ YÖNETİMİ */}
                <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <Briefcase className="w-5 h-5 text-[#00B4D8]" />
                        <h3 className="text-lg font-bold text-white">Organizasyon Ekibi Yönetimi</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00B4D8]/20 text-[#00B4D8] border border-[#00B4D8]/30">
                          {orgMembers.length} Üye
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Ekip sayfasındaki "Organizasyon Ekibi" bölümünde görünen saha, divan, koordinasyon ve operasyon üyelerini yönetin.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newMember = {
                          id: `member-${Date.now()}`,
                          fullName: 'Yeni Organizasyon Ekip Üyesi',
                          role: 'Koordinatör',
                          bio: 'Etkinlik planlama, saha koordinasyonu ve operasyonel yönetim.',
                          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                          university: 'Selçuk Üniversitesi',
                          category: 'divan' as const,
                          teamType: 'organizasyon' as const,
                          affiliation: data.ekipPage?.defaultAffiliation || 'ÖNDER Ekibi'
                        };
                        updateCMS((prev) => ({
                          ...prev,
                          team: [...prev.team, newMember]
                        }));
                      }}
                      className="px-4 py-2 bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-[#05101F] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-sm shadow-[#00B4D8]/20"
                    >
                      <Plus className="w-4 h-4" /> Organizasyon Ekip Üyesi Ekle
                    </button>
                  </div>

                  {orgMembers.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-2">
                      <p className="text-slate-400 text-sm">Henüz Organizasyon Ekibi üyesi bulunmuyor.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const newMember = {
                            id: `member-${Date.now()}`,
                            fullName: 'Yeni Organizasyon Ekip Üyesi',
                            role: 'Koordinatör',
                            bio: 'Etkinlik planlama, saha koordinasyonu ve operasyonel yönetim.',
                            imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                            university: 'Selçuk Üniversitesi',
                            category: 'divan' as const,
                            teamType: 'organizasyon' as const,
                            affiliation: data.ekipPage?.defaultAffiliation || 'ÖNDER Ekibi'
                          };
                          updateCMS((prev) => ({
                            ...prev,
                            team: [...prev.team, newMember]
                          }));
                        }}
                        className="px-3 py-1.5 bg-[#00B4D8]/20 text-[#00B4D8] hover:bg-[#00B4D8]/30 rounded-lg text-xs font-semibold"
                      >
                        İlk Organizasyon Üyesini Ekle
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {orgMembers.map(({ member, idx }) =>
                        renderMemberCard(member, idx, 'Organizasyon Ekibi', 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                      )}
                    </div>
                  )}
                </div>

                {/* 2. BÖLÜM: AKADEMİ EKİBİ YÖNETİMİ */}
                <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <GraduationCap className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Akademi Ekibi Yönetimi</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {acadMembers.length} Üye
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Ekip sayfasındaki "Akademi Ekibi" bölümünde görünen komisyon başkanları, akademisyenler ve danışmanları yönetin.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {acadMembers.length === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const defaultAcad = TEAM_MEMBERS.filter((m) =>
                              m.teamType === 'akademi' ||
                              m.category === 'komisyon_baskani' ||
                              m.category === 'akademik'
                            ).map((m) => ({ ...m, teamType: 'akademi' as const }));

                            updateCMS((prev) => ({
                              ...prev,
                              team: [...prev.team, ...defaultAcad]
                            }));
                          }}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors border border-amber-500/30"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Varsayılan Kadroyu Yükle ({TEAM_MEMBERS.filter(m => m.teamType === 'akademi' || m.category === 'komisyon_baskani' || m.category === 'akademik').length})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const newMember = {
                            id: `member-${Date.now()}`,
                            fullName: 'Yeni Akademi Ekip Üyesi',
                            role: 'Komisyon Başkanı / Akademik Danışman',
                            bio: 'Akademik danışmanlık, komisyon müzakere rehberliği ve raporlama.',
                            imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                            university: 'Selçuk Üniversitesi',
                            category: 'komisyon_baskani' as const,
                            teamType: 'akademi' as const,
                            affiliation: data.ekipPage?.defaultAffiliation || 'ÖNDER Ekibi'
                          };
                          updateCMS((prev) => ({
                            ...prev,
                            team: [...prev.team, newMember]
                          }));
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-sm shadow-amber-500/20"
                      >
                        <Plus className="w-4 h-4" /> Akademi Ekip Üyesi Ekle
                      </button>
                    </div>
                  </div>

                  {acadMembers.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-3">
                      <p className="text-slate-400 text-sm">
                        Henüz Akademi Ekibi üyesi bulunmuyor. Yeni üye ekleyebilir veya sistemdeki hazır komisyon başkanları kadrosunu tek tıkla yükleyebilirsiniz.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const defaultAcad = TEAM_MEMBERS.filter((m) =>
                              m.teamType === 'akademi' ||
                              m.category === 'komisyon_baskani' ||
                              m.category === 'akademik'
                            ).map((m) => ({ ...m, teamType: 'akademi' as const }));

                            updateCMS((prev) => ({
                              ...prev,
                              team: [...prev.team, ...defaultAcad]
                            }));
                          }}
                          className="px-3.5 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Hazır Komisyon Başkanlarını Yükle
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {acadMembers.map(({ member, idx }) =>
                        renderMemberCard(member, idx, 'Akademi Ekibi', 'bg-amber-500/20 text-amber-300 border border-amber-500/30')
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROGRAM                                                            */}
      {/* ========================================================================= */}
      {activeTab === 'program' && (
        <div className="space-y-6">
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00B4D8]" />
              3 Günlük Etkinlik Programı Akışı
            </h3>

            <div className="space-y-6">
              {data.program.map((day, dayIdx) => (
                <div key={day.dayNumber} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00B4D8]/20 text-[#00B4D8]">
                      {day.dayNumber}. GÜN ({day.date})
                    </span>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCMS((prev) => {
                          const updated = [...prev.program];
                          updated[dayIdx] = { ...updated[dayIdx], title: val };
                          return { ...prev, program: updated };
                        });
                      }}
                      className="px-3 py-1 bg-slate-950 border border-slate-800 rounded text-white font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Günün Oturumları ({day.sessions.length}):</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newSession = {
                            id: `sess-${Date.now()}`,
                            time: '14:00 - 15:30',
                            title: 'Yeni Oturum Başlığı',
                            description: 'Oturum içeriği ve müzakere başlığı.',
                            location: 'Selçuklu Kongre Merkezi',
                            type: 'session' as const
                          };
                          updateCMS((prev) => {
                            const updated = [...prev.program];
                            updated[dayIdx] = {
                              ...updated[dayIdx],
                              sessions: [...updated[dayIdx].sessions, newSession]
                            };
                            return { ...prev, program: updated };
                          });
                        }}
                        className="px-2.5 py-1 bg-[#00B4D8]/20 hover:bg-[#00B4D8]/30 text-[#00B4D8] border border-[#00B4D8]/40 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Oturum Ekle
                      </button>
                    </div>

                    {day.sessions.map((sess, sIdx) => (
                      <div key={sess.id || sIdx} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-xs items-center">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={sess.time}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCMS((prev) => {
                                const updated = [...prev.program];
                                const updatedSess = [...updated[dayIdx].sessions];
                                updatedSess[sIdx] = { ...updatedSess[sIdx], time: val };
                                updated[dayIdx] = { ...updated[dayIdx], sessions: updatedSess };
                                return { ...prev, program: updated };
                              });
                            }}
                            className="w-full p-1 bg-slate-900 border border-slate-800 rounded text-amber-400 font-mono text-[11px]"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <input
                            type="text"
                            value={sess.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCMS((prev) => {
                                const updated = [...prev.program];
                                const updatedSess = [...updated[dayIdx].sessions];
                                updatedSess[sIdx] = { ...updatedSess[sIdx], title: val };
                                updated[dayIdx] = { ...updated[dayIdx], sessions: updatedSess };
                                return { ...prev, program: updated };
                              });
                            }}
                            className="w-full p-1 bg-slate-900 border border-slate-800 rounded text-white font-bold"
                          />
                        </div>
                        <div className="md:col-span-5">
                          <input
                            type="text"
                            value={sess.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCMS((prev) => {
                                const updated = [...prev.program];
                                const updatedSess = [...updated[dayIdx].sessions];
                                updatedSess[sIdx] = { ...updatedSess[sIdx], description: val };
                                updated[dayIdx] = { ...updated[dayIdx], sessions: updatedSess };
                                return { ...prev, program: updated };
                              });
                            }}
                            className="w-full p-1 bg-slate-900 border border-slate-800 rounded text-slate-300"
                          />
                        </div>
                        <div className="md:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`"${sess.title}" oturumunu silmek istediğinize emin misiniz?`)) {
                                updateCMS((prev) => {
                                  const updated = [...prev.program];
                                  updated[dayIdx] = {
                                    ...updated[dayIdx],
                                    sessions: updated[dayIdx].sessions.filter((_, i) => i !== sIdx)
                                  };
                                  return { ...prev, program: updated };
                                });
                              }
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                            title="Oturumu Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BAŞVURU SAYFASI                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'basvuru' && (
        <div className="space-y-6">
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00B4D8]" />
              Delege Başvuru Sayfası Ayarları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rozet Metni</label>
                <input
                  type="text"
                  value={data.basvuruPage?.heroBadge || 'MECLİS DELEGE SEÇİMLERİ'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      basvuruPage: { ...prev.basvuruPage, heroBadge: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sayfa Başlığı</label>
                <input
                  type="text"
                  value={data.basvuruPage?.heroTitle || '2026 Delege Başvuru Formu'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      basvuruPage: { ...prev.basvuruPage, heroTitle: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={data.basvuruPage?.heroDesc || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      basvuruPage: { ...prev.basvuruPage, heroDesc: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kontenjan Uyarısı</label>
                <input
                  type="text"
                  value={data.basvuruPage?.quotaNotice || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      basvuruPage: { ...prev.basvuruPage, quotaNotice: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: GALERİ SAYFASI                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'galeri' && (
        <div className="space-y-6">
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#00B4D8]" />
              Galeri Sayfası Başlık ve Tanıtımı
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rozet Metni</label>
                <input
                  type="text"
                  value={data.galeriPage?.heroBadge || 'MEDYA & ETKİNLİK ALANI'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      galeriPage: { ...prev.galeriPage, heroBadge: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sayfa Başlığı</label>
                <input
                  type="text"
                  value={data.galeriPage?.heroTitle || 'Fotoğraf ve Video Galerisi'}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      galeriPage: { ...prev.galeriPage, heroTitle: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={data.galeriPage?.heroDesc || ''}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      galeriPage: { ...prev.galeriPage, heroDesc: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: İLETİŞİM                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'iletisim' && (
        <div className="space-y-6">
          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00B4D8]" />
              İletişim & Lokasyon Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kongre Merkezi Adresi</label>
                <input
                  type="text"
                  value={data.contact.address}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ÖNDER Telefon</label>
                <input
                  type="text"
                  value={data.contact.phoneTimav}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, phoneTimav: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Koordinasyon Telefon</label>
                <input
                  type="text"
                  value={data.contact.phoneCoord}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, phoneCoord: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">İletişim E-Posta</label>
                <input
                  type="text"
                  value={data.contact.email}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kayıt / Akreditasyon Saatleri</label>
                <input
                  type="text"
                  value={data.contact.hours}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, hours: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#05101F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Train className="w-5 h-5 text-[#00B4D8]" />
              Ulaşım Rehberi Açıklamaları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">YHT Ulaşımı</label>
                <textarea
                  rows={2}
                  value={data.contact.transport.yht}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        transport: { ...prev.contact.transport, yht: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Havalimanı Ulaşımı</label>
                <textarea
                  rows={2}
                  value={data.contact.transport.airport}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        transport: { ...prev.contact.transport, airport: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tramvay & Toplu Taşıma</label>
                <textarea
                  rows={2}
                  value={data.contact.transport.tram}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        transport: { ...prev.contact.transport, tram: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Özel Araç & Otopark</label>
                <textarea
                  rows={2}
                  value={data.contact.transport.car}
                  onChange={(e) =>
                    updateCMS((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        transport: { ...prev.contact.transport, car: e.target.value }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
