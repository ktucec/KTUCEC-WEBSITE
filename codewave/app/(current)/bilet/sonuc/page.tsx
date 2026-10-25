import type { Metadata } from 'next';
import Masthead from '@/editions/2026/components/Masthead';
import PaymentResult, { type ResultState } from '@/editions/2026/components/PaymentResult';
import { getShopierConfig, isShopierConfigured, verifyResult } from '@/editions/2026/lib/shopier';

export const metadata: Metadata = {
    title: 'Ödeme sonucu — CODEWAVE 2026',
    robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');

// Shopier dönüşünden sonra gelinen sayfa. Bağlantıdaki sonuç, sunucudaki gizli anahtarla imzalanmıştır;
// imza tutmazsa "başarılı" asla gösterilmez.
export default async function ResultPage({ searchParams }: Props) {
    const params = await searchParams;
    const status = one(params.durum);
    const orderId = one(params.siparis);
    const paymentId = one(params.odeme);
    const token = one(params.imza);
    const config = getShopierConfig();

    let state: ResultState = 'invalid';
    if (config && orderId && token && (status === 'basarili' || status === 'basarisiz')) {
        const success = status === 'basarili';
        if (verifyResult(config, { orderId, paymentId, success }, token)) state = success ? 'success' : 'failed';
    }

    return (
        <>
            <Masthead salesOpen={isShopierConfigured()} />
            <main id="icerik">
                <PaymentResult state={state} orderId={state === 'invalid' ? undefined : orderId} paymentId={state === 'success' ? paymentId : undefined} />
            </main>
        </>
    );
}
