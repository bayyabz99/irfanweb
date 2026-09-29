import { Application, ApplicationStatus, GalleryItem, GalleryItemStatus, Announcement, AttendanceRecord } from './types';
import { MOCK_APPLICATIONS, GALLERY_ITEMS, MOCK_ANNOUNCEMENTS } from './data';
import { supabase, refreshSupabaseClient } from './supabase';
import * as XLSX from 'xlsx';

function getSupabaseClient() {
  return supabase || refreshSupabaseClient();
}

const APPLICATIONS_KEY = 'igm_applications_v2';
const GALLERY_KEY = 'igm_gallery_v2';
const ANNOUNCEMENTS_KEY = 'igm_announcements_v2';
const USER_SESSION_KEY = 'igm_participant_session_v1';

// Helper: Generate Secure Cryptographic QR Token
export function generateSecureQrToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3 || i === 7) token += '-';
  }
  return `IGM26-SEC-${token}`;
}

/**
 * Tarayıcı tarafında görsel sıkıştırma / boyutlandırma yardımcısı
 */
export async function compressImageFile(
  file: File, 
  maxDimension: number = 800, 
  quality: number = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context oluşturulamadı'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            reject(new Error('Görsel sıkıştırma başarısız oldu.'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Görsel dosyası açılamadı.'));
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// Supabase Data Mappers (snake_case <-> camelCase)
// -------------------------------------------------------------
export function mapRowToApplication(row: any): Application {
  return {
    id: String(row.id),
    createdAt: row.created_at || new Date().toISOString(),
    fullName: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    identityNo: row.identity_no || '',
    school: row.school || '',
    department: row.department || '',
    commissionId: row.commission_id || 'adalet',
    secondChoiceId: row.second_choice_id || undefined,
    motivation: row.motivation || '',
    status: (row.status as ApplicationStatus) || 'pending',
    qrCodeId: row.qr_code_id || `IGM26-${String(row.id).slice(0, 6)}`,
    secureQrToken: row.secure_qr_token || undefined,
    attendanceDays: Array.isArray(row.attendance_days) ? row.attendance_days : [],
    attendanceLogs: Array.isArray(row.attendance_logs) ? row.attendance_logs : [],
    city: row.city || 'Konya',
    password: row.password || '',
    avatarUrl: row.avatar_url || '',
    isActive: row.is_active !== false,
    isBlocked: Boolean(row.is_blocked),
    lastLoginAt: row.last_login_at || undefined,
    approvedAt: row.approved_at || undefined,
    approvedBy: row.approved_by || undefined,
    updatedAt: row.updated_at || undefined,
    paymentEmailSent: Boolean(row.payment_email_sent),
    paymentEmailSentAt: row.payment_email_sent_at || undefined,
    paymentEmailNotes: row.payment_email_notes || undefined
  };
}

export function mapApplicationToRow(app: Application): Record<string, any> {
  const row: Record<string, any> = {
    id: app.id,
    created_at: app.createdAt,
    full_name: app.fullName,
    email: app.email,
    phone: app.phone,
    identity_no: app.identityNo,
    school: app.school,
    department: app.department,
    commission_id: app.commissionId,
    second_choice_id: app.secondChoiceId || null,
    motivation: app.motivation,
    status: app.status,
    qr_code_id: app.qrCodeId,
    secure_qr_token: app.secureQrToken || null,
    attendance_days: app.attendanceDays || [],
    attendance_logs: app.attendanceLogs || [],
    city: app.city || 'Konya',
    password: app.password || null,
    avatar_url: app.avatarUrl || null,
    is_active: app.isActive !== false,
    is_blocked: Boolean(app.isBlocked),
    last_login_at: app.lastLoginAt || null,
    approved_at: app.approvedAt || null,
    approved_by: app.approvedBy || null,
    updated_at: app.updatedAt || new Date().toISOString()
  };

  // Yalnızca tanımlı ise ekle, veritabanı şemasında kolon yoksa hata vermesini engelle
  if (app.paymentEmailSent !== undefined) {
    row.payment_email_sent = Boolean(app.paymentEmailSent);
  }
  if (app.paymentEmailSentAt) {
    row.payment_email_sent_at = app.paymentEmailSentAt;
  }
  if (app.paymentEmailNotes) {
    row.payment_email_notes = app.paymentEmailNotes;
  }

  return row;
}

// -------------------------------------------------------------
// 1. APPLICATIONS & USER MANAGEMENT
// -------------------------------------------------------------

