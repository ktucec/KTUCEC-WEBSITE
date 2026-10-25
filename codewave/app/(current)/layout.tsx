import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@/editions/2026/styles/globals.css';
import { DiscountProvider } from '@/editions/2026/components/discount/DiscountProvider';
import { LanguageProvider } from '@/editions/2026/components/i18n/LanguageProvider';
import { EVENT } from '@/editions/2026/event';

const description =
    'KTÜ Bilgisayar Mühendisliği Kulübü’nün yazılım zirvesi CODEWAVE 2026: 8 Aralık 2026, 09.00, KTÜ Prof. Dr. Osman Turan Kültür ve Kongre Merkezi, Trabzon. Konuşmacılar ve bilet.';

export const metadata: Metadata = {
    metadataBase: new URL(EVENT.siteUrl),
    title: 'CODEWAVE 2026 — 8 Aralık, Trabzon',
    description,
    alternates: { canonical: '/' },
    // Google arama sonucu ve tarayıcı sekmesi ikonu: kare, 48'in katı (192x192) + klasik .ico.
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '48x48' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: '/',
        siteName: 'CODEWAVE',
        title: 'CODEWAVE 2026 — 8 Aralık, Trabzon',
        description,
        images: [{ url: '/editions/2026/og.png', width: 1200, height: 630, alt: 'CODEWAVE 2026, 8 Aralık 2026, Trabzon' }],
    },
    twitter: { card: 'summary_large_image', title: 'CODEWAVE 2026 — 8 Aralık, Trabzon', description, images: ['/editions/2026/og.png'] },
};

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#050a15' };

// Boyamadan önce çalışır: JS'in var olduğunu ve giriş perdesinin bu oturumda görülüp görülmediğini işaretler.
// Böylece harf harf açılan başlıklar ve perde ilk karede yanıp sönmez.
const preflight = `(function(d){d.classList.add('js');try{if(sessionStorage.getItem('cw26-intro'))d.classList.add('intro-seen')}catch(e){}})(document.documentElement)`;

// Her edisyon kendi root layout'una (kendi <html>/<body>'sine) sahip; böylece CSS'ler birbirine karışmaz.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: preflight }} />
            </head>
            <body>
                <LanguageProvider>
                    <DiscountProvider>{children}</DiscountProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
