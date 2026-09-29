import { PaymentEmailSettings, Application } from './types';

export const DEFAULT_PAYMENT_EMAIL_SETTINGS: PaymentEmailSettings = {
  bankName: 'Kuveyt Türk Katılım Bankası',
  accountHolder: 'TİMAV Vakfı - İrfan Genç Meclis Koordinatörlüğü',
  iban: 'TR12 0020 5000 0012 3456 7890 01',
  feeAmount: '350 TL',
  paymentDescription: '{fullName} - {qrCodeId} - İGM 2026 Katılım Payı',
  emailSubject: 'İrfan Genç Meclis 2026 - Delege Başvurunuz & Katılım Payı Bilgilendirmesi',
  emailHeaderTitle: 'İrfan Genç Meclis 2026 Başvurunuz Alındı!',
  emailMessage: `Değerli {fullName},

İrfan Genç Meclis 2026 delege başvurunuz başarıyla tarafımıza ulaşmıştır.

Başvurunuzun kesinleşmesi ve komisyon kaydınızın onaylanması için lütfen yukarıda belirtilen katılım payını banka hesabımıza açıklama kısmına başvuru kodunuzu ve adınızı yazarak iletiniz.

Ödeme dekontunuz ulaştıktan sonra başvurunuz heyetimizce incelenecek ve onaylandığında başvuru sırasında belirlediğiniz şifreniz ile delege portalına giriş yapıp kişisel QR yaka kartınızı indirebileceksiniz.

Meclisimizde sizinle birlikte olmaktan onur duyacağız.`,
  additionalNotes: `* Ödeme yaptıktan sonra dekontunuzu saklamanız rica olunur.
* Sorularınız için bilgi@irfangenc.org veya iletişim numaramız üzerinden Meclis Sekreteryasına ulaşabilirsiniz.`,
  senderName: 'İrfan Genç Meclisi Koordinatörlüğü',
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  smtpPass: ''
};

export const PAYMENT_SETTINGS_KEY = 'igm_payment_email_settings';

/**
 * Şablondaki {değişkenler} alanlarını adayın gerçek bilgileriyle doldurur
 */
export function renderTemplateString(
  template: string,
  app: Application,
  settings: PaymentEmailSettings
): string {
  if (!template) return '';
  return template
    .replace(/{fullName}/g, app.fullName || '')
    .replace(/{email}/g, app.email || '')
    .replace(/{phone}/g, app.phone || '')
    .replace(/{qrCodeId}/g, app.qrCodeId || '')
    .replace(/{commissionId}/g, app.commissionId || '')
    .replace(/{school}/g, app.school || '')
    .replace(/{department}/g, app.department || '')
    .replace(/{city}/g, app.city || 'Konya')
    .replace(/{iban}/g, settings.iban || '')
    .replace(/{bankName}/g, settings.bankName || '')
    .replace(/{accountHolder}/g, settings.accountHolder || '')
    .replace(/{feeAmount}/g, settings.feeAmount || '')
    .replace(/{fee}/g, settings.feeAmount || '')
    .replace(/{paymentDescription}/g, settings.paymentDescription || '');
}

/**
 * Tarayıcı hafızasından veya sunucudan IBAN & E-Posta ayarlarını çeker
 */
export function getStoredPaymentEmailSettings(): PaymentEmailSettings {
  if (typeof window === 'undefined') return DEFAULT_PAYMENT_EMAIL_SETTINGS;
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PAYMENT_EMAIL_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading payment settings from localStorage:', e);
  }
  return DEFAULT_PAYMENT_EMAIL_SETTINGS;
}

/**
 * Sunucu API'sinden en güncel IBAN & E-posta ayarlarını çeker
 */
export async function fetchServerPaymentEmailSettings(): Promise<PaymentEmailSettings> {
  try {
    const res = await fetch('/api/payment-settings', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const merged = { ...DEFAULT_PAYMENT_EMAIL_SETTINGS, ...data };
        if (typeof window !== 'undefined') {
          localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch server payment settings, falling back to local:', err);
  }
  return getStoredPaymentEmailSettings();
}

/**
 * Ayarları hem yerel hafızaya hem de sunucuya kaydeder
 */
export async function savePaymentEmailSettings(settings: PaymentEmailSettings): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event('igm_payment_settings_updated'));
    }
    const res = await fetch('/api/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save payment settings to server:', err);
    return false;
  }
}