export function getStoredApplications(): Application[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) {
      // Seed with initial mock applications
      const seeded = (MOCK_APPLICATIONS || []).map((app) => ({
        ...app,
        isActive: app.isActive ?? true,
        secureQrToken: app.secureQrToken || generateSecureQrToken(),
        attendanceLogs: app.attendanceLogs || (app.attendanceDays || []).map((day) => ({
          day,
          scannedAt: new Date().toISOString(),
          session: 'Genel Oturum',
          adminName: 'Sistem'
        }))
      }));
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const apps: Application[] = JSON.parse(raw);
    // Ensure backwards compatibility with new fields
    return apps.map((app) => ({
      ...app,
      isActive: app.isActive !== false,
      secureQrToken: app.secureQrToken || `IGM26-SEC-${app.qrCodeId.replace(/[^a-zA-Z0-9]/g, '')}`,
      attendanceLogs: app.attendanceLogs || []
    }));
  } catch {
    return [];
  }
}

export function saveStoredApplications(apps: Application[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    window.dispatchEvent(new Event('igm_auth_change'));
    window.dispatchEvent(new Event('igm_applications_updated'));
  } catch (err) {
    console.error('Failed to save applications to localStorage:', err);
  }
}

let isSyncingApplications = false;

/**
 * Uzak veritabanından gelen veriler ile yerel verileri akıllıca birleştirir.
 * Son 15 saniye içinde yerelde yapılan durum değişiklikleri (örn. onaylandı/reddedildi)
 * olası yarış durumlarına karşı korunur.
 */
function mergeApplicationsWithLocal(localApps: Application[], remoteApps: Application[]): Application[] {
  if (!remoteApps || remoteApps.length === 0) return localApps;
  
  const remoteMap = new Map(remoteApps.map((a) => [a.id, a]));
  const remoteEmails = new Set(remoteApps.map((a) => a.email.toLowerCase()));
  const now = Date.now();

  const merged: Application[] = remoteApps.map((remote) => {
    const local = localApps.find((l) => l.id === remote.id || l.email.toLowerCase() === remote.email.toLowerCase());
    if (!local) return remote;

    const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
    const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;

    // Eğer yerel kayıt daha yeniyse ve son 15 saniye içinde güncellenmişse, yerel durumu koru
    if (localTime > remoteTime && (now - localTime < 15000)) {
      return { ...remote, ...local };
    }
    return remote;
  });

  // Yerelde olup uzak sunucuya henüz ulaşmamış olan yeni başvuruları koru
  for (const local of localApps) {
    if (!remoteMap.has(local.id) && !remoteEmails.has(local.email.toLowerCase())) {
      if (!local.id.startsWith('mock-')) {
        merged.unshift(local);
      }
    }
  }

  return merged;
}

/**
 * Supabase bulut veritabanı ile yerel hafızayı senkronize eder.
 * Tüm admin panelleri bu fonksiyonu çağırarak farklı cihazlardan gelen başvuruları anında çeker.
 */
export async function syncApplicationsWithSupabase(): Promise<Application[]> {
  if (isSyncingApplications) {
    return getStoredApplications();
  }
  isSyncingApplications = true;
  try {
    const localApps = getStoredApplications();

    // 1. Önce güvenilir sunucu API route'undan (/api/applications) taze verileri çek
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/applications', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && Array.isArray(json.applications)) {
            const merged = mergeApplicationsWithLocal(localApps, json.applications);
            try {
              localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          }
        }
      } catch (apiErr) {
        console.warn('Could not fetch from /api/applications, falling back to direct Supabase:', apiErr);
      }
    }

    // 2. Doğrudan istemci Supabase sorgusu (API ulaşılamazsa fallback)
    const client = getSupabaseClient();
    if (!client) return localApps;

    try {
      const { data, error } = await client
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase applications fetch warning:', error);
        return localApps;
      }

      if (data && Array.isArray(data)) {
        const remoteApps = data.map(mapRowToApplication);
        const merged = mergeApplicationsWithLocal(localApps, remoteApps);
        try {
          localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
    } catch (err) {
      console.error('Failed to sync applications with Supabase:', err);
    }

    return localApps;
  } finally {
    isSyncingApplications = false;
  }
}

export async function createApplication(
  data: Omit<Application, 'id' | 'createdAt' | 'status' | 'qrCodeId' | 'attendanceDays'>
): Promise<Application> {
  // 1. Doğrudan sunucu API route'una POST et (/api/applications)
  // Bu sayede kullanıcının cihazı ne olursa olsun başvuru merkezi veritabanına kaydedilir.
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
      throw new Error(json.error || `Başvuru sunucuya iletilemedi (Kod: ${res.status})`);
    }

    const createdApp = json.application as Application;

    // 2. Kullanıcının kendi cihazında biletini hemen görebilmesi için yerel hafızaya da kaydet
    if (typeof window !== 'undefined') {
      const apps = getStoredApplications();
      const updated = [createdApp, ...apps.filter((a) => a.email.toLowerCase() !== createdApp.email.toLowerCase())];
      saveStoredApplications(updated);
    }

    return createdApp;
  } catch (err: any) {
    console.error('createApplication hatası:', err);
    throw err;
  }
}

