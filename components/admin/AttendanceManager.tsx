'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Users, 
  Calendar, 
  Check, 
  X, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  FileText,
  Building2,
  Printer,
  ChevronDown,
  SwitchCamera,
  Upload,
  Zap,
  Barcode,
  Keyboard
} from 'lucide-react';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Application } from '@/lib/types';
import { 
  getStoredApplications, 
  recordAttendanceWithTimestamp, 
  toggleAttendance, 
  findApplicationByQr,
  updateApplicationStatus,
  syncApplicationsWithSupabase 
} from '@/lib/storage';
import { COMMISSIONS } from '@/lib/data';

interface ScanHistoryItem {
  id: string;
  name: string;
  commission: string;
  qrId: string;
  time: string;
  status: 'success' | 'duplicate' | 'not_found' | 'not_approved' | 'inactive';
  message: string;
}

const EVENT_DAYS = ['23 Ekim', '24 Ekim', '25 Ekim'] as const;
type EventDay = typeof EVENT_DAYS[number];

interface AttendanceManagerProps {
  onGoToReports?: (filters?: {
    day?: string;
    commission?: string;
    status?: 'all' | 'attended' | 'absent';
  }) => void;
}

export default function AttendanceManager({ onGoToReports }: AttendanceManagerProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedDay, setSelectedDay] = useState<EventDay>('23 Ekim');
  const [selectedSession, setSelectedSession] = useState<string>('Genel Oturum');
  const [viewMode, setViewMode] = useState<'qr_station' | 'manual_table'>('qr_station');

  // Sound Feedback
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Manual List Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'ATTENDED' | 'ABSENT'>('ALL');

  // Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isScanSuccessFlash, setIsScanSuccessFlash] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<{
    delegate?: Application;
    type: 'success' | 'duplicate' | 'not_found' | 'not_approved' | 'inactive';
    message: string;
    scannedCode: string;
  } | null>(null);

  // Scan History Logs
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  // Reader Type: 'qr' (Camera Scanner) or 'code' (Manual / Barcode Reader)
  const [readingMethod, setReadingMethod] = useState<'qr' | 'code'>('qr');
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  // Video & Scanner Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);
  const [videoDevices, setVideoDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const loadData = () => {
    setApplications(getStoredApplications());
    syncApplicationsWithSupabase().then((synced) => {
      if (synced) setApplications(synced);
    });
  };

  useEffect(() => {
    loadData();
    const handleAuth = () => loadData();
    window.addEventListener('igm_auth_change', handleAuth);
    window.addEventListener('igm_applications_updated', handleAuth);

    // Initialize ZXing Multi-Format Reader with QR Code and TryHarder mode
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints, 200);
    codeReaderRef.current = reader;

    // Discover video input devices (cameras)
    reader
      .getVideoInputDevices()
      .then((devices) => {
        const formatted = devices.map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Kamera ${idx + 1}`
        }));
        setVideoDevices(formatted);
        setHasMultipleCameras(formatted.length > 1);
        if (formatted.length > 0) {
          setSelectedDeviceId(formatted[0].deviceId);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('igm_auth_change', handleAuth);
      window.removeEventListener('igm_applications_updated', handleAuth);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (readingMethod === 'code') {
      setTimeout(() => {
        manualInputRef.current?.focus();
      }, 100);
    }
  }, [readingMethod]);

  // Web Audio Synthesizer Tone Feedback
  const playTone = (type: 'success' | 'duplicate' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'duplicate') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio not supported or blocked
    }
  };

  const triggerSuccessFlash = () => {
    setIsScanSuccessFlash(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(150);
      } catch {}
    }
    setTimeout(() => {
      setIsScanSuccessFlash(false);
    }, 600);
  };

  // Process a Scanned QR Code or Token
  const handleProcessCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const res = recordAttendanceWithTimestamp(cleanCode, selectedDay, selectedSession, 'Divan Admin');

    const historyItem: ScanHistoryItem = {
      id: `scan-${Date.now()}`,
      name: res.user?.fullName || 'Bilinmeyen Kullanıcı',
      commission: res.user?.commissionId ? res.user.commissionId.toUpperCase() : '-',
      qrId: res.user?.qrCodeId || cleanCode,
      time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()),
      status: res.code,
      message: res.message
    };

    setScanHistory((prev) => [historyItem, ...prev.slice(0, 19)]);

    if (res.success) {
      playTone('success');
      setLastScannedResult({
        delegate: res.user,
        type: 'success',
        message: res.message,
        scannedCode: cleanCode
      });
      loadData();
    } else if (res.code === 'duplicate') {
      playTone('duplicate');
      setLastScannedResult({
        delegate: res.user,
        type: 'duplicate',
        message: res.message,
        scannedCode: cleanCode
      });
    } else {
      playTone('error');
      setLastScannedResult({
        delegate: res.user,
        type: res.code,
        message: res.message,
        scannedCode: cleanCode
      });
    }

    setManualCodeInput('');
  };

  // Camera Scanning Logic using ZXing BrowserMultiFormatReader
  const startCamera = async (deviceIdToUse?: string) => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setCameraError('Kamera erişimi tarayıcınızda desteklenmiyor veya bağlantı güvenli (HTTPS/localhost) değil.');
      return;
    }

    const reader = codeReaderRef.current;
    if (!reader || !videoRef.current) return;

    try {
      setIsCameraActive(true);
      const targetDeviceId = deviceIdToUse || selectedDeviceId;

      const handleScanResult = (result: any, err: any) => {
        if (result) {
          const text = typeof result.getText === 'function' ? result.getText() : String(result);
          if (text) {
            const clean = text.trim();
            const now = Date.now();
            const last = lastScannedCodeRef.current;
            // Debounce: don't process same code within 2.5 seconds
            if (!last || last.code !== clean || now - last.time > 2500) {
              lastScannedCodeRef.current = { code: clean, time: now };
              triggerSuccessFlash();
              handleProcessCode(clean);
            }
          }
        }
      };

      if (targetDeviceId) {
        await reader.decodeFromVideoDevice(targetDeviceId, videoRef.current, handleScanResult);
      } else {
        await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          videoRef.current,
          handleScanResult
        );
      }
    } catch (err: any) {
      console.error('Camera scan start failed:', err);
      // Fallback with basic constraints
      try {
        if (reader && videoRef.current) {
          await reader.decodeFromConstraints({ video: true }, videoRef.current, (result) => {
            if (result) {
              const text = typeof result.getText === 'function' ? result.getText() : String(result);
              if (text) {
                const clean = text.trim();
                const now = Date.now();
                const last = lastScannedCodeRef.current;
                if (!last || last.code !== clean || now - last.time > 2500) {
                  lastScannedCodeRef.current = { code: clean, time: now };
                  triggerSuccessFlash();
                  handleProcessCode(clean);
                }
              }
            }
          });
          setIsCameraActive(true);
          return;
        }
      } catch (fallbackErr: any) {
        setIsCameraActive(false);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setCameraError('Kamera izni verilmedi. Lütfen tarayıcınızın adres çubuğundaki kilit simgesinden kamera iznini onaylayınız.');
        } else {
          setCameraError('Kamera başlatılamadı. Lütfen kamera bağlantısını kontrol ediniz veya manuel kod giriniz.');
        }
      }
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {
        // safe
      }
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];
      setSelectedDeviceId(nextDevice.deviceId);
      startCamera(nextDevice.deviceId);
    } else {
      const nextMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(nextMode);
      startCamera();
    }
  };

  // Process QR from uploaded image or screenshot with ZXing & jsQR fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFileProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      let foundCode: string | null = null;

      // 1. Try ZXing BrowserMultiFormatReader
      if (codeReaderRef.current) {
        try {
          const res = await codeReaderRef.current.decodeFromImageUrl(dataUrl);
          if (res && res.getText()) {
            foundCode = res.getText();
          }
        } catch {
          // fallback to jsQR below
        }
      }

      // 2. Fallback to jsQR with attemptBoth
      if (!foundCode) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qr = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });
            if (qr && qr.data) {
              foundCode = qr.data;
            }
          }
        } catch {
          // ignore
        }
      }

      setIsFileProcessing(false);
      if (foundCode) {
        triggerSuccessFlash();
        handleProcessCode(foundCode);
      } else {
        playTone('error');
        alert('Yüklenen görselde QR kod tespit edilemedi. Lütfen QR kodun tamamının net göründüğü bir görsel seçiniz.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Stats Calculation
  const approvedDelegates = applications.filter((a) => a.status === 'approved');
  const totalApproved = approvedDelegates.length;

  const dayStats = EVENT_DAYS.map((day) => {
    const attended = approvedDelegates.filter((a) => (a.attendanceDays || []).includes(day)).length;
    const rate = totalApproved > 0 ? Math.round((attended / totalApproved) * 100) : 0;
    return { day, attended, absent: totalApproved - attended, rate };
  });

  // Manual List Filtering
  const filteredDelegates = approvedDelegates.filter((app) => {
    if (commissionFilter !== 'ALL' && app.commissionId !== commissionFilter) return false;
    const hasAttended = (app.attendanceDays || []).includes(selectedDay);
    if (attendanceFilter === 'ATTENDED' && !hasAttended) return false;
    if (attendanceFilter === 'ABSENT' && hasAttended) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.fullName.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchQr = (app.qrCodeId || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchQr) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              Yoklama İstasyonu
            </span>
            <span className="text-xs text-slate-400">Canlı QR Okutma & Katılım Takibi</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-[#1E6FFB]" />
            QR Yoklama ve Akreditasyon
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Delege QR kodunu kamera veya barkod okuyucu ile taratın. Mükerrer yoklamalar sistem tarafından otomatik engellenir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Ses Açık' : 'Sessiz'}</span>
          </button>

          {/* Go to PDF Reports */}
          {onGoToReports && (
            <button
              onClick={() => onGoToReports({
                day: selectedDay,
                commission: commissionFilter !== 'ALL' ? commissionFilter : 'all',
                status: attendanceFilter === 'ATTENDED' ? 'attended' : attendanceFilter === 'ABSENT' ? 'absent' : 'all'
              })}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Yoklama Durumu PDF Raporu ({selectedDay})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 3-DAY SELECTION TABS WITH STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dayStats.map((stat, idx) => {
          const isSelected = selectedDay === stat.day;
          return (
            <div
              key={stat.day}
              onClick={() => setSelectedDay(stat.day)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#1E6FFB] shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-[#1E6FFB] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{stat.day}</h4>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    Aktif Gün
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mt-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Katılan</span>
                  <span className="text-lg font-bold text-emerald-600">{stat.attended}</span>
                  <span className="text-slate-400 text-[10px] ml-1">/ {totalApproved}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Katılım Oranı</span>
                  <span className="text-lg font-bold text-slate-900">%{stat.rate}</span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-[#1E6FFB] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stat.rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODE SWITCH: QR STATION vs MANUEL TABLE */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('qr_station')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'qr_station'
                ? 'bg-[#1E6FFB] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Canlı QR Tarayıcı İstasyonu
          </button>
          <button
            onClick={() => setViewMode('manual_table')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'manual_table'
                ? 'bg-[#1E6FFB] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Manuel Yoklama Listesi ({filteredDelegates.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Seçili Gün: <strong className="text-slate-800">{selectedDay}</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VIEW MODE: QR STATION (SCANNER + INSTANT RESULT + SCAN HISTORY)        */}
      {/* ========================================================================= */}
      {viewMode === 'qr_station' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top: Scanner Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. READER SELECTION TABS: QR KOD OKUYUCU vs KOD OKUYUCU */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setReadingMethod('qr')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  readingMethod === 'qr'
                    ? 'bg-[#1E6FFB] text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Kod Okuyucu (Kamera)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setReadingMethod('code');
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  readingMethod === 'code'
                    ? 'bg-[#1E6FFB] text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Barcode className="w-4 h-4" />
                <span>Kod Okuyucu (Manuel / Barkod)</span>
              </button>
            </div>

            {/* 2. MODE A: QR KOD OKUYUCU (KAMERA İLE OKUMA) */}
            {readingMethod === 'qr' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      Kamera ile Canlı QR Okuma
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Delege kartındaki QR kodu kameraya tutunuz.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Switch Front/Rear Camera if multiple cameras available */}
                    {isCameraActive && hasMultipleCameras && (
                      <button
                        onClick={switchCamera}
                        title="Kamerayı Değiştir (Ön / Arka)"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <SwitchCamera className="w-3.5 h-3.5 text-slate-600" />
                        <span className="hidden sm:inline">Kamerayı Çevir</span>
                      </button>
                    )}

                    {/* Hidden Image File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Upload QR Image / Screenshot */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isFileProcessing}
                      title="QR Kod Fotoğrafı veya Ekran Görüntüsü Yükle"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isFileProcessing ? 'Taranıyor...' : 'Görselden Oku'}</span>
                    </button>

                    {/* Camera Start / Stop Button */}
                    {isCameraActive ? (
                      <button
                        onClick={stopCamera}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                      >
                        Kamerayı Durdur
                      </button>
                    ) : (
                      <button
                        onClick={() => startCamera()}
                        className="px-4 py-2 bg-[#1E6FFB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Kamerayı Başlat</span>
                      </button>
                    )}
                  </div>
                </div>

                {cameraError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Video Scanner Canvas */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video sm:h-[340px] w-full flex items-center justify-center border border-slate-800 shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className={`w-full h-full object-cover transition-opacity duration-300 ${!isCameraActive ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'}`}
                  />

                  {!isCameraActive && (
                    <div className="text-center p-6 text-slate-400 z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 shadow-lg">
                        <QrCode className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">Kamera Şu Anda Kapalı</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">
                        Canlı QR taramak için “Kamerayı Başlat” butonuna tıklayınız veya görsel dosyasından okutunuz.
                      </p>
                      <button
                        onClick={() => startCamera()}
                        className="mt-4 px-5 py-2.5 bg-[#1E6FFB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Kamerayı Başlat</span>
                      </button>
                    </div>
                  )}

                  {/* Target overlay guide with corner brackets & animated laser line */}
                  {isCameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div
                        className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 transition-all duration-300 ${
                          isScanSuccessFlash
                            ? 'border-emerald-400 ring-8 ring-emerald-500/50 bg-emerald-500/10'
                            : 'border-blue-400/80 ring-4 ring-black/40'
                        }`}
                      >
                        {/* 4 Corner Markers */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#1E6FFB] rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#1E6FFB] rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#1E6FFB] rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#1E6FFB] rounded-br-lg" />

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#4DA3FF] to-transparent shadow-[0_0_10px_#4DA3FF] animate-scan-laser" />
                      </div>

                      <div className="mt-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-medium text-white shadow">
                        {isScanSuccessFlash ? '✅ QR Kod Okundu!' : 'QR Kodu Çerçeveye Hizalayınız'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. MODE B: KOD OKUYUCU (MANUEL & BARKOD / EL TERMİNALİ İLE OKUMA) */}
            {readingMethod === 'code' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Barcode className="w-5 h-5 text-blue-600" />
                      Delege Kodu & Barkod Okuyucu İstasyonu
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      El terminali (USB/Bluetooth barkod okuyucu), klavye veya delege kodu ile hızlı yoklama alınız.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <Keyboard className="w-3 h-3 text-blue-600" />
                    Enter ile Otomatik Kayıt
                  </span>
                </div>

                {/* Big Input Area */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProcessCode(manualCodeInput);
                  }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <Barcode className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={manualInputRef}
                      type="text"
                      placeholder="Delege Kodu (Örn: IGM26-ADA-5296) veya T.C. No / E-Posta..."
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#1E6FFB] rounded-2xl text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none transition-all shadow-inner"
                    />
                    {manualCodeInput && (
                      <button
                        type="button"
                        onClick={() => setManualCodeInput('')}
                        className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#1E6FFB] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                    >
                      Yoklama Al
                    </button>
                  </div>

                  {/* Quick helper chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold text-slate-400">Hızlı Kod Ekle:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setManualCodeInput('IGM26-');
                        manualInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold transition-colors cursor-pointer border border-slate-200"
                    >
                      + IGM26-
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualCodeInput('IGM26-SEC-');
                        manualInputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold transition-colors cursor-pointer border border-slate-200"
                    >
                      + IGM26-SEC-
                    </button>
                  </div>
                </form>

                {/* Live Matching Delegates while typing */}
                {manualCodeInput.trim().length >= 2 && (
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-2 animate-in fade-in duration-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Eşleşen Delege Adayları ({
                        applications.filter((a) => {
                          const q = manualCodeInput.trim().toLowerCase();
                          return (
                            (a.qrCodeId && a.qrCodeId.toLowerCase().includes(q)) ||
                            (a.secureQrToken && a.secureQrToken.toLowerCase().includes(q)) ||
                            (a.fullName && a.fullName.toLowerCase().includes(q)) ||
                            (a.identityNo && a.identityNo.includes(q)) ||
                            (a.email && a.email.toLowerCase().includes(q))
                          );
                        }).length
                      })
                    </div>
                    <div className="space-y-1.5">
                      {applications
                        .filter((a) => {
                          const q = manualCodeInput.trim().toLowerCase();
                          return (
                            (a.qrCodeId && a.qrCodeId.toLowerCase().includes(q)) ||
                            (a.secureQrToken && a.secureQrToken.toLowerCase().includes(q)) ||
                            (a.fullName && a.fullName.toLowerCase().includes(q)) ||
                            (a.identityNo && a.identityNo.includes(q)) ||
                            (a.email && a.email.toLowerCase().includes(q))
                          );
                        })
                        .slice(0, 3)
                        .map((match) => (
                          <div
                            key={match.id}
                            className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-blue-300 transition-all"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{match.fullName}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-blue-600">{match.commissionId.toUpperCase()}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-600">{match.qrCodeId}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleProcessCode(match.qrCodeId)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              Yoklama Al
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instant Result Box */}
            {lastScannedResult && (
              <div className={`p-5 rounded-2xl border text-xs transition-all ${
                lastScannedResult.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : lastScannedResult.type === 'duplicate'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    lastScannedResult.type === 'success'
                      ? 'bg-emerald-200 text-emerald-800'
                      : lastScannedResult.type === 'duplicate'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-rose-200 text-rose-800'
                  }`}>
                    {lastScannedResult.type === 'success' && <Check className="w-5 h-5" />}
                    {lastScannedResult.type === 'duplicate' && <Clock className="w-5 h-5" />}
                    {(lastScannedResult.type === 'not_found' || lastScannedResult.type === 'not_approved' || lastScannedResult.type === 'inactive') && (
                      <X className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">
                      {lastScannedResult.type === 'success'
                        ? 'Yoklama Başarıyla Alındı!'
                        : lastScannedResult.type === 'duplicate'
                        ? 'Mükerrer Yoklama Bildirimi'
                        : 'Yoklama Kaydedilemedi'}
                    </h4>
                    <p className="mt-1 font-medium">{lastScannedResult.message}</p>
                    {lastScannedResult.delegate && (
                      <div className="mt-2 pt-2 border-t border-black/10 flex flex-wrap gap-4 text-[11px]">
                        <span><strong>Delege:</strong> {lastScannedResult.delegate.fullName}</span>
                        <span><strong>Komisyon:</strong> {lastScannedResult.delegate.commissionId.toUpperCase()}</span>
                        <span><strong>Okul:</strong> {lastScannedResult.delegate.school}</span>
                      </div>
                    )}

                    {/* Quick Approve Action if delegate status is pending */}
                    {lastScannedResult.type === 'not_approved' && lastScannedResult.delegate && (
                      <div className="mt-3 pt-3 border-t border-rose-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-[11px] text-rose-700">
                          Delege şu anda salonda mı? Kaydını doğrudan onaylayıp yoklamasını kaydedebilirsiniz:
                        </span>
                        <button
                          onClick={() => {
                            if (lastScannedResult.delegate) {
                              const updated = updateApplicationStatus(lastScannedResult.delegate.id, 'approved', 'Yoklama Masası');
                              setApplications(updated);
                              handleProcessCode(lastScannedResult.scannedCode);
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Hızlı Onayla ve Yoklama Al</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Scan Feed Log (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Anlık Okutma Akışı ({scanHistory.length})
              </h3>
              <button
                onClick={() => setScanHistory([])}
                className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Akışı Temizle
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
              {scanHistory.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs italic">
                  Henüz QR okutma yapılmadı.
                </div>
              ) : (
                scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      item.status === 'success'
                        ? 'bg-emerald-50/50 border-emerald-100'
                        : item.status === 'duplicate'
                        ? 'bg-amber-50/50 border-amber-100'
                        : 'bg-rose-50/50 border-rose-100'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">{item.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-blue-600">{item.commission}</span>
                        <span>•</span>
                        <span className="font-mono">{item.qrId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'duplicate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status === 'success' ? 'Katıldı' : item.status === 'duplicate' ? 'Mükerrer' : 'Hata'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">{item.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW MODE: MANUAL ATTENDANCE TABLE                                     */}
      {/* ========================================================================= */}
      {viewMode === 'manual_table' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
              <input
                type="text"
                placeholder="İsim, e-posta veya QR ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
              />

              <select
                value={commissionFilter}
                onChange={(e) => setCommissionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
              >
                <option value="ALL">Tüm Komisyonlar</option>
                {COMMISSIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E6FFB] text-slate-800"
              >
                <option value="ALL">Tümü (Katılan & Gelmeyen)</option>
                <option value="ATTENDED">Yalnızca Katılanlar</option>
                <option value="ABSENT">Yalnızca Gelmeyenler</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {onGoToReports && (
                <button
                  onClick={() => onGoToReports({
                    day: selectedDay,
                    commission: commissionFilter !== 'ALL' ? commissionFilter : 'all',
                    status: attendanceFilter === 'ATTENDED' ? 'attended' : attendanceFilter === 'ABSENT' ? 'absent' : 'all'
                  })}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  title="Filtrelenmiş Yoklama Durumu Listesini PDF Olarak Oluştur"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Yoklama Durumunu PDF Yap</span>
                </button>
              )}
              <div className="text-right text-slate-500 whitespace-nowrap">
                Bulunan: <strong className="text-slate-800">{filteredDelegates.length}</strong> Delege
              </div>
            </div>
          </div>

          {/* Manual Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                    <th className="py-3 px-4">Delege Adı Soyadı</th>
                    <th className="py-3 px-4">QR Kod ID</th>
                    <th className="py-3 px-4">Komisyon</th>
                    <th className="py-3 px-4">Üniversite</th>
                    <th className="py-3 px-4 text-center">Yoklama Durumu ({selectedDay})</th>
                    <th className="py-3 px-4 text-right">Manuel İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDelegates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        Kriterlere uygun onaylı delege bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredDelegates.map((app) => {
                      const hasAttended = (app.attendanceDays || []).includes(selectedDay);
                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{app.fullName}</span>
                            <span className="text-[10px] text-slate-400">{app.email}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {app.qrCodeId}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-blue-600">{app.commissionId.toUpperCase()}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate">
                            {app.school}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              hasAttended
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {hasAttended ? '✓ Katıldı' : '✗ Gelmedi'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                toggleAttendance(app.id, selectedDay);
                                loadData();
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                                hasAttended
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {hasAttended ? 'Katılımı İptal Et' : 'Katıldı Olarak İşaretle'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
