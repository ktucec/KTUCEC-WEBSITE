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
        'KTÜ Bilgisayar Mühendisliği Kulübü KTÜCEC\'in resmi sitesi. Trabzon\'da yazılım, gömülü sistemler, yapay zeka ve siber güvenlik etkinlikleri, projeler ve topluluk.',

    applicationName: 'KTÜCEC',
    category: 'education',

    // Google favicon'u: 48'in katı, kare, taranabilir PNG + klasik .ico. Açıkça tanımlıyoruz ki
    // <head> içinde her zaman görünsün (dosya tabanlı ikon çıkarımına güvenmiyoruz).
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '48x48' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },

    keywords: [
        'KTÜCEC',
        'KTÜ Bilgisayar',
        'KTÜ Bilgisayar Kulübü',
        'KTÜ Bilgisayar Mühendisliği Kulübü',
        'ktü bilgisayar mühendisliği',
        'KTU CEC',
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
            'KTÜ Bilgisayar Mühendisliği Kulübü KTÜCEC\'in resmi sitesi. Etkinlikler, projeler ve topluluğumuz hakkında bilgi alın.',
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
        // Görsel kare logo olduğu için büyük kart yerine "summary" kullanılır.
        card: 'summary',
        title: 'KTÜCEC | KTÜ Bilgisayar Mühendisliği Kulübü',
        description:
            'KTÜ Bilgisayar Mühendisliği Kulübü KTÜCEC\'in resmi web sitesi.',
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
    '@id': `${SITE_URL}/#organization`,
    name: 'KTÜCEC',
    legalName: 'KTÜCEC - KTÜ Bilgisayar Mühendisliği Kulübü',
    alternateName: [
        'KTUCEC',
        'KTÜ Bilgisayar',
        'KTÜ Bilgisayar Kulübü',
        'KTÜ Bilgisayar Mühendisliği Kulübü',
        'KTÜ Yazılım Kulübü',
        'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü',
    ],
    url: SITE_URL,
    // Google'ın logo için aradığı alan: kare, en az 112x112, taranabilir görsel.
    logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
    },
    image: `${SITE_URL}/icon-512.png`,
    description:
        'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü resmi öğrenci topluluğu.',
    parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: 'Karadeniz Teknik Üniversitesi',
        alternateName: 'KTÜ',
        url: 'https://www.ktu.edu.tr',
    },
    areaServed: 'Trabzon',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Trabzon',
        addressCountry: 'TR',
    },
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
    '@id': `${SITE_URL}/#website`,
    publisher: { '@id': `${SITE_URL}/#organization` },
    name: 'KTÜCEC',
    alternateName: ['KTUCEC', 'KTÜ Bilgisayar', 'KTÜ Bilgisayar Mühendisliği Kulübü'],
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