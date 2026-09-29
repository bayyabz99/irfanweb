import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const DEFAULT_SUPABASE_URL = 'https://jjwhyxsdfmfybkofccit.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqd2h5eHNkZm1meWJrb2ZjY2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODQxODMsImV4cCI6MjEwNjI2MDE4M30.sDz099eFPpoe4vSKmtbuXxAI7qP89b9_a5wIdv1q6MY';

export function getActiveSupabaseConfig(): SupabaseConfig {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('igm_supabase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Eski projeye ait önbelleği otomatik temizle
        if (parsed.url && parsed.url.includes('swfwzqekwxmsifmtfgfn')) {
          localStorage.removeItem('igm_supabase_config');
        } else {
          if (!url && parsed.url) url = parsed.url;
          if (!anonKey && parsed.anonKey) anonKey = parsed.anonKey;
        }
      }
    } catch {}
  }

  // Vercel Hobby veya Render gibi ortamlarda ortam değişkeni eksikse güvenli varsayılana fallback yap
  if (!url || url.includes('placeholder') || !url.startsWith('http') || url.includes('swfwzqekwxmsifmtfgfn')) {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!anonKey || anonKey.includes('placeholder') || anonKey.includes('8zEy6xIbaai89WXRAO0utzuLtrDgK1uUsl0UXW6yJ8c')) {
    anonKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  return { url, anonKey };
}

export function checkIsSupabaseConfigured(): boolean {
  const { url, anonKey } = getActiveSupabaseConfig();
  return Boolean(
    url && 
    anonKey && 
    !url.includes('placeholder') &&
    url.startsWith('http')
  );
}

function createClientInstance(): SupabaseClient | null {
  const { url, anonKey } = getActiveSupabaseConfig();
  if (!url || !anonKey || url.includes('placeholder') || !url.startsWith('http')) {
    return null;
  }
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error('Supabase client initialization error:', err);
    return null;
  }
}

export let supabase: SupabaseClient | null = createClientInstance();
export let isSupabaseConfigured: boolean = checkIsSupabaseConfigured();

export function refreshSupabaseClient(): SupabaseClient | null {
  supabase = createClientInstance();
  isSupabaseConfigured = checkIsSupabaseConfigured();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('igm_supabase_config_updated'));
  }
  return supabase;
}

/**
 * Sunucu tarafı (API routes / serverless) için Supabase istemcisi oluşturur.
 * Vercel ortamında process.env üzerindeki değişkenleri kullanır.
 * Varsa SUPABASE_SERVICE_ROLE_KEY kullanarak yetkili istemci oluşturur.
 * Ortam değişkenleri tanımlanmamışsa varsayılan proje bağlantı bilgilerini kullanır.
 */
export function getServerSupabaseClient(): SupabaseClient | null {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!url || url.includes('placeholder') || !url.startsWith('http')) {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!anonKey || anonKey.includes('placeholder')) {
    anonKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  const keyToUse = serviceKey || anonKey;

  if (!url || !keyToUse || url.includes('placeholder') || !url.startsWith('http')) {
    return null;
  }

  try {
    return createClient(url, keyToUse, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.error('Server Supabase client error:', err);
    return null;
  }
}

/**
 * Supabase bağlantı bilgilerini tarayıcı oturumuna kaydeder ve sunucu tarafında doğrular.
 * Vercel read-only filesystem ortamında disk yazma hatası üretmez.
 */
export async function saveSupabaseConfig(
  url: string, 
  anonKey: string
): Promise<{ success: boolean; error?: string; message?: string; isProduction?: boolean }> {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (typeof window !== 'undefined') {
      localStorage.setItem('igm_supabase_config', JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    }

    const res = await fetch('/api/supabase-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, error: data.error || `Sunucu hatası: ${res.status}` };
    }

    refreshSupabaseClient();
    return { 
      success: true, 
      message: data.message || 'Supabase yapılandırması başarıyla doğrulandı.',
      isProduction: data.isProduction
    };
  } catch (err: any) {
    console.error('saveSupabaseConfig error:', err);
    return { success: false, error: err?.message || 'Kaydedilemedi' };
  }
}

/**
 * Supabase Storage'a görsel yükler ve genel erişilebilir URL'sini döner.
 */
export async function uploadImageToSupabaseStorage(
  bucket: 'avatars' | 'gallery',
  filePath: string,
  fileOrBlob: Blob | File
): Promise<{ url: string | null; error: string | null }> {
  const client = supabase || refreshSupabaseClient();
  if (!client) {
    return { url: null, error: 'Supabase yapılandırılmamış.' };
  }

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileOrBlob.type || 'image/jpeg'
      });

    if (error) {
      console.error(`Supabase Storage upload error (${bucket}):`, error);
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error(`Storage upload exception (${bucket}):`, err);
    return { url: null, error: err?.message || 'Görsel yüklenirken beklenmeyen bir hata oluştu.' };
  }
}

/**
 * Supabase bağlantısının canlı olup olmadığını test eder.
 * customUrl ve customKey verilirse doğrudan o parametrelerle bellekte test eder (diske yazmaz).
 */
export async function checkSupabaseConnection(
  customUrl?: string, 
  customKey?: string
): Promise<{ connected: boolean; message: string }> {
  const { url: defaultUrl, anonKey: defaultKey } = getActiveSupabaseConfig();
  const testUrl = (customUrl && customUrl.trim()) || defaultUrl;
  const testKey = (customKey && customKey.trim()) || defaultKey;

  if (!testUrl || !testKey || testUrl.includes('placeholder') || !testUrl.startsWith('http')) {
    return { connected: false, message: 'Supabase URL veya Anon Key tanımlanmamış.' };
  }

  try {
    const client = (customUrl && customKey)
      ? createClient(testUrl, testKey)
      : (supabase || refreshSupabaseClient() || createClient(testUrl, testKey));

    if (!client) {
      return { connected: false, message: 'Supabase istemcisi başlatılamadı.' };
    }

    // Commissions veya applications tablosundan hafif sorgu ile test et
    const { error } = await client.from('commissions').select('id').limit(1);
    if (error) {
      return { connected: false, message: `Bağlantı hatası: ${error.message} (Kod: ${error.code || 'RLS/HATA'})` };
    }
    return { connected: true, message: 'Supabase bulut veritabanına başarıyla bağlanıldı.' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Bağlantı kurulamadı.' };
  }
}
