'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Award, 
  Layers, 
  Building2, 
  RefreshCw,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Application } from '@/lib/types';
import { getStoredApplications } from '@/lib/storage';
import { COMMISSIONS } from '@/lib/data';

interface PdfReportGeneratorProps {
  onBack?: () => void;
  initialFilters?: {
    day?: string;
    commission?: string;
    status?: 'all' | 'attended' | 'absent';
  } | null;
}

export default function PdfReportGenerator({ onBack, initialFilters }: PdfReportGeneratorProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(initialFilters?.day || 'all'); // 'all' | '23 Ekim' | '24 Ekim' | '25 Ekim'
  const [selectedCommission, setSelectedCommission] = useState<string>(initialFilters?.commission || 'all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'attended' | 'absent'>(initialFilters?.status || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Sync initial filters when received from AttendanceManager
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.day) setSelectedDay(initialFilters.day);
      if (initialFilters.commission) setSelectedCommission(initialFilters.commission);
      if (initialFilters.status) setSelectedStatus(initialFilters.status);
    }
  }, [initialFilters]);

  const loadData = () => {
    const apps = getStoredApplications();
    // Only approved delegates participate in attendance
    setApplications(apps.filter((a) => a.status === 'approved'));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('igm_auth_change', handleUpdate);
    window.addEventListener('igm_applications_updated', handleUpdate);
    return () => {
      window.removeEventListener('igm_auth_change', handleUpdate);
      window.removeEventListener('igm_applications_updated', handleUpdate);
    };
  }, []);

  // Filter logic
  const filteredDelegates = applications.filter((app) => {
    // Commission filter
    if (selectedCommission !== 'all' && app.commissionId !== selectedCommission) {
      return false;
    }

    // Day & Attendance filter
    const attendedDays = app.attendanceDays || [];
    if (selectedDay !== 'all') {
      const hasAttendedDay = attendedDays.includes(selectedDay);
      if (selectedStatus === 'attended' && !hasAttendedDay) return false;
      if (selectedStatus === 'absent' && hasAttendedDay) return false;
    } else {
      if (selectedStatus === 'attended' && attendedDays.length === 0) return false;
      if (selectedStatus === 'absent' && attendedDays.length > 0) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.fullName.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchPhone = app.phone.toLowerCase().includes(q);
      const matchSchool = (app.school || '').toLowerCase().includes(q);
      const matchQr = (app.qrCodeId || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchSchool && !matchQr) {
        return false;
      }
    }

    return true;
  });

  // Statistics calculation
  const totalDelegates = applications.length;
  const filteredCount = filteredDelegates.length;

  let attendedCount = 0;
  if (selectedDay !== 'all') {
    attendedCount = applications.filter((a) => (a.attendanceDays || []).includes(selectedDay)).length;
  } else {
    attendedCount = applications.filter((a) => (a.attendanceDays || []).length > 0).length;
  }
  const absentCount = totalDelegates - attendedCount;
  const attendanceRate = totalDelegates > 0 ? Math.round((attendedCount / totalDelegates) * 100) : 0;

  // Print / PDF Trigger Function
  const handlePrintPdf = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 250);
  };

  const currentDateFormatted = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());

  const getAttendanceLogForDay = (app: Application, day: string) => {
    if (!app.attendanceLogs) return null;
    return app.attendanceLogs.find((l) => l.day === day) || null;
  };

  return (
    <div className="space-y-6 print:space-y-0 print:block">
      {/* 1. SCREEN VIEW HEADER & CONTROLS (Hidden during print) */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                Yoklama ve Raporlama
              </span>
              <span className="text-xs text-slate-400">Resmi Katılım Belgesi & PDF</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#1E6FFB]" />
              Yoklama ve Katılım Raporu
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Filtrelenmiş delege yoklama verilerini inceleyebilir ve kurumsal PDF formatında indirebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Page Orientation Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2">Sayfa Yönü:</span>
              <button
                type="button"
                onClick={() => setPrintOrientation('landscape')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  printOrientation === 'landscape'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tüm 10 sütunun sıkışmadan ve taşmadan sığması için önerilir"
              >
                <span className="w-3.5 h-2.5 border-2 border-current rounded-xs inline-block" />
                Yatay (Önerilen)
              </button>
              <button
                type="button"
                onClick={() => setPrintOrientation('portrait')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  printOrientation === 'portrait'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2.5 h-3.5 border-2 border-current rounded-xs inline-block" />
                Dikey
              </button>
            </div>

            <button
              onClick={handlePrintPdf}
              disabled={isGenerating || filteredDelegates.length === 0}
              className="px-5 py-2.5 bg-[#1E6FFB] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF Raporu Oluştur / Yazdır
            </button>
          </div>
        </div>

        {/* Informative Tip Box */}
        <div className="flex items-center gap-2.5 text-xs text-blue-800 bg-blue-50/80 border border-blue-200/70 px-4 py-2.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Geniş Sayfa Düzeni (Yatay):</strong> Delege bilgileri, QR kod, komisyon, 3 günlük katılım ve son okutma saatlerinin <strong>sıkışmadan ve taşmadan</strong> sığması için Yatay (Landscape) düzen aktiftir. Tarayıcı yazdırma ekranında da &quot;Yatay&quot; olarak görüntülenecektir.
          </span>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-[#1E6FFB]" />
              <span>Rapor Filtreleme Seçenekleri</span>
            </div>
            <span className="text-xs text-slate-400">
              Bulunan Kayıt: <strong className="text-slate-700">{filteredDelegates.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Day Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Etkinlik Günü
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E6FFB]"
              >
                <option value="all">Tüm Günler (23 - 25 Ekim)</option>
                <option value="23 Ekim">1. Gün - 23 Ekim Cuma</option>
                <option value="24 Ekim">2. Gün - 24 Ekim Cumartesi</option>
                <option value="25 Ekim">3. Gün - 25 Ekim Pazar</option>
              </select>
            </div>

            {/* Commission Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                İhtisas Komisyonu
              </label>
              <select
                value={selectedCommission}
                onChange={(e) => setSelectedCommission(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E6FFB]"
              >
                <option value="all">Tüm Komisyonlar (8 Komisyon)</option>
                {COMMISSIONS.map((comm) => (
                  <option key={comm.id} value={comm.id}>
                    {comm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Katılım Durumu
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E6FFB]"
              >
                <option value="all">Tümü (Katılan & Katılmayan)</option>
                <option value="attended">Yalnızca Katılanlar</option>
                <option value="absent">Yalnızca Katılmayanlar</option>
              </select>
            </div>

            {/* Search Box */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Delege / Arama
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="İsim, e-posta, okul, QR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E6FFB]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Screen Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Toplam Onaylı Delege</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{totalDelegates}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Filtrelenen Delege</span>
            <span className="text-xl font-bold text-blue-600 mt-0.5 block">{filteredCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Seçili Güne Katılan</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{attendedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Genel Katılım Oranı</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900">%{attendanceRate}</span>
              <span className="text-[10px] text-slate-400">({attendedCount}/{totalDelegates})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRINT & PDF DOCUMENT TEMPLATE (VISIBLE BOTH ON SCREEN AND PRINT)         */}
      {/* ========================================================================= */}
      <div 
        ref={printAreaRef}
        id="igm-official-pdf-report"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 print:p-0 print:border-none print:shadow-none print:m-0 print:w-full print:block print:overflow-visible"
      >
        {/* PDF Header with ÖNDER & İrfan Meclisi Branding */}
        <div className="border-b-2 border-slate-800 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#0A1628] text-white flex items-center justify-center font-bold text-xl border border-slate-700 shrink-0">
                İGM
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase block">
                  ÖNDER DERNEĞİ ÖNCÜLÜĞÜNDE
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
                  İRFAN GENÇ MECLİSİ 2026
                </h1>
                <p className="text-xs text-slate-600 italic">
                  “Kökümüz İrfan, Sözümüz İstikbal” • 23-24-25 Ekim 2026 / SKM KONYA
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider mb-1">
                RESMİ YOKLAMA RAPORU
              </span>
              <p className="text-[10px] text-slate-500">Rapor Tarihi: {currentDateFormatted}</p>
              <p className="text-[10px] text-slate-400">Belge ID: IGM-REP-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          {/* Report Metadata & Filter Box */}
          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Seçili Gün</span>
              <span className="font-semibold text-slate-800">
                {selectedDay === 'all' ? 'Tüm Günler (23-25 Ekim)' : selectedDay}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Seçili Komisyon</span>
              <span className="font-semibold text-slate-800">
                {selectedCommission === 'all' 
                  ? 'Tüm Komisyonlar (8 Masa)' 
                  : COMMISSIONS.find((c) => c.id === selectedCommission)?.name || selectedCommission}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Yoklama Durumu Filtresi</span>
              <span className="font-semibold text-slate-800">
                {selectedStatus === 'all' ? 'Tümü (Katılan & Katılmayan)' : selectedStatus === 'attended' ? 'Yalnızca Katılanlar' : 'Yalnızca Gelmeyenler (Devamsız)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Toplam Katılım Oranı</span>
              <span className="font-bold text-emerald-600">
                %{attendanceRate} ({attendedCount} / {totalDelegates})
              </span>
            </div>
          </div>
        </div>

        {/* Statistical Overview Bars */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Listelenen Delege</span>
            <span className="text-lg font-bold text-slate-900">{filteredDelegates.length} Kişi</span>
          </div>
          <div className="border border-slate-200 p-3 rounded-xl bg-emerald-50/40 border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Katılım Sağlayan</span>
            <span className="text-lg font-bold text-emerald-700">{attendedCount} Delege</span>
          </div>
          <div className="border border-slate-200 p-3 rounded-xl bg-rose-50/40 border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Katılım Sağlamayan</span>
            <span className="text-lg font-bold text-rose-700">{absentCount} Delege</span>
          </div>
        </div>

      {/* Dynamic Print CSS for chosen Orientation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: ${printOrientation === 'landscape' ? 'landscape' : 'portrait'} !important;
            margin: 6mm 8mm !important;
          }
        }
      `}} />

      {/* Detailed Table */}
      <div className="overflow-x-auto print:overflow-visible print:w-full">
        <table className="w-full text-left border-collapse text-xs print:text-[9.5px]">
          <thead>
            <tr className="border-b-2 border-slate-800 bg-slate-100 text-[11px] print:text-[9.5px] font-bold text-slate-800">
              <th className="py-2.5 px-2 w-8 text-center print:py-1.5 print:px-1">No</th>
              <th className="py-2.5 px-2.5 print:py-1.5 print:px-1.5">Delege Adı Soyadı</th>
              <th className="py-2.5 px-2 text-left whitespace-nowrap print:py-1.5 print:px-1.5">QR / Delege No</th>
              <th className="py-2.5 px-2 text-left whitespace-nowrap print:py-1.5 print:px-1.5">İhtisas Komisyonu</th>
              <th className="py-2.5 px-2.5 text-left print:py-1.5 print:px-1.5">Üniversite / Şehir</th>
              <th className="py-2.5 px-2 text-center bg-blue-50/80 border-x border-slate-300 font-bold text-blue-950 whitespace-nowrap print:py-1.5 print:px-1">
                Yoklama Durumu
                <span className="block text-[9px] print:text-[8px] font-normal text-slate-500">
                  {selectedDay === 'all' ? '(Genel Katılım)' : `(${selectedDay})`}
                </span>
              </th>
              <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-16 print:py-1.5 print:px-1">23 Ekim</th>
              <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-16 print:py-1.5 print:px-1">24 Ekim</th>
              <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-16 print:py-1.5 print:px-1">25 Ekim</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap w-20 print:py-1.5 print:px-1">Son Saat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredDelegates.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                  Seçilen filtre kriterlerine uygun delege yoklama kaydı bulunamadı.
                </td>
              </tr>
            ) : (
              filteredDelegates.map((app, index) => {
                const days = app.attendanceDays || [];
                const has23 = days.includes('23 Ekim');
                const has24 = days.includes('24 Ekim');
                const has25 = days.includes('25 Ekim');

                // Yoklama Durumu Badge Hesabı
                let statusBadgeText = '';
                let statusBadgeClasses = '';

                if (selectedDay !== 'all') {
                  const isPresent = days.includes(selectedDay);
                  if (isPresent) {
                    statusBadgeText = 'KATILDI';
                    statusBadgeClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  } else {
                    statusBadgeText = 'GELMEDİ';
                    statusBadgeClasses = 'bg-rose-100 text-rose-800 border-rose-300';
                  }
                } else {
                  if (days.length === 3) {
                    statusBadgeText = 'TAM KATILDI (3/3)';
                    statusBadgeClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  } else if (days.length > 0) {
                    statusBadgeText = `KISMİ (${days.length}/3 GÜN)`;
                    statusBadgeClasses = 'bg-amber-100 text-amber-800 border-amber-300';
                  } else {
                    statusBadgeText = 'KATILMADI (0/3)';
                    statusBadgeClasses = 'bg-rose-100 text-rose-800 border-rose-300';
                  }
                }

                const lastLog = app.attendanceLogs && app.attendanceLogs.length > 0 
                  ? app.attendanceLogs[app.attendanceLogs.length - 1] 
                  : null;

                const lastTime = lastLog 
                  ? new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(lastLog.scannedAt))
                  : '-';

                return (
                  <tr 
                    key={app.id} 
                    className={`hover:bg-slate-50/80 transition-colors print:break-inside-avoid ${index % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                  >
                    <td className="py-2 px-2 text-center font-semibold text-slate-400 print:py-1.5 print:px-1">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2.5 print:py-1.5 print:px-1.5">
                      <span className="font-bold text-slate-900 block text-xs print:text-[10px] leading-tight">{app.fullName}</span>
                      <span className="text-[10px] print:text-[8px] text-slate-400 block whitespace-nowrap mt-0.5">{app.email} • {app.phone}</span>
                    </td>
                    <td className="py-2 px-2 font-mono text-[11px] print:text-[9.5px] font-semibold text-slate-700 whitespace-nowrap print:py-1.5 print:px-1.5">
                      {app.qrCodeId}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap print:py-1.5 print:px-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] print:text-[8.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {app.commissionId.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 print:py-1.5 print:px-1.5">
                      <span className="block truncate max-w-[140px] text-xs print:text-[9px] font-medium leading-tight">{app.school || '-'}</span>
                      <span className="text-[10px] print:text-[8px] text-slate-400 block">{app.city || 'Konya'}</span>
                    </td>
                    {/* YOKLAMA DURUMU VURGU SÜTUNU */}
                    <td className="py-2 px-2 text-center whitespace-nowrap bg-blue-50/30 border-x border-slate-200 print:py-1.5 print:px-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] print:text-[8.5px] font-bold border tracking-tight ${statusBadgeClasses}`}>
                        {statusBadgeText}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-center whitespace-nowrap print:py-1.5 print:px-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] print:text-[8.5px] font-bold ${
                        has23 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {has23 ? 'GELDİ' : 'YOK'}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-center whitespace-nowrap print:py-1.5 print:px-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] print:text-[8.5px] font-bold ${
                        has24 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {has24 ? 'GELDİ' : 'YOK'}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-center whitespace-nowrap print:py-1.5 print:px-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] print:text-[8.5px] font-bold ${
                        has25 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {has25 ? 'GELDİ' : 'YOK'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[10.5px] print:text-[9px] text-slate-600 whitespace-nowrap print:py-1.5 print:px-1">
                      {lastTime}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

        {/* PDF Footer & Official Signatures */}
        <div className="mt-10 pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 report-signature-block print:break-inside-avoid">
          <div>
            <p className="font-semibold text-slate-700">ÖNDER İrfan Genç Meclisi Divan Başkanlığı</p>
            <p className="text-[10px]">Bu belge dijital yoklama takip sisteminden otomatik üretilmiştir.</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700">Yoklama ve Akreditasyon Sorumlusu</p>
            <p className="text-[10px] text-slate-400 mt-4 border-t border-slate-300 pt-1 px-8 inline-block">İmza / Kaşe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
