import type { Metadata } from 'next';
import Masthead from '@/editions/2026/components/Masthead';
import TicketPass, { type TicketPassState } from '@/editions/2026/components/TicketPass';
import { getBackendConfig, getPublicTicket, isBackendConfigured } from '@/editions/2026/lib/ktucecApi';
import { getPublicProductUrl } from '@/editions/2026/lib/shopierLink';
import { TICKET_CODE_RE } from '@/editions/2026/lib/ticket';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Bilet — CODEWAVE 2026',
    robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

// QR'daki bağlantı. Herkese açıktır; yalnızca maskeli ad ve durum gösterilir (telefon, e-posta, tutar yok).
// Bilet kodu tahmin edilemeyecek kadar uzundur; kod bilinmeden bilet bulunamaz.
export default async function TicketPage({ params }: Props) {
    const { code: raw } = await params;
    const code = raw.toUpperCase();

    let state: TicketPassState = 'invalid';
    let ticket: { maskedName: string; attendeeType: string; reference: string } | undefined;

    if (TICKET_CODE_RE.test(code)) {
        const config = getBackendConfig();
        if (!config) {
            state = 'unavailable';
        } else {
            const r = await getPublicTicket(config, code);
            if (r.ok) {
                state = r.data.status === 'valid' ? 'valid' : 'refunded';
                ticket = r.data;
            } else if (r.status !== 404) {
                state = 'unavailable';
            }
        }
    }

    const salesOpen = getPublicProductUrl() !== null && isBackendConfigured();

    return (
        <>
            <Masthead salesOpen={salesOpen} />
            <main id="icerik">
                <TicketPass state={state} code={state === 'valid' ? code : undefined} ticket={ticket} />
            </main>
        </>
    );
}
