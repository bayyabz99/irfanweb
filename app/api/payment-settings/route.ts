import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_PAYMENT_EMAIL_SETTINGS } from '@/lib/paymentEmail';
import { PaymentEmailSettings } from '@/lib/types';
import { getServerSupabaseClient } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'payment-settings.json');

// Ayarları oku: Öncelik Supabase app_settings tablosu, ardından yerel JSON dosya yedeği
export async function getPaymentSettings(): Promise<PaymentEmailSettings> {
  // 1. Supabase bulut veritabanından oku
  try {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'payment_settings')
        .maybeSingle();

      if (!error && data && data.value && typeof data.value === 'object') {
        return { ...DEFAULT_PAYMENT_EMAIL_SETTINGS, ...data.value };
      }
    }
  } catch (dbErr) {
    console.warn('Could not read payment settings from Supabase:', dbErr);
  }

  // 2. Yerel JSON dosyasından oku (salt okunur güvenli okuma)
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PAYMENT_EMAIL_SETTINGS, ...parsed };
    }
  } catch (fileErr) {
    console.warn('Could not read local payment-settings.json:', fileErr);
  }

  // 3. Varsayılan ayarları dön
  return DEFAULT_PAYMENT_EMAIL_SETTINGS;
}

export async function GET() {
  try {
    const settings = await getPaymentSettings();
    return NextResponse.json(settings, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Ayarlar okunamadı' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const incoming = await req.json().catch(() => null);
    if (!incoming || typeof incoming !== 'object') {
      return NextResponse.json({ error: 'Geçersiz veri gönderildi' }, { status: 400 });
    }

    const current = await getPaymentSettings();
    const merged: PaymentEmailSettings = {
      ...current,
      ...incoming
    };

    let persistedToDatabase = false;

    // 1. Supabase app_settings tablosuna kalıcı olarak kaydet (Vercel Serverless için birincil depolama)
    try {
      const supabase = getServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key: 'payment_settings',
            value: merged,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });

        if (!error) {
          persistedToDatabase = true;
        } else {
          console.warn('Supabase app_settings payment upsert warning:', error.message);
        }
      }
    } catch (dbErr) {
      console.warn('Failed to persist payment settings to Supabase:', dbErr);
    }

    // 2. Yalnızca local development ortamında yerel JSON dosyasını güncelle (güvenli try-catch ile)
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        await fs.promises.writeFile(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
      } catch (fileErr) {
        console.warn('Local payment file write skipped/failed:', fileErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: persistedToDatabase
        ? 'IBAN ve E-Posta ayarları Supabase bulut veritabanına başarıyla kaydedildi.'
        : 'IBAN ve E-Posta ayarları başarıyla güncellendi.',
      persistedToDatabase,
      settings: merged
    });
  } catch (err: any) {
    console.error('Error saving payment settings:', err);
    return NextResponse.json({ error: err?.message || 'Ayarlar kaydedilemedi' }, { status: 500 });
  }
}
