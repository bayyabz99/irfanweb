import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { DEFAULT_PAYMENT_EMAIL_SETTINGS, renderTemplateString } from '@/lib/paymentEmail';
import { PaymentEmailSettings } from '@/lib/types';

import { getPaymentSettings } from '@/app/api/payment-settings/route';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      applicant,
      customSubject,
      customMessage,
      customNote
    } = body;

    if (!applicant || !applicant.email) {
      return NextResponse.json(
        { error: 'Başvuru sahibi veya e-posta adresi belirtilmedi.' },
        { status: 400 }
      );
    }

    const settings = await getPaymentSettings();

    // Render templates with applicant details
    const subject = customSubject || renderTemplateString(settings.emailSubject, applicant, settings);
    const mainMessage = customMessage || renderTemplateString(settings.emailMessage, applicant, settings);
    const descNote = renderTemplateString(settings.paymentDescription, applicant, settings);
    const extraNotes = customNote || settings.additionalNotes;

    // Build professional responsive HTML email
    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #061A33 0%, #0c2e59 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; }
    .header p { margin: 8px 0 0 0; font-size: 13px; color: #DFB052; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .content { padding: 36px 32px; color: #1e293b; line-height: 1.65; font-size: 14px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .message { white-space: pre-line; margin-bottom: 24px; color: #334155; }
    .payment-box { background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 12px; padding: 22px; margin: 24px 0; }
    .payment-title { font-size: 13px; font-weight: 800; color: #061A33; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .pay-row { margin-bottom: 10px; font-size: 13px; }
    .pay-label { font-weight: 600; color: #64748b; display: inline-block; width: 130px; }
    .pay-val { font-weight: 700; color: #0f172a; }
    .iban-badge { display: block; margin-top: 12px; padding: 12px 14px; background: #061A33; color: #38bdf8; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: bold; border-radius: 8px; text-align: center; letter-spacing: 1px; word-break: break-all; }
    .fee-badge { display: inline-block; margin-top: 8px; padding: 6px 14px; background: #ecfdf5; color: #047857; font-weight: 800; font-size: 14px; border-radius: 9999px; border: 1px solid #a7f3d0; }
    .notes-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-top: 20px; font-size: 12px; color: #1e40af; white-space: pre-line; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 24px 20px; font-size: 11px; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>İRFAN GENÇ MECLİS 2026</h1>
      <p>Delege Başvurusu ve Katılım Bilgilendirmesi</p>
    </div>
    <div class="content">
      <div class="greeting">Sayın ${applicant.fullName},</div>
      <div class="message">${mainMessage}</div>
      
      <div class="payment-box">
        <div class="payment-title">Katılım Payı ve Banka Hesap Bilgileri</div>
        <div class="pay-row"><span class="pay-label">Banka:</span> <span class="pay-val">${settings.bankName}</span></div>
        <div class="pay-row"><span class="pay-label">Hesap Sahibi:</span> <span class="pay-val">${settings.accountHolder}</span></div>
        <div class="pay-row"><span class="pay-label">Katılım Payı:</span> <span class="fee-badge">${settings.feeAmount}</span></div>
        <div class="pay-row" style="margin-top: 14px;"><span class="pay-label">IBAN:</span></div>
        <div class="iban-badge">${settings.iban}</div>
        <div class="pay-row" style="margin-top: 14px;"><span class="pay-label">Havale Açıklaması:</span> <span class="pay-val" style="color: #2563eb;">${descNote}</span></div>
      </div>

      ${extraNotes ? `<div class="notes-box"><strong>Önemli Hatırlatmalar:</strong><br>${extraNotes}</div>` : ''}

      <p style="margin-top: 26px; font-size: 13px; color: #475569;">
        Ödemeniz hesaba ulaştıktan sonra başvurunuz onaylanacak ve başvuru sırasında oluşturduğunuz şifre ile 
        <strong>irfangenc.org/giris</strong> adresinden portala giriş yapabileceksiniz.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: bold; color: #e2e8f0;">TİMAV &bull; İrfan Genç Meclis Koordinatörlüğü</p>
      <p style="margin: 0;">Bu bilgilendirme e-postası delege başvurunuz doğrultusunda sistem tarafından otomatik oluşturulmuştur.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text alternative
    const textContent = `
Sayın ${applicant.fullName},

${mainMessage}

BANKA VE KATILIM PAYI BİLGİLERİ:
Banka: ${settings.bankName}
Hesap Sahibi: ${settings.accountHolder}
IBAN: ${settings.iban}
Katılım Payı: ${settings.feeAmount}
Açıklama: ${descNote}

${extraNotes ? `ÖNEMLİ NOTLAR:\n${extraNotes}\n` : ''}

TİMAV İrfan Genç Meclis Koordinatörlüğü
    `.trim();

    // Check if SMTP is configured
    const hasSmtp = Boolean(settings.smtpHost && settings.smtpUser && settings.smtpPass);

    if (hasSmtp) {
      const port = Number(settings.smtpPort) || 587;
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: port,
        secure: settings.smtpSecure || port === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass
        }
      });

      const sender = settings.senderName 
        ? `"${settings.senderName}" <${settings.smtpUser}>`
        : settings.smtpUser;

      await transporter.sendMail({
        from: sender,
        to: applicant.email,
        subject: subject,
        text: textContent,
        html: htmlContent
      });

      return NextResponse.json({
        success: true,
        sentDirectly: true,
        message: `${applicant.email} adresine bilgilendirme e-postası başarıyla gönderildi.`,
        sentAt: new Date().toISOString()
      });
    } else {
      // SMTP is not configured yet: return simulated success + ready-to-use mailto fallback link
      const mailtoSubject = encodeURIComponent(subject);
      const mailtoBody = encodeURIComponent(textContent);
      const mailtoUrl = `mailto:${applicant.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

      return NextResponse.json({
        success: true,
        sentDirectly: false,
        requiresSmtpConfig: true,
        message: 'SMTP sunucusu yapılandırılmadığı için e-posta hazırlandı. E-postayı tek tıkla varsayılan e-posta uygulamanızla (Outlook/Gmail) gönderebilir veya SMTP ayarlarını panelden girebilirsiniz.',
        mailtoUrl: mailtoUrl,
        previewText: textContent,
        sentAt: new Date().toISOString()
      });
    }
  } catch (err: any) {
    console.error('Error sending application email:', err);
    return NextResponse.json(
      {
        error: err?.message || 'E-posta gönderimi esnasında bir hata oluştu.',
        details: String(err)
      },
      { status: 500 }
    );
  }
}
