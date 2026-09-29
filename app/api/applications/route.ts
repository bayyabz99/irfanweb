import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase';
import { mapRowToApplication, generateSecureQrToken } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/applications
 * Supabase applications tablosundaki tüm başvuruları çeker.
 * Admin paneli ve yetkili bileşenler tarafından kullanılır.
 */
export async function GET() {
  try {
    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase sunucu istemcisi başlatılamadı. Ortam değişkenlerini (NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY) kontrol ediniz.' 
        }, 
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API applications GET Error]:', error);
      return NextResponse.json(
        { success: false, error: `Veritabanı sorgu hatası: ${error.message}` },
        { status: 500 }
      );
    }

    const applications = (data || []).map(mapRowToApplication);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err: any) {
    console.error('[API applications GET Exception]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Beklenmeyen sunucu hatası' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Başvuru formundan gelen veriyi doğrular ve doğrudan Supabase applications tablosuna kaydeder.
 * Cihaz fark etmeksizin tüm başvuruların merkezi veritabanına ulaşmasını sağlar.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz başvuru verisi gönderildi.' },
        { status: 400 }
      );
    }

    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').toLowerCase().trim();
    const phone = String(body.phone || '').trim();
    const identityNo = String(body.identityNo || '').trim();
    const school = String(body.school || '').trim();
    const department = String(body.department || 'Genel').trim();
    const commissionId = String(body.commissionId || 'adalet').trim();
    const secondChoiceId = body.secondChoiceId ? String(body.secondChoiceId).trim() : null;
    const motivation = String(body.motivation || '').trim();
    const city = String(body.city || 'Konya').trim();
    const password = body.password ? String(body.password).trim() : null;

    // Zorunlu alan doğrulamaları
    if (!fullName || fullName.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Lütfen adınızı ve soyadınızı eksiksiz giriniz.' },
        { status: 400 }
      );
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir telefon numarası giriniz.' },
        { status: 400 }
      );
    }
    if (!identityNo || identityNo.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Lütfen T.C. Kimlik / Öğrenci numaranızı giriniz.' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Veritabanı bağlantısı kurulamadı. Lütfen sistem yöneticisiyle iletişime geçiniz.' 
        }, 
        { status: 503 }
      );
    }

    // 1. Mükerrer Başvuru Kontrolü (E-posta ve T.C. Kimlik)
    const { data: existingEmail } = await supabase
      .from('applications')
      .select('id, full_name, email')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Bu e-posta adresi (${email}) ile daha önce bir başvuru yapılmıştır.` 
        }, 
        { status: 409 }
      );
    }

    const { data: existingIdentity } = await supabase
      .from('applications')
      .select('id')
      .eq('identity_no', identityNo)
      .maybeSingle();

    if (existingIdentity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bu T.C. Kimlik / Öğrenci No ile daha önce bir başvuru yapılmıştır.' 
        }, 
        { status: 409 }
      );
    }

    // 2. Benzersiz QR Kodu ve Güvenli Token Üretimi
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = commissionId.slice(0, 3).toUpperCase();
    const qrCodeId = `IGM26-${prefix}-${codeSuffix}`;
    const secureQrToken = generateSecureQrToken();
    const id = crypto.randomUUID();

    // 3. Supabase Tablo Kolonlarına Birebir Uyumlu Veri Nesnesi
    // Not: Şemada olmayan alanlar burada gönderilmez, böylece PGRST204 hatası önlenir.
    const rowToInsert: Record<string, any> = {
      id,
      created_at: new Date().toISOString(),
      full_name: fullName,
      email,
      phone,
      identity_no: identityNo,
      school,
      department,
      commission_id: commissionId,
      second_choice_id: secondChoiceId,
      motivation: motivation || 'İrfan Genç Meclis vizyonuna katkı sağlamak istiyorum.',
      status: 'pending',
      qr_code_id: qrCodeId,
      secure_qr_token: secureQrToken,
      attendance_days: [],
      attendance_logs: [],
      city,
      password,
      is_active: true,
      is_blocked: false
    };

    // 4. Supabase applications tablosuna INSERT
    const { data: insertedData, error: insertError } = await supabase
      .from('applications')
      .insert(rowToInsert)
      .select()
      .single();

    if (insertError) {
      console.error('[API applications POST Insert Error]:', insertError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Başvuru veritabanına kaydedilemedi: ${insertError.message}` 
        },
        { status: 500 }
      );
    }

    const newApplication = mapRowToApplication(insertedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Başvurunuz başarıyla alındı ve veritabanına kaydedildi.',
        application: newApplication
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API applications POST Exception]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Başvuru işlenirken beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications
 * Bir başvurunun durumunu, onayını veya alanlarını günceller.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, error: 'Başvuru ID belirtilmedi.' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Veritabanı bağlantısı yok.' },
        { status: 500 }
      );
    }

    const { id, ...updates } = body;
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Durum ve Onay Bilgileri
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
    if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
    if (updates.secureQrToken !== undefined) dbUpdates.secure_qr_token = updates.secureQrToken;
    if (updates.qrCodeId !== undefined) dbUpdates.qr_code_id = updates.qrCodeId;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;

    // Kullanıcı Temel Bilgileri
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.email !== undefined) dbUpdates.email = String(updates.email).toLowerCase().trim();
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.identityNo !== undefined) dbUpdates.identity_no = updates.identityNo;
    if (updates.school !== undefined) dbUpdates.school = updates.school;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.commissionId !== undefined) dbUpdates.commission_id = updates.commissionId;
    if (updates.secondChoiceId !== undefined) dbUpdates.second_choice_id = updates.secondChoiceId;
    if (updates.motivation !== undefined) dbUpdates.motivation = updates.motivation;

    // Yoklama Bilgileri
    if (updates.attendanceDays !== undefined) dbUpdates.attendance_days = updates.attendanceDays;
    if (updates.attendanceLogs !== undefined) dbUpdates.attendance_logs = updates.attendanceLogs;

    const { data, error } = await supabase
      .from('applications')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[API applications PATCH Error]:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Güncellenecek başvuru bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: mapRowToApplication(data)
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Güncelleme hatası' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/applications
 * Başvuruyu veritabanından kalıcı olarak siler.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Silinecek başvuru ID belirtilmedi.' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Veritabanı bağlantısı yok.' },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API applications DELETE Error]:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Başvuru başarıyla silindi.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Silme hatası' },
      { status: 500 }
    );
  }
}