export function updateApplication(id: string, updates: Partial<Application>): Application | null {
  const apps = getStoredApplications();
  let updatedApp: Application | null = null;
  const now = new Date().toISOString();
  const updated = apps.map((app) => {
    if (app.id === id) {
      updatedApp = { 
        ...app, 
        ...updates, 
        updatedAt: now 
      };
      return updatedApp;
    }
    return app;
  });
  saveStoredApplications(updated);

  // If current logged-in participant, update session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id && updatedApp) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedApp));
    }
  }

  if (updatedApp) {
    // 1. Sunucu API route'una PATCH gönder (merkezi veritabanı kaydı)
    if (typeof window !== 'undefined') {
      fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      }).catch((err) => {
        console.warn('API updateApplication PATCH warning:', err);
      });
    }

    // 2. İstemci Supabase doğrudan bağlantısı varsa yedek güncelle
    const client = getSupabaseClient();
    if (client) {
      const row = mapApplicationToRow(updatedApp);
      client.from('applications').update(row).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase update application warning:', error);
      });
    }
  }

  return updatedApp;
}

export function updateApplicationStatus(
  id: string, 
  status: ApplicationStatus, 
  adminName: string = 'Divan Heyeti'
): Application[] {
  const apps = getStoredApplications();
  let changedApp: Application | null = null;
  const now = new Date().toISOString();
  const isApproving = status === 'approved';

  const updated = apps.map((app) => {
    if (app.id === id) {
      changedApp = {
        ...app,
        status,
        approvedAt: isApproving ? (app.approvedAt || now) : (status === 'pending' ? undefined : app.approvedAt),
        approvedBy: isApproving ? (app.approvedBy || adminName) : app.approvedBy,
        secureQrToken: app.secureQrToken || generateSecureQrToken(),
        updatedAt: now
      };
      return changedApp;
    }
    return app;
  });

  // 1. Yerel durumu anında kaydet ve UI'yı tetikle (Hızlı arayüz tepkisi)
  saveStoredApplications(updated);

  // 2. Sunucu API route'una PATCH isteği at (Vercel, Render ve canlı sunucuda garantili kayıt)
  if (changedApp) {
    const patchPayload = {
      id,
      status: (changedApp as Application).status,
      approvedAt: (changedApp as Application).approvedAt || null,
      approvedBy: (changedApp as Application).approvedBy || null,
      secureQrToken: (changedApp as Application).secureQrToken || null
    };

    if (typeof window !== 'undefined') {
      fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload)
      }).then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[API updateApplicationStatus Error]:', errData);
        }
      }).catch((netErr) => {
        console.warn('API update status network warning:', netErr);
      });
    }

    // 3. Doğrudan istemci Supabase istemcisi varsa
    const client = getSupabaseClient();
    if (client) {
      client.from('applications').update({
        status: (changedApp as Application).status,
        approved_at: (changedApp as Application).approvedAt || null,
        approved_by: (changedApp as Application).approvedBy || null,
        secure_qr_token: (changedApp as Application).secureQrToken || null,
        updated_at: now
      }).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase update status direct warning:', error);
      });
    }
  }

  return updated;
}

export async function updateApplicationStatusAsync(
  id: string,
  status: ApplicationStatus,
  adminName: string = 'Divan Heyeti'
): Promise<Application[]> {
  const updated = updateApplicationStatus(id, status, adminName);
  try {
    const target = updated.find((a) => a.id === id);
    if (target && typeof window !== 'undefined') {
      await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: target.status,
          approvedAt: target.approvedAt || null,
          approvedBy: target.approvedBy || null,
          secureQrToken: target.secureQrToken || null
        })
      });
    }
  } catch (err) {
    console.warn('updateApplicationStatusAsync exception:', err);
  }
  return updated;
}

export function toggleUserStatus(id: string): Application | null {
  const apps = getStoredApplications();
  let toggled: Application | null = null;
  const now = new Date().toISOString();
  const updated = apps.map((app) => {
    if (app.id === id) {
      toggled = { ...app, isActive: app.isActive === false ? true : false, updatedAt: now };
      return toggled;
    }
    return app;
  });
  saveStoredApplications(updated);

  if (toggled) {
    const isActive = (toggled as Application).isActive;
    if (typeof window !== 'undefined') {
      fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      }).catch(() => {});
    }

    const client = getSupabaseClient();
    if (client) {
      client.from('applications').update({
        is_active: isActive,
        updated_at: now
      }).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase toggle user status warning:', error);
      });
    }
  }

  return toggled;
}

