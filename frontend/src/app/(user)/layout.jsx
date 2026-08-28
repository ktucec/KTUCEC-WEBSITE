import '@/styles/globals.css';
import BackgroundCanvas from '@/components/ui/BackgroundCanvas';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Inter, Montserrat } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
    display: "swap",
});

export const metadata = {
    metadataBase: new URL('https://www.ktucec.com'),
    title: 'KTUCEC | KTÜ Bilgisayar Mühendisliği Kulübü',
    description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü Resmi Web Sitesi',
    icons: {
        icon: [
            { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
            { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
        ],
        shortcut: '/favicon.png',
        apple: [
            { url: '/favicon.png', sizes: '180x180', type: 'image/png' }
        ],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="tr" className={`${inter.variable} ${montserrat.variable}`}>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                    rel="stylesheet"
                />
            </head>
            <body
                className={`antialiased relative min-h-screen flex flex-col overflow-x-hidden selection:bg-primary-container selection:text-white`}
            >
                {/* Global WebGL Background */}
                <BackgroundCanvas />

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