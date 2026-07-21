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
    title: 'KTUCEC - Engineering the Future',
    description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü Resmi Web Sitesi',
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
                className={`antialiased relative min-h-screen overflow-x-hidden
  selection:bg-primary-container selection:text-white`}
            >
                {/* Global WebGL Background */}
                <BackgroundCanvas />

                {/* Top Navbar */}
                <Navbar />

                {children}

                {/* Footer */}
                <Footer />

            </body>
        </html>
    );
}