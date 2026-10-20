import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import '@/editions/2025/styles/globals.css';

import { CodewaveProvider } from '@/editions/2025/components/context/CodewaveContext';
import Navbar from '@/editions/2025/components/layout/Navbar';
import Footer from '@/editions/2025/components/layout/Footer';
import Canvas from '@/editions/2025/components/ui/Canvas';

export const metadata: Metadata = {
  title: 'CODEWAVE 2026 — KTUCEC',
  description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü tarafından düzenlenen CODEWAVE 2026 zirvesi.',
  generator: 'v0.app',
  icons: {
    icon: '/editions/2025/logo.png',
    shortcut: '/editions/2025/logo.png',
    apple: '/editions/2025/logo.png',
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