export function updateApplicationPaymentEmailStatus(
  id: string,
  sentNotes?: string
): Application[] {
  const apps = getStoredApplications();
  let changedApp: Application | null = null;
  const now = new Date().toISOString();
  const updated = apps.map((app) => {
    if (app.id === id) {
      changedApp = {
        ...app,
        paymentEmailSent: true,
        paymentEmailSentAt: now,
        paymentEmailNotes: sentNotes || app.paymentEmailNotes || 'IBAN & Bilgilendirme E-postası iletildi.',
        updatedAt: now
      };
      return changedApp;
    }
    return app;
  });
  saveStoredApplications(updated);

  // Tablo şemasında bu kolon opsiyonel olduğu için sunucu PATCH üzerinden gönderilir
  if (typeof window !== 'undefined' && changedApp) {
    fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        updatedAt: now
      })
    }).catch(() => {});
  }

  return updated;
}

export function safeDeleteApplication(id: string): Application[] {
  const apps = getStoredApplications();
  const target = apps.find((a) => a.id === id);
  const updated = apps.filter((a) => a.id !== id);
  saveStoredApplications(updated);

  // 1. Sunucu API üzerinden kalıcı sil
  if (typeof window !== 'undefined') {
    fetch(`/api/applications?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch((err) => {
      console.warn('API delete application error:', err);
    });
  }

  // 2. Doğrudan istemci Supabase istemcisi varsa
  const client = getSupabaseClient();
  if (client) {
    client.from('applications').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase delete application error:', error);
    });
  }

  // If user has gallery items, anonymize or handle safely
  if (target) {
    try {
      const gallery = getStoredGallery();
      const updatedGallery = gallery.map((g) => {
        if (g.uploaderEmail === target.email || g.uploaderName === target.fullName) {
          return {
            ...g,
            uploaderName: `${target.fullName} (Eski Kullanıcı)`
          };
        }
        return g;
      });
      saveStoredGallery(updatedGallery);
    } catch (e) {
      console.warn('Error handling user gallery items during delete:', e);
    }
  }

  // If current session was this user, log out
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    logoutParticipant();
  }

  return updated;
}

export function clearAllApplications(): void {
  saveStoredApplications([]);
}

// -------------------------------------------------------------
// 2. ATTENDANCE & QR SCANNING (DUPLICATE PREVENTING)
// -------------------------------------------------------------

export function findApplicationByQr(code: string): Application | undefined {
  if (!code) return undefined;
  let raw = String(code).trim();
  if (!raw) return undefined;

  // Try decoding in case it's URI-encoded
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // ignore
  }

  const apps = getStoredApplications();
  const clean = raw.toUpperCase();

  // 1. Direct match on qrCodeId, secureQrToken, id, email, identityNo, phone
  const directMatch = apps.find(
    (a) =>
      (a.qrCodeId && a.qrCodeId.toUpperCase() === clean) ||
      (a.secureQrToken && a.secureQrToken.toUpperCase() === clean) ||
      (a.id && String(a.id).toUpperCase() === clean) ||
      (a.email && a.email.toLowerCase() === raw.toLowerCase()) ||
      (a.identityNo && a.identityNo.trim() === raw.trim()) ||
      (a.phone && a.phone.replace(/\D/g, '') === raw.replace(/\D/g, '') && raw.replace(/\D/g, '').length >= 10)
  );
  if (directMatch) return directMatch;

  // 2. Extract IGM token from URL or text string (e.g., https://...#IGM26-SEC-... or IGM26-ADA-1234)
  const tokenMatch = raw.match(/IGM26(?:-SEC)?-[A-Z0-9-]+/i);
  if (tokenMatch) {
    const extracted = tokenMatch[0].toUpperCase();
    const tokenApp = apps.find(
      (a) =>
        (a.qrCodeId && a.qrCodeId.toUpperCase() === extracted) ||
        (a.secureQrToken && a.secureQrToken.toUpperCase() === extracted)
    );
    if (tokenApp) return tokenApp;
  }

  // 3. Match alphanumeric stripped values (e.g. IGM26ADA1234 -> IGM26-ADA-1234)
  const strippedClean = clean.replace(/[^A-Z0-9]/g, '');
  if (strippedClean.length >= 6) {
    const strippedMatch = apps.find((a) => {
      const aQr = (a.qrCodeId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const aSec = (a.secureQrToken || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return aQr === strippedClean || aSec === strippedClean;
    });
    if (strippedMatch) return strippedMatch;
  }

  // 4. Try JSON parsing if encoded as JSON object
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed = JSON.parse(raw);
      const possibleId = parsed.qrCodeId || parsed.token || parsed.id || parsed.code || parsed.email;
      if (possibleId && typeof possibleId === 'string') {
        return findApplicationByQr(possibleId);
      }
    } catch {
      // not json
    }
  }

  return undefined;
}

export type ScanResult = {
  success: boolean;
  code: 'success' | 'duplicate' | 'not_found' | 'not_approved' | 'inactive';
  message: string;
  user?: Application;
  record?: AttendanceRecord;
};

export function recordAttendanceWithTimestamp(
  identifier: string,
  day: string,
  session: string = 'Oturum',
  adminName: string = 'Divan Heyeti'
): ScanResult {
  const user = findApplicationByQr(identifier);

  if (!user) {
    return {
      success: false,
      code: 'not_found',
      message: `"${identifier}" kodu ile eşleşen delege veya kullanıcı kaydı bulunamadı.`
    };
  }

  if (user.status !== 'approved') {
    return {
      success: false,
      code: 'not_approved',
      message: `${user.fullName} adlı delegenin başvurusu henüz onaylanmamıştır (Durum: ${user.status === 'pending' ? 'Beklemede' : 'Reddedildi'}).`,
      user
    };
  }

  if (user.isActive === false) {
    return {
      success: false,
      code: 'inactive',
      message: `${user.fullName} adlı kullanıcının hesabı yönetici tarafından dondurulmuştur/pasiftir.`,
      user
    };
  }

  const attendedDays = user.attendanceDays || [];
  if (attendedDays.includes(day)) {
    return {
      success: false,
      code: 'duplicate',
      message: `${user.fullName} için "${day}" yoklaması daha önce alınmıştır! Mükerrer kayıt engellendi.`,
      user
    };
  }

  // Record attendance
  const newRecord: AttendanceRecord = {
    day,
    scannedAt: new Date().toISOString(),
    session,
    adminName
  };

  const updatedDays = [...attendedDays, day];
  const updatedLogs = [...(user.attendanceLogs || []), newRecord];

  const updatedUser = updateApplication(user.id, {
    attendanceDays: updatedDays,
    attendanceLogs: updatedLogs
  });

  return {
    success: true,
    code: 'success',
    message: `${user.fullName} (${user.commissionId.toUpperCase()}) için ${day} yoklaması başarıyla kaydedildi.`,
    user: updatedUser || user,
    record: newRecord
  };
}

export function toggleAttendance(id: string, day: string): Application | null {
  const apps = getStoredApplications();
  let updatedApp: Application | null = null;
  const now = new Date().toISOString();
  const updated = apps.map((app) => {
    if (app.id === id) {
      const days = app.attendanceDays || [];
      const hasDay = days.includes(day);
      const newDays = hasDay ? days.filter((d) => d !== day) : [...days, day];
      let newLogs = app.attendanceLogs || [];
      if (hasDay) {
        newLogs = newLogs.filter((log) => log.day !== day);
      } else {
        newLogs = [
          ...newLogs,
          {
            day,
            scannedAt: now,
            session: 'Manuel Yoklama',
            adminName: 'Admin Panel'
          }
        ];
      }
      updatedApp = { ...app, attendanceDays: newDays, attendanceLogs: newLogs, updatedAt: now };
      return updatedApp;
    }
    return app;
  });
  saveStoredApplications(updated);

  if (updatedApp) {
    if (typeof window !== 'undefined') {
      fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          attendanceDays: (updatedApp as Application).attendanceDays,
          attendanceLogs: (updatedApp as Application).attendanceLogs
        })
      }).catch(() => {});
    }

    const client = getSupabaseClient();
    if (client) {
      client.from('applications').update({
        attendance_days: (updatedApp as Application).attendanceDays,
        attendance_logs: (updatedApp as Application).attendanceLogs,
        updated_at: now
      }).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase toggle attendance warning:', error);
      });
    }
  }

  return updatedApp;
}

// -------------------------------------------------------------
// 3. TWO-TIER GALLERY & MEDIA MODERATION
// -------------------------------------------------------------

export function getStoredGallery(): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) {
      const seeded = (GALLERY_ITEMS || []).map((g, idx) => ({
        ...g,
        status: (g.isApproved ? 'approved' : 'pending') as GalleryItemStatus,
        order: idx + 1
      }));
      localStorage.setItem(GALLERY_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed: GalleryItem[] = JSON.parse(raw);
    return parsed.map((item, idx) => ({
      ...item,
      status: item.status || (item.isApproved ? 'approved' : 'pending'),
      order: item.order ?? (idx + 1)
    }));
  } catch {
    return [];
  }
}

export function saveStoredGallery(items: GalleryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('igm_gallery_updated'));
  } catch (err) {
    console.error('Failed to save gallery:', err);
  }
}

// Admin directly adds media to public or members gallery (auto approved)
export function adminAddGalleryItem(
  item: Omit<GalleryItem, 'id' | 'createdAt' | 'isApproved' | 'status'> & {
    visibility?: 'public' | 'members';
    isApproved?: boolean;
  }
): GalleryItem {
  const items = getStoredGallery();
  const newItem: GalleryItem = {
    ...item,
    id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString().split('T')[0],
    isApproved: item.isApproved !== false,
    status: item.isApproved !== false ? 'approved' : 'pending',
    visibility: item.visibility || 'public',
    order: item.order || items.length + 1,
    approvedBy: 'Admin',
    approvedAt: new Date().toISOString()
  };
  const updated = [newItem, ...items];
  saveStoredGallery(updated);

  if (supabase) {
    supabase.from('gallery_photos').insert({
      title: newItem.title,
      media_url: newItem.mediaUrl,
      media_type: newItem.mediaType,
      category: newItem.category,
      uploader_name: newItem.uploaderName || 'Divan Heyeti (Admin)',
      is_approved: newItem.isApproved
    }).then(({ error }) => {
      if (error) console.error('Supabase gallery insert error:', error);
    });
  }

  return newItem;
}

// Admin directly adds multiple media items at once (atomic batch write)
export function adminAddGalleryItems(
  newItemsData: Array<Omit<GalleryItem, 'id' | 'createdAt' | 'isApproved' | 'status'> & {
    visibility?: 'public' | 'members';
    isApproved?: boolean;
  }>
): GalleryItem[] {
  if (!newItemsData || newItemsData.length === 0) return [];
  const existingItems = getStoredGallery();
  const createdItems: GalleryItem[] = newItemsData.map((item, idx) => ({
    ...item,
    id: `g-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString().split('T')[0],
    isApproved: item.isApproved !== false,
    status: item.isApproved !== false ? 'approved' : 'pending',
    visibility: item.visibility || 'public',
    order: (item.order || existingItems.length + 1) + idx,
    approvedBy: 'Admin',
    approvedAt: new Date().toISOString()
  }));

  const updated = [...createdItems, ...existingItems];
  saveStoredGallery(updated);

  if (supabase) {
    const rows = createdItems.map((item) => ({
      title: item.title,
      media_url: item.mediaUrl,
      media_type: item.mediaType,
      category: item.category,
      uploader_name: item.uploaderName || 'Divan Heyeti (Admin)',
      is_approved: item.isApproved
    }));
    supabase.from('gallery_photos').insert(rows).then(({ error }) => {
      if (error) console.error('Supabase bulk gallery insert error:', error);
    });
  }

  return createdItems;
}

