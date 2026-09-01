import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import './globals.css';

import { CodewaveProvider } from '@/components/context/CodewaveContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Canvas from '@/components/ui/Canvas';

export const metadata: Metadata = {
  title: 'CODEWAVE 2026 — KTUCEC',
  description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü tarafından düzenlenen CODEWAVE 2026 zirvesi.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="bg-[#030b3c]">
      <body className="antialiased bg-[#030b3c]">
        <CodewaveProvider>
          <div className="site">
            <Canvas />
            <Navbar />
            {children}
            <Footer />
          </div>
        </CodewaveProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}