import Masthead from '@/editions/2026/components/Masthead';
import Hero from '@/editions/2026/components/Hero';
import About from '@/editions/2026/components/About';
import Destination from '@/editions/2026/components/Destination';
import Speakers from '@/editions/2026/components/Speakers';
import Tickets from '@/editions/2026/components/Tickets';
import Venue from '@/editions/2026/components/Venue';
import Footer from '@/editions/2026/components/Footer';
import StickyTicketBar from '@/editions/2026/components/StickyTicketBar';
import Cursor from '@/editions/2026/components/fx/Cursor';
import Intro from '@/editions/2026/components/fx/Intro';
import RevealObserver from '@/editions/2026/components/fx/RevealObserver';
import SmartAnchors from '@/editions/2026/components/fx/SmartAnchors';
import { CONTACT, EVENT, SPEAKERS, TICKET, startsAtMs } from '@/editions/2026/event';
import { isBackendConfigured } from '@/editions/2026/lib/ktucecApi';
import { isShopierConfigured } from '@/editions/2026/lib/shopier';

// Satış durumu derleme anında ortam değişkenlerinden okunur; Shopier anahtarları ve backend bağlantısı
// (KTUCEC_API_URL / CODEWAVE_INTERNAL_KEY) eklenince yeniden yayınlayın. İkisinden biri eksikse satış kapalı görünür.
const salesOpen = isShopierConfigured() && isBackendConfigured() && Date.now() < startsAtMs();

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: EVENT.name,
    startDate: EVENT.startsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    inLanguage: 'tr',
    url: EVENT.siteUrl,
    image: [`${EVENT.siteUrl}/editions/2026/og.png`],
    description: 'KTÜ Bilgisayar Mühendisliği Kulübü’nün yıllık yazılım zirvesi.',
    location: {
        '@type': 'Place',
        name: EVENT.venue.name,
        address: { '@type': 'PostalAddress', addressLocality: EVENT.venue.city, addressCountry: 'TR' },
    },
    organizer: { '@type': 'Organization', name: 'KTÜCEC', url: 'https://ktucec.com', email: CONTACT.email },
    performer: SPEAKERS.map((s) => ({ '@type': 'Person', name: s.name })),
    offers: {
        '@type': 'Offer',
        url: `${EVENT.siteUrl}/#bilet`,
        price: TICKET.price,
        priceCurrency: TICKET.currency,
        availability: salesOpen ? 'https://schema.org/InStock' : 'https://schema.org/PreSale',
    },
};

export default function Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Intro />
            <Cursor />
            <Masthead salesOpen={salesOpen} />
            <main id="icerik">
                <Hero salesOpen={salesOpen} />
                <Speakers />
                <About />
                <Tickets salesOpen={salesOpen} />
                <Destination />
                <Venue />
            </main>
            <Footer />
            <StickyTicketBar salesOpen={salesOpen} />
            <RevealObserver />
            <SmartAnchors />
        </>
    );
}
