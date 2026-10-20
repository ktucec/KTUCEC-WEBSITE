import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import '@/editions/2026/styles/globals.css';
import EditionSwitcher from '@/components/shared/EditionSwitcher';

export const metadata: Metadata = {
  title: 'CODEWAVE 2026 — KTUCEC',
  description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü tarafından 8 Aralık 2026’da düzenlenecek CODEWAVE 2026 zirvesi.',
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#050810' };

// Her edisyon kendi root layout'una (kendi <html>/<body>'sine) sahip; böylece CSS'ler birbirine karışmaz.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <EditionSwitcher current="2026" />
        {children}
      </body>
    </html>
  );
}
