import { NextResponse } from 'next/server';
import { completeOrder, getBackendConfig } from '@/editions/2026/lib/ktucecApi';
import { getShopierConfig, signResult, verifyCallback } from '@/editions/2026/lib/shopier';

export const dynamic = 'force-dynamic';

// Shopier panelindeki "geri dönüş URL"si: https://codewave.ktucec.com/api/shopier/callback
// Shopier ödeme sonucunu ziyaretçinin tarayıcısı üzerinden form POST'u olarak gönderir.
export async function POST(request: Request) {
    const config = getShopierConfig();
    const resultUrl = new URL('/bilet/sonuc', request.url);

    if (!config) {
        resultUrl.searchParams.set('durum', 'gecersiz');
        return NextResponse.redirect(resultUrl, 303);
    }

    let body: Record<string, string> = {};
    try {
        const form = await request.formData();
        body = Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));
    } catch {
        // Gövde okunamazsa imza da doğrulanamaz; aşağıda "geçersiz" sonucuna düşer.
    }

    const result = verifyCallback(config, body);
    if (!result) {
        resultUrl.searchParams.set('durum', 'gecersiz');
        return NextResponse.redirect(resultUrl, 303);
    }

    // Yalnızca imzası doğrulanmış sonuç backend'e işlenir: başvuru Paid/Failed olur, indirim kodu
    // başarıda kalıcı olarak kullanılır, başarısızlıkta serbest kalır. Backend'e ulaşılamasa bile ödeme
    // Shopier'de gerçekleşmiştir; ziyaretçiye doğru sonucu göstermeye devam edilir ve hata kaydedilir.
    const backend = getBackendConfig();
    const saved = backend
        ? await completeOrder(backend, result.orderId, { paymentId: result.paymentId, success: result.success })
        : ({ ok: false, status: 0, code: 'not_configured' } as const);
    if (!saved.ok) {
        console.error('[codewave] Shopier sonucu backend’e işlenemedi', {
            orderId: result.orderId,
            success: result.success,
            status: saved.status,
            code: saved.code,
        });
    }

    resultUrl.searchParams.set('durum', result.success ? 'basarili' : 'basarisiz');
    resultUrl.searchParams.set('siparis', result.orderId);
    if (result.paymentId) resultUrl.searchParams.set('odeme', result.paymentId);
    resultUrl.searchParams.set('imza', signResult(config, result));
    return NextResponse.redirect(resultUrl, 303);
}

// Geri dönüş adresi tarayıcıda doğrudan açılırsa ana sayfaya yönlendirilir.
export function GET(request: Request) {
    return NextResponse.redirect(new URL('/', request.url), 303);
}
