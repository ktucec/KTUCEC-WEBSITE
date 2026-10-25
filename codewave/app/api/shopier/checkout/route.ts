import { NextResponse } from 'next/server';
import { startsAtMs } from '@/editions/2026/event';
import { parseRegistration, validateRegistration } from '@/editions/2026/lib/registration';
import { buildPaymentForm, createOrderId, getShopierConfig } from '@/editions/2026/lib/shopier';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status: number) =>
    NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Bilet formunu doğrular ve Shopier ödeme sayfasına gönderilecek imzalı alanları döner.
// Tutar her zaman sunucudaki TICKET.price değeridir; istemciden fiyat kabul edilmez.
export async function POST(request: Request) {
    const config = getShopierConfig();
    if (!config) return json({ error: 'not_configured' }, 503);
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

    const lang = body.lang === 'EN' ? 'EN' : 'TR';
    const orderId = createOrderId();
    return json(buildPaymentForm(config, registration, orderId, lang), 200);
}
