import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/instrument-sans/wdth.css';
import '@/styles/globals.css';
import BackgroundCanvas from '@/components/ui/BackgroundCanvas';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FxLayer from '@/components/fx/FxLayer';
import { SITE_URL } from '@/lib/site';

// Sayfa çizilmeden önce temayı uygular; açılışta beyaz/siyah yanıp sönmeyi engeller.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;


export const metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default: 'KTÜCEC | KTÜ Bilgisayar Mühendisliği Kulübü',
        template: '%s | KTÜCEC',
    },

    description:
        'KTÜCEC, Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü resmi web sitesidir. Yazılım, gömülü sistemler, yapay zeka, siber güvenlik ve teknoloji odaklı etkinlikler, projeler ve topluluk için KTÜCEC\'e katılın.',

    keywords: [
        'KTÜCEC',
        'KTU CEC',
        'KTÜ Bilgisayar Mühendisliği Kulübü',
        'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü',
        'Karadeniz Teknik Üniversitesi',
        'KTÜ',
        'KTU',
        'Bilgisayar Mühendisliği Kulübü',
        'Yazılım Kulübü',
        'KTÜ Yazılım Kulübü',
        'Trabzon Bilgisayar Mühendisliği',
        'Trabzon Yazılım Kulübü',
        'KTÜ Bilgisayar Mühendisliği',
        'KTÜ Bilgisayar Mühendisliği Bölümü',
        'Karadeniz Teknik Üniversitesi Mühendislik Fakültesi',
        'KTÜ Mühendislik Fakültesi',
        'Bilgisayar Mühendisliği Öğrenci Kulübü',
        'KTÜ Öğrenci Kulüpleri',
        'Trabzon Üniversite Kulüpleri',
        'Yazılım Geliştirme Topluluğu',
        'Gömülü Sistemler Kulübü',
        'Yapay Zeka Kulübü',
        'Siber Güvenlik Kulübü',
        'Yazılım Etkinlikleri Trabzon',
        'Teknoloji Kulübü Trabzon',
        'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği',
        'KTU Computer Engineering Club',
        'KTU Computer Engineering',
        'Computer Engineering Club Turkey',
        'Trabzon Teknoloji Toplulugu',
        'KTÜ Hackathon',
        'KTÜ Yazılım Etkinlikleri',
        'KTÜ Öğrenci Toplulukları',
        'Bilgisayar Mühendisliği Öğrencileri Trabzon',
        'KTÜCEC Trabzon',
    ],

    authors: [{ name: 'KTÜCEC', url: SITE_URL }],
    creator: 'KTÜCEC',
    publisher: 'KTÜCEC',

    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },

    openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: SITE_URL,
        siteName: 'KTÜCEC',
        title: 'KTÜCEC | KTÜ Bilgisayar Mühendisliği Kulübü',
        description:
            'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü resmi web sitesi. Etkinlikler, projeler ve topluluğumuz hakkında bilgi alın.',
        images: [
            {
                url: '/logo.png',
                width: 512,
                height: 512,
                alt: 'KTÜCEC - KTÜ Bilgisayar Mühendisliği Kulübü Logosu',
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'KTÜCEC | KTÜ Bilgisayar Mühendisliği Kulübü',
        description:
            'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü resmi web sitesi.',
        images: ['/logo.png'],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
};

const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KTÜCEC - KTÜ Bilgisayar Mühendisliği Kulübü',
    alternateName: [
        'KTUCEC',
        'KTÜ Bilgisayar Mühendisliği Kulübü',
        'KTÜ Yazılım Kulübü',
        'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü',
    ],
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
        'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü resmi öğrenci topluluğu.',
    sameAs: [
         'https://www.instagram.com/ktucec',
         'https://www.linkedin.com/company/ktucec',
         'https://twitter.com/ktucec',
    ],
};

// Google'ın sonuçlarda "KTÜCEC" site adını doğru göstermesi için.
const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KTÜCEC',
    alternateName: ['KTUCEC', 'KTÜ Bilgisayar Mühendisliği Kulübü'],
    url: SITE_URL,
    inLanguage: 'tr-TR',
};

export default function RootLayout({ children }) {
    return (
        <html lang="tr" className="site" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                    rel="stylesheet"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />
            </head>
            <body
                className={`antialiased relative min-h-screen flex flex-col overflow-x-hidden selection:bg-primary-container selection:text-white`}
            >
                {/* Arka plandaki ağ animasyonu */}
                <BackgroundCanvas />

                {/* Scroll çubuğu, tıklama kıvılcımları, spot ışığı, sürprizler */}
                <FxLayer />

                {/* Top Navbar */}
                <Navbar />

                {/* Main Content (flex-grow ile tüm boşluğu doldurur) */}
                <main className="flex-grow">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </body>
        </html>
    );
}