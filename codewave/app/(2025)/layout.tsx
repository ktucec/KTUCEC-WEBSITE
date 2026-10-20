import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import '@/editions/2025/styles/globals.css';

import { CodewaveProvider } from '@/editions/2025/components/context/CodewaveContext';
import Navbar from '@/editions/2025/components/layout/Navbar';
import Footer from '@/editions/2025/components/layout/Footer';
import Canvas from '@/editions/2025/components/ui/Canvas';
import Fx from '@/editions/2025/components/ui/Fx';
import EditionSwitcher from '@/components/shared/EditionSwitcher';

export const metadata: Metadata = {
  title: 'CODEWAVE 2025 — KTUCEC',
  description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü tarafından düzenlenen CODEWAVE 2025 zirvesi: konuşmacılar, destekçiler ve unutulmaz anlar.',
  alternates: { canonical: '/2025' },
  icons: {
    icon: '/editions/2025/logo.png',
    shortcut: '/editions/2025/logo.png',
    apple: '/editions/2025/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#030b3c',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="bg-[#030b3c]">
      <body className="antialiased bg-[#030b3c]">
        <CodewaveProvider>
          <EditionSwitcher current="2025" />
          <Fx />
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
