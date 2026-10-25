import { NextResponse } from 'next/server';
import { TICKET, startsAtMs } from '@/editions/2026/event';
import { DISCOUNT_CODE_RE, normalizeDiscountCode, quote } from '@/editions/2026/lib/discount';
import { createOrder, getBackendConfig } from '@/editions/2026/lib/ktucecApi';
import { normalizePhone, parseRegistration, validateRegistration, type AttendeeType } from '@/editions/2026/lib/registration';
import { buildPaymentForm, createOrderId, getShopierConfig } from '@/editions/2026/lib/shopier';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status: number) =>
    NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Backend'in indirim koduyla ilgili hata kodları; arayüz bunları olduğu gibi gösterir.
const DISCOUNT_ERRORS = new Set(['discount_invalid', 'discount_used', 'discount_reserved', 'discount_email_mismatch']);

// Bilet formunu doğrular, başvuruyu backend'e kaydeder ve Shopier ödeme sayfasına gönderilecek imzalı alanları döner.
// Tutar her zaman sunucuda event.ts'den hesaplanır; istemciden fiyat kabul edilmez. İndirim kodu varsa
// backend onu bu siparişe ayırır (tek kullanımlık, edu.tr adresine bağlı); ayıramazsa ödeme başlamaz.
export async function POST(request: Request) {
    const config = getShopierConfig();
    const backend = getBackendConfig();
    if (!config || !backend) return json({ error: 'not_configured' }, 503);
    if (Date.now() >= startsAtMs()) return json({ error: 'sales_closed' }, 410);

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'invalid' }, 400);
    }

    const registration = parseRegistration(body);
    const errors = validateRegistration(registration);
    if (Object.keys(errors).length > 0) return json({ error: 'invalid', fields: errors }, 422);

    const code = typeof body.discountCode === 'string' ? normalizeDiscountCode(body.discountCode.slice(0, 32)) : '';
    if (code && !DISCOUNT_CODE_RE.test(code)) return json({ error: 'discount_invalid' }, 409);

    const lang = body.lang === 'EN' ? 'EN' : 'TR';
    const amount = quote(Boolean(code));
    const orderId = createOrderId();

    const created = await createOrder(backend, {
        orderId,
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        phone: normalizePhone(registration.phone) ?? registration.phone,
        city: registration.city,
        attendeeType: registration.attendee as AttendeeType,
        language: lang,
        listPrice: amount.list,
        discountAmount: amount.discount,
        totalPrice: amount.total,
        currency: TICKET.currency,
        discountCode: code || undefined,
    });

    if (!created.ok) {
        if (DISCOUNT_ERRORS.has(created.code)) return json({ error: created.code }, 409);
        if (created.status === 400) return json({ error: 'invalid' }, 422);
        console.error('[codewave] sipariş backend’e kaydedilemedi', { status: created.status, code: created.code });
        return json({ error: 'unavailable' }, 503);
    }

    return json(buildPaymentForm(config, registration, orderId, lang, { ...amount, code: code || undefined }), 200);
}
