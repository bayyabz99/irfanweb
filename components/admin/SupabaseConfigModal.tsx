'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  X, 
  Save, 
  RefreshCw, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Server,
  KeyRound,
  Info
} from 'lucide-react';
import { 
  getActiveSupabaseConfig, 
  saveSupabaseConfig, 
  checkSupabaseConnection, 
  refreshSupabaseClient 
} from '@/lib/supabase';
import { syncApplicationsWithSupabase } from '@/lib/storage';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export default function SupabaseConfigModal({ isOpen, onClose, onConfigUpdated }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<{
    configured: boolean;
    url: string;
    source: string;
    isProduction: boolean;
    hasServiceRoleKey: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getActiveSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult(null);
      setSyncResult(null);

      // Sunucu durumunu oku
      fetch('/api/supabase-config')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === 'object') {
            setServerInfo(data);
            if (data.url && !config.url) {
              setUrl(data.url);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Diske yazmadan, doğrudan verilen URL ve Key ile bellekte test eder
      const res = await checkSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ connected: false, message: err?.message || 'Bağlantı testi başarısız' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      alert('Lütfen hem Supabase Project URL hem de Anon Key değerlerini giriniz.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveSupabaseConfig(url, anonKey);
      if (res.success) {
        // Canlı bağlantıyı test et
        const testRes = await checkSupabaseConnection(url.trim(), anonKey.trim());
        setTestResult(testRes);
        if (onConfigUpdated) onConfigUpdated();
        if (res.message) {
          setSyncResult(res.message);
        }

        if (testRes.connected && !res.isProduction) {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        alert('Doğrulama hatası: ' + (res.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      alert('Hata: ' + (err?.message || 'Kaydedilemedi'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const apps = await syncApplicationsWithSupabase();
      setSyncResult(`${apps.length} başvuru bulut veritabanıyla başarıyla eşitlendi.`);
    } catch (err: any) {
      setSyncResult('Senkronizasyon hatası: ' + err?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySchemaSql = () => {
    fetch('/supabase/schema.sql')
      .then((res) => res.text())
      .then((sql) => {
        navigator.clipboard.writeText(sql);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(label);
    setTimeout(() => setCopiedVar(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#091D34] border border-[#00B4D8]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#061527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00B4D8]/10 border border-[#00B4D8]/30 flex items-center justify-center text-[#00B4D8]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Supabase Bulut Veritabanı Yapılandırması
              </h3>
              <p className="text-xs text-slate-400">
                Tüm başvuruların, görsellerin ve ayarların Vercel ve Supabase bulutuna kaydedilmesini sağlayın
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            testResult?.connected
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : testResult && !testResult.connected
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : serverInfo?.configured
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}>
            {testResult?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : testResult && !testResult.connected ? (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : serverInfo?.configured ? (
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm">
                {testResult?.connected
                  ? 'Supabase Bulut Bağlantısı Canlı ve Aktif'
                  : testResult && !testResult.connected
                  ? 'Bağlantı Kurulamadı'
                  : serverInfo?.configured
                  ? 'Ortam Değişkenleri ile Yapılandırıldı (Aktif)'
                  : 'Bulut Bağlantısı Bekleniyor (Yerel Mod Aktif)'}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {testResult?.message || 
                  (serverInfo?.configured
                    ? 'Uygulama ortam değişkenleri üzerinden Supabase bulut sunucusuna bağlı çalışıyor.'
                    : 'Supabase projenizin URL ve Anon Key bilgilerini girerek veritabanınızı canlıya bağlayabilirsiniz.')}
              </p>
            </div>
          </div>

          {/* Vercel Environment Variables Information Box */}
          <div className="p-4 rounded-2xl bg-[#061527] border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Server className="w-4 h-4 text-[#00B4D8]" />
                <span>Vercel Production Ortam Değişkenleri Rehberi</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                serverInfo?.source === 'environment' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {serverInfo?.source === 'environment' ? 'Vercel Env: Aktif' : 'Vercel Env: Bekleniyor'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vercel Serverless ortamında kalıcı bağlantı için aşağıdaki iki değişkeni 
              <strong className="text-white"> Vercel Dashboard → Project Settings → Environment Variables</strong> bölümüne ekleyiniz:
            </p>

            <div className="space-y-2 pt-1 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#030B14] border border-slate-800">
                <span className="text-cyan-300 font-bold select-all">NEXT_PUBLIC_SUPABASE_URL</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_URL', 'url_var')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3 text-[#00B4D8]" />
                  <span>{copiedVar === 'url_var' ? 'Kopyalandı' : 'Değişken Adını Kopyala'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#030B14] border border-slate-800">
                <span className="text-cyan-300 font-bold select-all">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'key_var')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3 text-[#00B4D8]" />
                  <span>{copiedVar === 'key_var' ? 'Kopyalandı' : 'Değişken Adını Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Supabase Project URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxxxxxx.supabase.co"
                required
                className="w-full bg-[#05111F] border border-slate-700/80 rounded-xl px-4 py-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00B4D8] transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Supabase Panelinizde: Project Settings → API → Project URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Supabase Anon / Public Key *
              </label>
              <textarea
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                required
                rows={3}
                className="w-full bg-[#05111F] border border-slate-700/80 rounded-xl p-4 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#00B4D8] transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Supabase Panelinizde: Project Settings → API → Project API Keys → anon / public
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Bağlantı Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-[#05101F] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#00B4D8]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Doğrulanıyor...' : 'Doğrula ve Bağlan'}</span>
              </button>
            </div>
          </form>

          {syncResult && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncResult}</span>
            </div>
          )}

          {/* Useful Extras: Sync & Schema */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <h4 className="font-semibold text-white text-xs flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Yardımcı Araçlar & Senkronizasyon
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#061527] border border-slate-800 flex flex-col justify-between space-y-2">
                <div>
                  <div className="font-semibold text-white text-xs">Verileri Buluta Aktar</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Mevcut tarayıcıdaki tüm başvuruları ve kayıtları Supabase bulutuna yükler.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBulkSync}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-all w-fit cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? 'Aktarılıyor...' : 'Buluta Senkronize Et'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#061527] border border-slate-800 flex flex-col justify-between space-y-2">
                <div>
                  <div className="font-semibold text-white text-xs">Veritabanı SQL Tabloları</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Supabase SQL Editor'de çalıştırmak üzere tablo şemasını (app_settings dahil) kopyalayın.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchemaSql}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-all w-fit flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-[#00B4D8]" />
                  <span>{copySuccess ? 'SQL Kopyalandı!' : 'SQL Kodunu Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
