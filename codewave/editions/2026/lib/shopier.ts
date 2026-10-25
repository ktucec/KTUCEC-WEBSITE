// Shopier "ödeme sayfası" entegrasyonu (api_pay4). YALNIZCA sunucu rotalarından import edilir.
//
// Akış:
//  1. /api/shopier/checkout formu doğrular, tutarı event.ts'den hesaplar (indirim kodu varsa backend'de siparişe
//     ayırır), başvuruyu backend'e "Pending" olarak kaydeder ve imzalı alanları döner.
//  2. Tarayıcı bu alanları Shopier'in ödeme sayfasına POST eder; kart bilgisi yalnızca Shopier'de girilir.
//  3. Shopier, panelde tanımlı "geri dönüş URL"sine (/api/shopier/callback) imzalı sonucu POST eder.
//  4. Geri dönüş rotası imzayı doğrular, sonucu backend'e işler (indirim kodu kullanıldı / serbest) ve ziyaretçiyi
//     kendi imzamızı taşıyan /bilet/sonuc sayfasına yollar.
//
// Not: Shopier'in bu ödeme yönteminde kupon alanı yoktur. İndirim, imzalı tutarın kendisine yansıtılır; tutar
// imzanın parçası olduğu için tarayıcıda değiştirilemez. Kodun tek kullanımlık olmasını backend sağlar.
//
// İmza kuralları (Shopier'in resmi SDK'sı olarak gösterdiği erkineren/shopier ile npm shopier-api aynı):
//  - istek:  base64(HMAC-SHA256(secret, random_nr + platform_order_id + total_order_value + currency))
//  - dönüş:  base64(HMAC-SHA256(secret, random_nr + platform_order_id)), başarıda status = "success"
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { TICKET } from '@/editions/2026/event';
import type { Quote } from './discount';
import { normalizePhone, type AttendeeType, type Registration } from './registration';

export const SHOPIER_PAYMENT_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';

const CURRENCY_CODE: Record<string, string> = { TRY: '0', USD: '1', EUR: '2' };
const PRODUCT_TYPE_DIGITAL = '1'; // indirilebilir / sanal ürün
const MODULE_VERSION = '1.0.4';

type Config = { apiKey: string; apiSecret: string; websiteIndex: string };

// Kimlik bilgileri yoksa satış kapalıdır; hiçbir yerde sahte bir ödeme akışı çalışmaz.
export function getShopierConfig(): Config | null {
    const apiKey = process.env.SHOPIER_API_KEY?.trim();
    const apiSecret = process.env.SHOPIER_API_SECRET?.trim();
    if (!apiKey || !apiSecret) return null;
    const websiteIndex = process.env.SHOPIER_WEBSITE_INDEX?.trim() || '1';
    return { apiKey, apiSecret, websiteIndex: /^[1-5]$/.test(websiteIndex) ? websiteIndex : '1' };
}

export const isShopierConfigured = () => getShopierConfig() !== null;

const hmacBase64 = (secret: string, data: string) => createHmac('sha256', secret).update(data, 'utf8').digest('base64');

function safeEqual(a: string, b: string) {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
}

// Yalnızca harf ve rakam: farklı sistemlerde sorun çıkarmayan, tahmin edilemez bir sipariş numarası.
export function createOrderId() {
    const time = Date.now().toString(36).toUpperCase();
    const rand = Array.from({ length: 5 }, () => '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[randomInt(34)]).join('');
    return `CW26${time}${rand}`;
}

const PRODUCT_LABEL: Record<AttendeeType, string> = {
    student: 'Öğrenci',
    professional: 'Çalışan',
    other: 'Diğer',
};

// amount: discount.ts'teki quote() sonucu; indirim kodu varsa ürün adına yazılır (Shopier panelinde görünür).
export function buildPaymentForm(config: Config, reg: Registration, orderId: string, lang: 'TR' | 'EN', amount: Quote & { code?: string }) {
    const total = amount.total.toFixed(2);
    const currency = CURRENCY_CODE[TICKET.currency] ?? '0';
    const randomNr = String(randomInt(100000, 1000000));
    const phone = normalizePhone(reg.phone) ?? '';
    const attendee = reg.attendee ? PRODUCT_LABEL[reg.attendee] : 'Diğer';

    // Dijital bilet: teslimat adresi yok. Shopier alanları zorunlu tuttuğu için şehir bilgisi
    // hem fatura hem teslimat alanına yazılır; ülke Türkiye kabul edilir. İlk canlı testte doğrulayın.
    const fields: Record<string, string> = {
        API_key: config.apiKey,
        website_index: config.websiteIndex,
        platform_order_id: orderId,
        product_name: amount.code ? `CODEWAVE 2026 Bileti (${attendee}, öğrenci indirimi ${amount.code})` : `CODEWAVE 2026 Bileti (${attendee})`,
        product_type: PRODUCT_TYPE_DIGITAL,
        buyer_name: reg.firstName,
        buyer_surname: reg.lastName,
        buyer_email: reg.email,
        buyer_account_age: '0',
        buyer_id_nr: orderId,
        buyer_phone: phone,
        billing_address: reg.city,
        billing_city: reg.city,
        billing_country: 'Türkiye',
        billing_postcode: '',
        shipping_address: reg.city,
        shipping_city: reg.city,
        shipping_country: 'Türkiye',
        shipping_postcode: '',
        total_order_value: total,
        currency,
        platform: '0',
        is_in_frame: '0',
        current_language: lang === 'EN' ? '1' : '0',
        modul_version: MODULE_VERSION,
        random_nr: randomNr,
    };
    fields.signature = hmacBase64(config.apiSecret, randomNr + orderId + total + currency);

    return { action: SHOPIER_PAYMENT_URL, fields };
}

export type ShopierResult = { orderId: string; paymentId: string; success: boolean };

// Shopier'in geri dönüş POST'unu doğrular. İmza tutmazsa null döner ve hiçbir sonuç gösterilmez.
export function verifyCallback(config: Config, body: Record<string, string>): ShopierResult | null {
    const orderId = body.platform_order_id ?? '';
    const randomNr = body.random_nr ?? '';
    const signature = body.signature ?? '';
    if (!orderId || !randomNr || !signature || !/^CW26[0-9A-Z]{6,24}$/.test(orderId)) return null;

    const expected = hmacBase64(config.apiSecret, randomNr + orderId);
    if (!safeEqual(expected, signature)) return null;

    return {
        orderId,
        paymentId: (body.payment_id ?? '').slice(0, 64),
        success: (body.status ?? '').toLowerCase() === 'success',
    };
}

// Sonuç sayfasına giden bağlantıyı kendi anahtarımızla imzalarız; adres çubuğuna elle yazılan
// "başarılı" bir bağlantı doğrulanamaz ve sayfa bunu açıkça söyler.
const resultPayload = (r: ShopierResult) => `${r.orderId}|${r.paymentId}|${r.success ? 'ok' : 'fail'}`;

export function signResult(config: Config, r: ShopierResult) {
    return createHmac('sha256', config.apiSecret).update(`result:${resultPayload(r)}`).digest('base64url');
}

export function verifyResult(config: Config, r: ShopierResult, token: string) {
    return safeEqual(signResult(config, r), token);
}
