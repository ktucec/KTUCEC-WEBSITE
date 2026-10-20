import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CODEWAVE — KTUCEC',
  description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü tarafından düzenlenen CODEWAVE zirvesi.',
};

// Her edisyon kendi root layout'una (kendi <html>/<body>'sine) sahip, böylece CSS'ler birbirine karışmaz.
// Burası CODEWAVE 2026 sitesi yapılana kadar yer tutucu.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
