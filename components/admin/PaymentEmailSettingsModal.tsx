'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Mail, 
  CreditCard, 
  Building2, 
  User, 
  Sparkles, 
  Server, 
  Check, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Copy
} from 'lucide-react';
import { PaymentEmailSettings } from '@/lib/types';
import { 
  getStoredPaymentEmailSettings, 
  fetchServerPaymentEmailSettings, 
  savePaymentEmailSettings, 
  DEFAULT_PAYMENT_EMAIL_SETTINGS 
} from '@/lib/paymentEmail';

interface PaymentEmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: PaymentEmailSettings) => void;
}

export default function PaymentEmailSettingsModal({
  isOpen,
  onClose,
  onSaved
}: PaymentEmailSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'smtp'>('template');
  const [settings, setSettings] = useState<PaymentEmailSettings>(DEFAULT_PAYMENT_EMAIL_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg(null);
      setErrorMsg(null);
      setLoading(true);
      fetchServerPaymentEmailSettings()
        .then((data) => setSettings(data))
        .catch(() => setSettings(getStoredPaymentEmailSettings()))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof PaymentEmailSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleInsertTag = (tag: string, targetField: 'emailMessage' | 'paymentDescription' | 'emailSubject') => {
    const current = settings[targetField] || '';
    handleChange(targetField, current + tag);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const ok = await savePaymentEmailSettings(settings);
      if (ok) {
        setSuccessMsg('IBAN ve E-Posta Şablon Ayarları kalıcı olarak kaydedildi.');
        if (onSaved) onSaved(settings);
        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      } else {
        setErrorMsg('Ayarlar kaydedilirken bir sorun oluştu.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Tüm metin ve IBAN ayarlarını varsayılan şablona döndürmek istiyor musunuz?')) {
      setSettings(DEFAULT_PAYMENT_EMAIL_SETTINGS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-3xl w-full max-h-[92vh] flex flex-col rounded-3xl bg-[#092746] border border-[#4DA3FF]/40 shadow-2xl text-white overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#061A33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#4DA3FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>IBAN & E-Posta Bilgilendirme Şablonu</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DFB052]/20 text-[#DFB052] border border-[#DFB052]/30">
                  Otomatik İletim
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Adaylara tek tıkla gönderilecek IBAN, katılım tutarı ve bilgilendirme metnini buradan belirleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS HEADER */}
        <div className="px-6 pt-3 border-b border-white/10 flex items-center gap-3 bg-[#061527]">
          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'template'
                ? 'border-[#4DA3FF] text-[#4DA3FF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>IBAN & Metin Şablonu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('smtp')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'smtp'
                ? 'border-[#4DA3FF] text-[#4DA3FF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>E-Posta Sunucusu (SMTP / Gmail)</span>
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-[#4DA3FF]" />
              <span className="text-xs">Ayarlar yükleniyor...</span>
            </div>
          ) : activeTab === 'template' ? (
            <>
              {/* SECTION 1: BANKA VE IBAN BİLGİLERİ */}
              <div className="bg-[#061A33] border border-[#4DA3FF]/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-[#4DA3FF] flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Banka & Ödeme Bilgileri</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">E-postadaki IBAN kutusunda görünür</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Banka Adı
                    </label>
                    <input
                      type="text"
                      value={settings.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                      placeholder="Örn: Kuveyt Türk Katılım Bankası"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Hesap Sahibi (Alıcı Adı)
                    </label>
                    <input
                      type="text"
                      value={settings.accountHolder}
                      onChange={(e) => handleChange('accountHolder', e.target.value)}
                      placeholder="Örn: TİMAV Vakfı - İrfan Meclisi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      IBAN Numarası
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={settings.iban}
                        onChange={(e) => handleChange('iban', e.target.value)}
                        placeholder="TR..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-[#4DA3FF]/40 text-[#4DA3FF] font-mono font-bold text-sm tracking-wide focus:outline-none focus:border-[#4DA3FF]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Katılım Payı Tutarı
                    </label>
                    <input
                      type="text"
                      value={settings.feeAmount}
                      onChange={(e) => handleChange('feeAmount', e.target.value)}
                      placeholder="Örn: 350 TL"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Havale Açıklaması Şablonu
                    </label>
                    <input
                      type="text"
                      value={settings.paymentDescription}
                      onChange={(e) => handleChange('paymentDescription', e.target.value)}
                      placeholder="{fullName} - {qrCodeId} - İGM Katılım Payı"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: E-POSTA ŞABLON METNİ */}
              <div className="bg-[#061A33] border border-[#4DA3FF]/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-[#4DA3FF] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>E-Posta Başlığı ve Mesaj Metni</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Her delegeye özel kişiselleşir</span>
                </div>

                {/* DYNAMIC VARIABLES QUICK BAR */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#DFB052]" />
                      <span>Hızlı Değişken Ekle (Tıkla ekle):</span>
                    </span>
                    {copiedVar && (
                      <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                        {copiedVar} eklendi!
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { code: '{fullName}', desc: 'Ad Soyad' },
                      { code: '{qrCodeId}', desc: 'Delege Kodu' },
                      { code: '{commissionId}', desc: 'Komisyon' },
                      { code: '{feeAmount}', desc: 'Tutar' },
                      { code: '{iban}', desc: 'IBAN' },
                      { code: '{bankName}', desc: 'Banka' },
                      { code: '{school}', desc: 'Okul' }
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleInsertTag(item.code, 'emailMessage')}
                        className="px-2.5 py-1 rounded-lg bg-[#092746] hover:bg-[#103b6d] border border-[#4DA3FF]/30 text-[#4DA3FF] text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                        title={item.desc}
                      >
                        <span>{item.code}</span>
                        <span className="text-slate-400 text-[9px]">({item.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-Posta Konu Başlığı
                  </label>
                  <input
                    type="text"
                    value={settings.emailSubject}
                    onChange={(e) => handleChange('emailSubject', e.target.value)}
                    placeholder="İrfan Genç Meclis 2026 - Başvurunuz & Katılım Payı Bilgilendirmesi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Açıklama ve Bilgilendirme Metni
                  </label>
                  <textarea
                    rows={6}
                    value={settings.emailMessage}
                    onChange={(e) => handleChange('emailMessage', e.target.value)}
                    placeholder="Adaya gidecek ana açıklama metni..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF] leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Önemli Notlar / Hatırlatmalar (Kutu İçinde Gösterilir)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.additionalNotes}
                    onChange={(e) => handleChange('additionalNotes', e.target.value)}
                    placeholder="Dekont saklama, iletişim kanalı veya son ödeme tarihi notu..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                  />
                </div>
              </div>
            </>
          ) : (
            /* SECTION: SMTP AYARLARI */
            <div className="bg-[#061A33] border border-[#4DA3FF]/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#4DA3FF] flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    <span>Gerçek E-Posta Gönderimi (SMTP Yapılandırması)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    E-postaların adayın gelen kutusuna doğrudan teslim edilmesi için Gmail veya kurumsal posta sunucusu bilgilerini girebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-400/30 text-xs text-blue-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-[#DFB052]">
                  <HelpCircle className="w-4 h-4" />
                  <span>Gmail ile Gönderim İpucu:</span>
                </div>
                <p>
                  Gmail kullanıyorsanız Google Hesap Ayarları &gt; Güvenlik &gt; 2 Adımlı Doğrulama &gt; <strong>Uygulama Şifreleri (App Passwords)</strong> kısmından 16 haneli bir şifre oluşturup buradaki şifre alanına yapıştırınız.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gönderici İsmi
                  </label>
                  <input
                    type="text"
                    value={settings.senderName || ''}
                    onChange={(e) => handleChange('senderName', e.target.value)}
                    placeholder="İrfan Genç Meclisi Koordinatörlüğü"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SMTP Host Sunucu
                  </label>
                  <input
                    type="text"
                    value={settings.smtpHost || ''}
                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com veya mail.kurum.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={settings.smtpPort || 587}
                    onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                    placeholder="587 veya 465"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SSL/TLS Güvenli Bağlantı
                  </label>
                  <select
                    value={settings.smtpSecure ? 'true' : 'false'}
                    onChange={(e) => handleChange('smtpSecure', e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white text-xs focus:outline-none focus:border-[#4DA3FF]"
                  >
                    <option value="false">STARTTLS (Port 587 - Önerilen)</option>
                    <option value="true">SSL/TLS (Port 465)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SMTP Kullanıcı / E-Posta
                  </label>
                  <input
                    type="email"
                    value={settings.smtpUser || ''}
                    onChange={(e) => handleChange('smtpUser', e.target.value)}
                    placeholder="info@irfangenc.org veya adiniz@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SMTP Şifre / Uygulama Şifresi
                  </label>
                  <input
                    type="password"
                    value={settings.smtpPass || ''}
                    onChange={(e) => handleChange('smtpPass', e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#092746] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={resetToDefault}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              Varsayılanlara Sıfırla
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Kapat
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Şablonu & IBAN'ı Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
