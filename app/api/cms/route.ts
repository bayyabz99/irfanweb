import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_CMS_DATA, CMSData } from '@/lib/cmsStorage';
import { getServerSupabaseClient } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const CMS_FILE = path.join(DATA_DIR, 'cms-content.json');

function mergeWithDefaults(parsed: any): CMSData {
  if (!parsed || typeof parsed !== 'object') return INITIAL_CMS_DATA;
  return {
    ...INITIAL_CMS_DATA,
    ...parsed,
    siteSettings: { ...INITIAL_CMS_DATA.siteSettings, ...(parsed.siteSettings || {}) },
    homepage: { ...INITIAL_CMS_DATA.homepage, ...(parsed.homepage || {}) },
    aboutPage: { ...INITIAL_CMS_DATA.aboutPage, ...(parsed.aboutPage || {}) },
    commissions: Array.isArray(parsed.commissions) ? parsed.commissions : INITIAL_CMS_DATA.commissions,
    team: Array.isArray(parsed.team) ? parsed.team : INITIAL_CMS_DATA.team,
    program: Array.isArray(parsed.program) ? parsed.program : INITIAL_CMS_DATA.program,
    gallery: Array.isArray(parsed.gallery) ? parsed.gallery : INITIAL_CMS_DATA.gallery,
    ekipPage: { ...INITIAL_CMS_DATA.ekipPage, ...(parsed.ekipPage || {}) },
    basvuruPage: { ...INITIAL_CMS_DATA.basvuruPage, ...(parsed.basvuruPage || {}) },
    galeriPage: { ...INITIAL_CMS_DATA.galeriPage, ...(parsed.galeriPage || {}) },
    contact: { ...INITIAL_CMS_DATA.contact, ...(parsed.contact || {}) },
    partiesSection: parsed.partiesSection && Array.isArray(parsed.partiesSection?.parties)
      ? {
          ...INITIAL_CMS_DATA.partiesSection,
          ...parsed.partiesSection,
          parties: parsed.partiesSection.parties
        }
      : (parsed.partiesSection || INITIAL_CMS_DATA.partiesSection)
  };
}

async function getCMSData(): Promise<CMSData> {
  // 1. Supabase bulut veritabanından oku (Vercel Serverless için birincil kalıcı depolama)
  try {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'cms_content')
        .maybeSingle();

      if (!error && data && data.value && typeof data.value === 'object') {
        return mergeWithDefaults(data.value);
      }
    }
  } catch (dbErr) {
    console.warn('Could not read CMS data from Supabase:', dbErr);
  }

  // 2. Yerel JSON dosyasından oku (salt okunur güvenli okuma)
  try {
    if (fs.existsSync(CMS_FILE)) {
      const raw = fs.readFileSync(CMS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return mergeWithDefaults(parsed);
    }
  } catch (fileErr) {
    console.warn('Could not read local cms-content.json:', fileErr);
  }

  // 3. Varsayılan CMS verisini dön
  return INITIAL_CMS_DATA;
}

export async function GET() {
  try {
    const data = await getCMSData();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'CMS verisi okunamadı' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const incomingData = await req.json().catch(() => null);

    if (!incomingData || typeof incomingData !== 'object') {
      return NextResponse.json({ error: 'Geçersiz CMS verisi' }, { status: 400 });
    }

    const mergedData = mergeWithDefaults(incomingData);
    let persistedToDatabase = false;

    // 1. Supabase app_settings tablosuna kalıcı olarak kaydet
    try {
      const supabase = getServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key: 'cms_content',
            value: mergedData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });

        if (!error) {
          persistedToDatabase = true;
        } else {
          console.warn('Supabase app_settings CMS upsert warning:', error.message);
        }
      }
    } catch (dbErr) {
      console.warn('Failed to save CMS data to Supabase:', dbErr);
    }

    // 2. Yalnızca local development ortamında yerel JSON dosyasına yaz (güvenli try-catch)
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        await fs.promises.writeFile(CMS_FILE, JSON.stringify(mergedData, null, 2), 'utf-8');
      } catch (fileErr) {
        console.warn('Local CMS file write skipped/failed:', fileErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: persistedToDatabase
        ? 'CMS verileri Supabase bulut veritabanına kalıcı olarak kaydedildi.'
        : 'CMS verileri başarıyla kaydedildi.',
      persistedToDatabase,
      data: mergedData
    });
  } catch (err: any) {
    console.error('Error saving CMS data:', err);
    return NextResponse.json({ error: err?.message || 'CMS verisi kaydedilemedi' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // 1. Supabase app_settings tablosunda sıfırla
    try {
      const supabase = getServerSupabaseClient();
      if (supabase) {
        await supabase
          .from('app_settings')
          .upsert({
            key: 'cms_content',
            value: INITIAL_CMS_DATA,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      }
    } catch (dbErr) {
      console.warn('Failed to reset CMS in Supabase:', dbErr);
    }

    // 2. Local development dosyasını sıfırla (güvenli)
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        await fs.promises.writeFile(CMS_FILE, JSON.stringify(INITIAL_CMS_DATA, null, 2), 'utf-8');
      } catch (fileErr) {
        console.warn('Local CMS reset file write skipped/failed:', fileErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'CMS verileri başarıyla varsayılanlara sıfırlandı.',
      data: INITIAL_CMS_DATA
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Sıfırlama başarısız' }, { status: 500 });
  }
}
