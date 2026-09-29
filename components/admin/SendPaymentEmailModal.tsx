'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Check, 
  Clock, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Building2, 
  CreditCard, 
  Sparkles,
  User,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { Application, PaymentEmailSettings } from '@/lib/types';
import { 
  getStoredPaymentEmailSettings, 
  fetchServerPaymentEmailSettings, 
  renderTemplateString 
} from '@/lib/paymentEmail';
import { updateApplicationPaymentEmailStatus } from '@/lib/storage';

interface SendPaymentEmailModalProps {
  isOpen: boolean;
  applicant: Application | null;
  onClose: () => void;
  onEmailSent?: (updatedApplicant: Application) => void;
  onOpenSettings?: () => void;
}

export default function SendPaymentEmailModal({
  isOpen,
  applicant,
  onClose,
  onEmailSent,
  onOpenSettings
}: SendPaymentEmailModalProps) {
  const [settings, setSettings] = useState<PaymentEmailSettings>(getStoredPaymentEmailSettings());
  const [customNote, setCustomNote] = useState('');
  const [sending, setSending] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [mailtoUrl, setMailtoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && applicant) {
      setResultMsg(null);
      setCustomNote('');
      setMailtoUrl(null);
      fetchServerPaymentEmailSettings().then((s) => setSettings(s));
    }
  }, [isOpen, applicant]);

  if (!isOpen || !applicant) return null;

  const subject = renderTemplateString(settings.emailSubject, applicant, settings);
  const mainMessage = renderTemplateString(settings.emailMessage, applicant, settings);
  const paymentDesc = renderTemplateString(settings.paymentDescription, applicant, settings);
  const extraNotes = customNote ? `${settings.additionalNotes}\n* ÖZEL NOT: ${customNote}` : settings.additionalNotes;

  const plainTextFull = `
Sayın ${applicant.fullName},

${mainMessage}

BANKA VE KATILIM PAYI BİLGİLERİ:
Banka: ${settings.bankName}
Hesap Sahibi: ${settings.accountHolder}
IBAN: ${settings.iban}
Katılım Payı: ${settings.feeAmount}
Havale Açıklaması: ${paymentDesc}

${extraNotes ? `ÖNEMLİ BİLGİLER:\n${extraNotes}\n` : ''}

TİMAV İrfan Genç Meclis Koordinatörlüğü
  `.trim();

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainTextFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    setSending(true);
    setResultMsg(null);

    try {
      const res = await fetch('/api/send-application-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant,
          customSubject: subject,
          customMessage: mainMessage,
          customNote: extraNotes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'E-posta gönderilemedi.');
      }

      // Update storage status
      const updatedList = updateApplicationPaymentEmailStatus(applicant.id, customNote || undefined);
      const updatedApp = updatedList.find((a) => a.id === applicant.id) || {
        ...applicant,
        paymentEmailSent: true,
        paymentEmailSentAt: new Date().toISOString()
      };

      if (onEmailSent) {
        onEmailSent(updatedApp);
      }

      if (data.sentDirectly) {
        setResultMsg({
          type: 'success',
          text: `E-posta ${applicant.email} adresine doğrudan başarıyla ulaştırıldı!`
        });
      } else {
        // SMTP not configured, prepared mailto
        setMailtoUrl(data.mailtoUrl);
        setResultMsg({
          type: 'warning',
          text: 'SMTP sunucusu henüz ayarlanmadığı için e-posta hazırlandı. Aşağıdaki "Mail İstemcisiyle Aç" butonuna basarak doğrudan gönderebilir veya üstteki çarktan SMTP sunucunuzu kaydedebilirsiniz.'
        });
      }
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: err?.message || 'E-posta gönderimi esnasında bir hata oluştu.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-2xl w-full max-h-[92vh] flex flex-col rounded-3xl bg-[#092746] border border-[#4DA3FF]/40 shadow-2xl text-white overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#061A33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Bilgilendirme ve IBAN Postası Gönder
                </h2>
                {applicant.paymentEmailSent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Daha Önce İletildi</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Alıcı: <span className="font-semibold text-white">{applicant.fullName}</span> ({applicant.email})
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

        {/* FEEDBACK BANNERS */}
        {resultMsg && (
          <div className={`mx-6 mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            resultMsg.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : resultMsg.type === 'warning'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
              : 'bg-red-500/20 border-red-500/40 text-red-200'
          }`}>
            {resultMsg.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            )}
            <div className="flex-1">
              <span>{resultMsg.text}</span>
              {mailtoUrl && (
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href={mailtoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mail İstemcisinde Aç ve Gönder</span>
                  </a>
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>SMTP Ayarlarını Yap</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BODY (LIVE PREVIEW) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* APPLICANT QUICK INFO BAR */}
          <div className="p-3 rounded-xl bg-[#061A33] border border-[#4DA3FF]/20 flex flex-wrap items-center justify-between text-xs gap-2">
            <div>
              <span className="text-slate-400">Komisyon: </span>
              <span className="font-semibold text-[#4DA3FF] uppercase">{applicant.commissionId}</span>
            </div>
            <div>
              <span className="text-slate-400">Delege Kodu: </span>
              <span className="font-mono font-bold text-white">{applicant.qrCodeId}</span>
            </div>
            <div>
              <span className="text-slate-400">Durum: </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                applicant.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {applicant.status === 'approved' ? 'Onaylandı' : 'Beklemede (Ödeme Bekleniyor)'}
              </span>
            </div>
          </div>

          {/* EMAIL PREVIEW CARD */}
          <div className="bg-[#061527] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
            <div className="border-b border-white/10 pb-2.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">E-Posta Konusu:</span>
              <span className="font-semibold text-white text-sm">{subject}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">E-Posta Metni (Önizleme):</span>
              <div className="p-3.5 rounded-xl bg-[#061A33] text-slate-200 whitespace-pre-line leading-relaxed border border-white/5 font-sans">
                {mainMessage}
              </div>
            </div>

            {/* IBAN DISPLAY CARD */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0a2f58] to-[#061A33] border border-[#4DA3FF]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#DFB052] uppercase tracking-wider">
                  Ödeme ve Banka Bilgileri
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                  {settings.feeAmount}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Banka:</span>
                  <span className="font-semibold text-white">{settings.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Alıcı Adı:</span>
                  <span className="font-semibold text-white">{settings.accountHolder}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">IBAN Numarası:</span>
                <span className="block mt-0.5 p-2 rounded-lg bg-[#061527] font-mono text-sm text-[#4DA3FF] font-bold tracking-wide break-all border border-[#4DA3FF]/30">
                  {settings.iban}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Havale / EFT Açıklaması:</span>
                <span className="font-semibold text-emerald-300">{paymentDesc}</span>
              </div>
            </div>

            {/* OPTIONAL CUSTOM NOTE INPUT */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Bu Adaya Özel İlave Not Eklemek İster misiniz? (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Örn: 24 saat içinde dekontunuzu bekliyoruz veya özel ulaşım notu..."
                className="w-full px-3 py-2 rounded-xl bg-[#061A33] border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#4DA3FF]"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#061A33]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
            </button>

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Genel IBAN ve E-Posta Şablonunu Düzenle"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Şablonu Düzenle</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="button"
              disabled={sending}
              onClick={handleSendEmail}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Bilgilendirme Postasını Gönder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