export const addGalleryPhoto = adminAddGalleryItem;
export const addGalleryItem = adminAddGalleryItem;

// Participant submits media -> automatically enters 'pending' state
export function submitUserMedia(data: {
  title: string;
  description?: string;
  mediaUrl: string;
  category: 'etkinlik' | 'komisyon' | 'kulis' | 'video';
  mediaType?: 'image' | 'video';
  uploaderName: string;
  uploaderEmail?: string;
}): GalleryItem {
  const items = getStoredGallery();
  const newItem: GalleryItem = {
    id: `g-user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: data.title,
    description: data.description || '',
    mediaUrl: data.mediaUrl,
    category: data.category,
    mediaType: data.mediaType || 'image',
    uploaderName: data.uploaderName,
    uploaderEmail: data.uploaderEmail,
    isApproved: false,
    status: 'pending',
    visibility: 'public',
    order: 999,
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newItem, ...items];
  saveStoredGallery(updated);

  if (supabase) {
    supabase.from('gallery_photos').insert({
      title: newItem.title,
      media_url: newItem.mediaUrl,
      media_type: newItem.mediaType,
      category: newItem.category,
      uploader_name: newItem.uploaderName,
      is_approved: false
    }).then(({ error }) => {
      if (error) console.error('Supabase gallery insert error:', error);
    });
  }

  return newItem;
}

export function moderateGalleryItem(
  id: string,
  action: 'approved' | 'rejected',
  reason?: string,
  visibility: 'public' | 'members' = 'public'
): GalleryItem[] {
  const items = getStoredGallery();
  const updated = items.map((g) => {
    if (g.id === id) {
      return {
        ...g,
        isApproved: action === 'approved',
        status: action,
        rejectedReason: action === 'rejected' ? reason : undefined,
        visibility: action === 'approved' ? visibility : g.visibility,
        approvedBy: action === 'approved' ? 'Divan Heyeti' : undefined,
        approvedAt: action === 'approved' ? new Date().toISOString() : undefined
      };
    }
    return g;
  });
  saveStoredGallery(updated);
  return updated;
}

export function bulkModerateGallery(
  ids: string[],
  action: 'approved' | 'rejected' | 'delete',
  reason?: string
): GalleryItem[] {
  const items = getStoredGallery();
  if (action === 'delete') {
    const updated = items.filter((g) => !ids.includes(g.id));
    saveStoredGallery(updated);
    return updated;
  }
  const updated = items.map((g) => {
    if (ids.includes(g.id)) {
      return {
        ...g,
        isApproved: action === 'approved',
        status: action,
        rejectedReason: action === 'rejected' ? reason : undefined,
        approvedBy: action === 'approved' ? 'Divan Heyeti' : undefined,
        approvedAt: action === 'approved' ? new Date().toISOString() : undefined
      };
    }
    return g;
  });
  saveStoredGallery(updated);
  return updated;
}

export function approveGalleryItem(id: string, visibility?: 'public' | 'members'): GalleryItem[] {
  return moderateGalleryItem(id, 'approved', undefined, visibility || 'public');
}

export function toggleGalleryVisibility(id: string): GalleryItem[] {
  const items = getStoredGallery();
  const updated = items.map((g) => {
    if (g.id === id) {
      const nextVis = g.visibility === 'members' ? 'public' : 'members';
      return { ...g, visibility: nextVis as 'public' | 'members' };
    }
    return g;
  });
  saveStoredGallery(updated);
  return updated;
}

export function deleteGalleryItem(id: string): GalleryItem[] {
  const items = getStoredGallery();
  const updated = items.filter((g) => g.id !== id);
  saveStoredGallery(updated);
  return updated;
}

export function getPublicGallery(): GalleryItem[] {
  const items = getStoredGallery();
  return items
    .filter((g) => g.isApproved && g.status !== 'rejected' && (g.visibility === 'public' || !g.visibility))
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

export function getMemberGallery(): GalleryItem[] {
  const items = getStoredGallery();
  return items
    .filter((g) => g.isApproved && g.status !== 'rejected')
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

export function getPendingGallery(): GalleryItem[] {
  const items = getStoredGallery();
  return items.filter((g) => !g.isApproved || g.status === 'pending');
}

export function getUserGalleryItems(fullName: string, email?: string): GalleryItem[] {
  const gallery = getStoredGallery();
  const cleanName = fullName.trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();
  return gallery.filter((g) => {
    const matchName = (g.uploaderName || '').trim().toLowerCase() === cleanName;
    const matchEmail = cleanEmail && (g.uploaderEmail || '').trim().toLowerCase() === cleanEmail;
    return matchName || matchEmail;
  });
}

// -------------------------------------------------------------
// 4. PARTICIPANT AUTHENTICATION & USER PROFILE
// -------------------------------------------------------------

export async function loginParticipant(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: Application }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  let matched: Application | undefined;

  // 1. Önce Supabase'den kontrol et (kullanıcı farklı cihazdan veya Render üzerinden başvurmuşsa anında bulunur)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        matched = mapRowToApplication(data);
        // Yerel önbelleğe de senkronize et
        const currentApps = getStoredApplications();
        const existingIdx = currentApps.findIndex(
          (a) => a.id === matched!.id || a.email.toLowerCase() === cleanEmail
        );
        if (existingIdx >= 0) {
          currentApps[existingIdx] = matched;
        } else {
          currentApps.unshift(matched);
        }
        saveStoredApplications(currentApps);
      }
    } catch (err) {
      console.warn('Supabase login check failed, falling back to local storage:', err);
    }
  }

  // 2. Bulunamadıysa yerel hafızaya bak
  if (!matched) {
    const apps = getStoredApplications();
    matched = apps.find((a) => a.email.toLowerCase() === cleanEmail);
  }

  if (!matched) {
    return {
      success: false,
      message: 'Bu e-posta adresine ait bir delege başvurusu bulunamadı. Lütfen önce başvuru yapınız.'
    };
  }

  if (matched.isActive === false) {
    return {
      success: false,
      message: 'Hesabınız yönetici tarafından pasife alınmıştır. Lütfen organizasyon heyetiyle iletişime geçiniz.'
    };
  }

  const appPassword = matched.password || '123456';
  if (appPassword !== cleanPassword) {
    return {
      success: false,
      message: 'Girdiğiniz 6 haneli şifre hatalıdır. Lütfen kontrol edip tekrar deneyiniz.'
    };
  }

  if (matched.status === 'pending') {
    return {
      success: false,
      message: 'Başvurunuz henüz divan heyeti tarafından onaylanmamıştır (Durum: Beklemede). Başvurunuz kabul edildiğinde bu alandan profilinize erişebilirsiniz.'
    };
  }

  if (matched.status === 'rejected') {
    return {
      success: false,
      message: 'Delege başvurunuz kontenjan veya değerlendirme kriterleri sebebiyle onaylanmamıştır.'
    };
  }

  // Update last login
  const now = new Date().toISOString();
  updateApplication(matched.id, { lastLoginAt: now });
  const liveUser = { ...matched, lastLoginAt: now };

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(liveUser));
    window.dispatchEvent(new Event('igm_auth_change'));
  }

  return {
    success: true,
    message: 'Giriş başarılı! Profilinize yönlendiriliyorsunuz.',
    user: liveUser
  };
}

export function getCurrentUser(): Application | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const sessionApp: Application = JSON.parse(raw);
    const apps = getStoredApplications();
    const live = apps.find((a) => a.id === sessionApp.id);
    return live || sessionApp;
  } catch {
    return null;
  }
}

export function logoutParticipant(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_SESSION_KEY);
  window.dispatchEvent(new Event('igm_auth_change'));
}

export function updateParticipantAvatar(applicationId: string, avatarUrl: string): Application | null {
  return updateApplication(applicationId, { avatarUrl });
}

export function updateUserProfile(
  applicationId: string,
  data: Partial<Pick<Application, 'phone' | 'school' | 'department' | 'city' | 'password' | 'avatarUrl' | 'motivation'>>
): Application | null {
  return updateApplication(applicationId, data);
}

// -------------------------------------------------------------
// 5. ANNOUNCEMENTS
// -------------------------------------------------------------

export function getStoredAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(MOCK_ANNOUNCEMENTS || []));
      return MOCK_ANNOUNCEMENTS || [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredAnnouncements(announcements: Announcement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    window.dispatchEvent(new Event('igm_announcements_updated'));
  } catch (err) {
    console.error('Failed to save announcements:', err);
  }
}

export function createAnnouncement(
  data: Omit<Announcement, 'id' | 'createdAt'>
): Announcement {
  const announcements = getStoredAnnouncements();
  const newAnn: Announcement = {
    ...data,
    id: `ann-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newAnn, ...announcements];
  saveStoredAnnouncements(updated);
  return newAnn;
}

