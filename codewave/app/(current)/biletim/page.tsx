import type { Metadata } from 'next';
import Masthead from '@/editions/2026/components/Masthead';
import TicketLookup from '@/editions/2026/components/TicketLookup';
import { isBackendConfigured } from '@/editions/2026/lib/ktucecApi';
import { getPublicProductUrl } from '@/editions/2026/lib/shopierLink';

export const metadata: Metadata = {
    title: 'Biletimi bul — CODEWAVE 2026',
    robots: { index: false, follow: false },
};

// Biletini kaybedenler için: bilet alırken yazılan e-postaya kod gider, doğrulanınca QR biletler gösterilir.
export default function FindMyTicketPage() {
    const salesOpen = getPublicProductUrl() !== null && isBackendConfigured();
    return (
        <>
            <Masthead salesOpen={salesOpen} />
            <main id="icerik">
                <TicketLookup />
            </main>
        </>
    );
}
