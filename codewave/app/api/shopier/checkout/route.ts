import { NextResponse } from 'next/server';
import { TICKET, startsAtMs } from '@/editions/2026/event';
import { DISCOUNT_CODE_RE, normalizeDiscountCode, quote } from '@/editions/2026/lib/discount';
import { createApplication, getBackendConfig } from '@/editions/2026/lib/ktucecApi';
import { normalizePhone, parseRegistration, validateRegistration, type AttendeeType } from '@/editions/2026/lib/registration';
import { getPublicProductUrl, isShopierUrl } from '@/editions/2026/lib/shopierLink';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status: number) =>
    NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Backend'in arayüze olduğu gibi iletilen hata kodları (metinleri i18n.ts → serverErrors)
const PASS_THROUGH = new Set(['discount_invalid', 'discount_used', 'discount_email_mismatch', 'busy', 'shopier_failed', 'phone_used', 'email_used']);

// Bilet formu gönderildi ("ödemeye geç"):
//  1. Form doğrulanır, tutar sunucuda event.ts'den hesaplanır (tarayıcıdan fiyat kabul edilmez).
//  2. Başvuru backend'e "Waiting" olarak kaydedilir.
//  3. İndirimsiz: herkese açık Shopier bilet ürününe yönlendirilir.
//     İndirimli: backend öğrenciye özel, indirimli fiyatlı, tek stoklu Shopier ürününü döner; oraya yönlendirilir.
//     Ürün tek stoklu olduğu için indirim en fazla bir kez satın alınabilir.
export async function POST(request: Request) {
    const backend = getBackendConfig();
    const publicUrl = getPublicProductUrl();
    if (!backend || !publicUrl) return json({ error: 'not_configured' }, 503);
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

    const amount = quote(Boolean(code));
    const created = await createApplication(backend, {
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        phone: normalizePhone(registration.phone) ?? registration.phone,
        city: registration.city,
        attendeeType: registration.attendee as AttendeeType,
        language: body.lang === 'EN' ? 'EN' : 'TR',
        listPrice: amount.list,
        discountAmount: amount.discount,
        totalPrice: amount.total,
        currency: TICKET.currency,
        discountCode: code || undefined,
    });

    if (!created.ok) {
        if (PASS_THROUGH.has(created.code)) return json({ error: created.code }, 409);
        if (created.status === 400) return json({ error: 'invalid' }, 422);
        console.error('[codewave] başvuru backend’e kaydedilemedi', { status: created.status, code: created.code });
        return json({ error: 'unavailable' }, 503);
    }

    // İndirimli bilette backend'in döndürdüğü bağlantı da yalnızca shopier.com ise kabul edilir.
    const redirectUrl = code ? created.data.redirectUrl : publicUrl;
    if (!isShopierUrl(redirectUrl)) {
        console.error('[codewave] geçersiz Shopier bağlantısı', { discounted: Boolean(code) });
        return json({ error: 'shopier_failed' }, 502);
    }

    return json({ redirectUrl }, 200);
}
