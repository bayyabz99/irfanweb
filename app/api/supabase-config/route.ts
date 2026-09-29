import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const ENV_LOCAL_FILE = path.join(process.cwd(), '.env.local');
const CONFIG_FILE = path.join(process.cwd(), 'data', 'supabase-config.json');

export async function GET() {
  try {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    let source: 'environment' | 'local_fallback' | 'none' = 'none';

    if (url && anonKey) {
      source = 'environment';
    } else if (process.env.NODE_ENV !== 'production') {
      // Sadece local ortamda dosya fallback kontrolü (Vercel'de read-only disk sorgulanmaz)
      try {
        if (fs.existsSync(CONFIG_FILE)) {
          const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed.url) url = parsed.url;
          if (parsed.anonKey) anonKey = parsed.anonKey;
          if (url && anonKey) source = 'local_fallback';
        }
      } catch {}

      if ((!url || !anonKey) && fs.existsSync(ENV_LOCAL_FILE)) {
        try {
          const rawEnv = fs.readFileSync(ENV_LOCAL_FILE, 'utf-8');
          const urlMatch = rawEnv.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
          const keyMatch = rawEnv.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
          if (urlMatch && urlMatch[1]) url = urlMatch[1].trim();
          if (keyMatch && keyMatch[1]) anonKey = keyMatch[1].trim();
          if (url && anonKey) source = 'local_fallback';
        } catch {}
      }
    }

    const isConfigured = Boolean(
      url && 
      anonKey && 
      !url.includes('placeholder') &&
      url.startsWith('http')
    );

    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

    return NextResponse.json({
      configured: isConfigured,
      url: url || '',
      hasKey: Boolean(anonKey),
      keyPreview: anonKey ? `${anonKey.slice(0, 10)}...${anonKey.slice(-6)}` : '',
      source,
      isProduction,
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Config okunamadı' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, anonKey } = body;

    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Supabase URL ve Anon Key zorunludur.' }, { status: 400 });
    }

    const cleanUrl = String(url).trim();
    const cleanKey = String(anonKey).trim();

    if (!cleanUrl.startsWith('http')) {
      return NextResponse.json({ 
        error: 'Geçerli bir Supabase URL giriniz (örn: https://xxxx.supabase.co)' 
      }, { status: 400 });
    }

    // 1. Canlı Supabase bağlantısını test et (diske hiçbir şey yazmadan önce)
    try {
      const testClient = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { error: queryErr } = await testClient.from('commissions').select('id').limit(1);
      if (queryErr) {
        console.warn('Supabase test query warning:', queryErr);
        // RLS veya izin hatası olabilir, yine de URL/Key geçerliliğini teyit edelim
        if (queryErr.code === 'PGRST301' || queryErr.message.includes('JWT')) {
          return NextResponse.json({ 
            error: `Supabase kimlik doğrulama başarısız: ${queryErr.message}` 
          }, { status: 400 });
        }
      }
    } catch (testErr: any) {
      return NextResponse.json({ 
        error: `Supabase bağlantı testi başarısız: ${testErr?.message || 'Bağlanılamadı'}` 
      }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

    // 2. Bellek içi ortam değişkenlerini güncelle
    process.env.NEXT_PUBLIC_SUPABASE_URL = cleanUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = cleanKey;

    // 3. Vercel / Production Ortamı Yönetimi
    if (isProduction) {
      // Vercel serverless ortamında dosya sistemine yazılmaz (EROFS önlenir).
      // Kullanıcıya başarılı bağlantı ve Vercel Environment Variables bilgilendirmesi döner.
      return NextResponse.json({
        success: true,
        isProduction: true,
        connected: true,
        message: 'Supabase bağlantısı doğrulandı. Vercel ortamında kalıcı olması için bu değerleri Vercel Dashboard > Settings > Environment Variables bölümüne ekleyiniz.',
        url: cleanUrl,
        configured: true
      });
    }

    // 4. Local Geliştirme Ortamı Yönetimi (Yalnızca development'ta .env.local güncellenir)
    try {
      let envContent = '';
      if (fs.existsSync(ENV_LOCAL_FILE)) {
        envContent = fs.readFileSync(ENV_LOCAL_FILE, 'utf-8');
        envContent = envContent.replace(/NEXT_PUBLIC_SUPABASE_URL\s*=.*(\r?\n|$)/g, '');
        envContent = envContent.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=.*(\r?\n|$)/g, '');
      }
      envContent = `${envContent.trim()}\n\n# Supabase Configuration\nNEXT_PUBLIC_SUPABASE_URL=${cleanUrl}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${cleanKey}\n`;
      fs.writeFileSync(ENV_LOCAL_FILE, envContent, 'utf-8');
    } catch (writeErr) {
      console.warn('Local .env.local yazımı atlandı (zararsız):', writeErr);
    }

    return NextResponse.json({
      success: true,
      isProduction: false,
      connected: true,
      message: 'Supabase bağlantısı başarıyla doğrulandı ve .env.local dosyasına kaydedildi.',
      url: cleanUrl,
      configured: true
    });
  } catch (err: any) {
    console.error('Error saving Supabase config:', err);
    return NextResponse.json({ error: err?.message || 'Yapılandırma doğrulanamadı' }, { status: 500 });
  }
}