export function deleteAnnouncement(id: string): Announcement[] {
  const announcements = getStoredAnnouncements();
  const updated = announcements.filter((a) => a.id !== id);
  saveStoredAnnouncements(updated);
  return updated;
}

export function getUserAnnouncements(userStatus?: ApplicationStatus): Announcement[] {
  const announcements = getStoredAnnouncements();
  return announcements.filter((a) => {
    if (!a.targetGroup || a.targetGroup === 'all') return true;
    if (a.targetGroup === 'approved_delegates') {
      return !userStatus || userStatus === 'approved';
    }
    if (a.targetGroup === 'pending') {
      return userStatus === 'pending';
    }
    return true;
  });
}

// -------------------------------------------------------------
// 6. EXCEL EXPORT (FALLBACK)
// -------------------------------------------------------------

export function exportApplicationsToExcel(applications: Application[]): void {
  const rows = applications.map((app, index) => ({
    'Sıra No': index + 1,
    'Delege Kodu (QR ID)': app.qrCodeId,
    'Güvenli QR Token': app.secureQrToken || '-',
    'Adı Soyadı': app.fullName,
    'Durum': app.status === 'approved' ? 'ONAYLANDI' : app.status === 'rejected' ? 'REDDEDİLDİ' : 'BEKLEMEDE',
    'Hesap Durumu': app.isActive === false ? 'PASİF' : 'AKTİF',
    'Komisyon Tercihi': app.commissionId.toUpperCase(),
    '2. Tercih': app.secondChoiceId ? app.secondChoiceId.toUpperCase() : '-',
    'Üniversite / Kurum': app.school,
    'Bölüm': app.department,
    'Şehir': app.city || 'Konya',
    'E-Posta': app.email,
    'Telefon': app.phone,
    'T.C. / Öğrenci No': app.identityNo,
    '23 Ekim Yoklama': (app.attendanceDays || []).includes('23 Ekim') ? 'GELDİ' : 'YOK',
    '24 Ekim Yoklama': (app.attendanceDays || []).includes('24 Ekim') ? 'GELDİ' : 'YOK',
    '25 Ekim Yoklama': (app.attendanceDays || []).includes('25 Ekim') ? 'GELDİ' : 'YOK',
    'Başvuru Tarihi': new Date(app.createdAt).toLocaleDateString('tr-TR'),
    'Motivasyon': app.motivation
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Delegeler');

  const columnWidths = [
    { wch: 8 },  // Sıra
    { wch: 18 }, // QR ID
    { wch: 22 }, // Secure Token
    { wch: 24 }, // Ad Soyad
    { wch: 14 }, // Durum
    { wch: 12 }, // Hesap Durumu
    { wch: 18 }, // Komisyon
    { wch: 16 }, // 2. Tercih
    { wch: 30 }, // Okul
    { wch: 30 }, // Bölüm
    { wch: 12 }, // Şehir
    { wch: 28 }, // Email
    { wch: 16 }, // Telefon
    { wch: 18 }, // TC No
    { wch: 15 }, // 23 Ekim
    { wch: 15 }, // 24 Ekim
    { wch: 15 }, // 25 Ekim
    { wch: 14 }, // Tarih
    { wch: 45 }  // Motivasyon
  ];
  worksheet['!cols'] = columnWidths;

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `ONDER_Irfan_Meclisi_Delegeler_${dateStr}.xlsx`);
}
