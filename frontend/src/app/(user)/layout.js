import '../styles/globals.css';
import BackgroundCanvas from '@/components/ui/BackgroundCanvas';

export const metadata = {
  title: 'KTUCEC - Engineering the Future',
  description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü Resmi Web Sitesi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="antialiased relative min-h-screen overflow-x-hidden selection:bg-[var(--color-primary-container)] selection:text-white">
        
        {/* Global WebGL Background */}
        <BackgroundCanvas />

        {/* Navbar  */}
        
        {children}

        {/* Footer  */}
        
      </body>
    </html>
  );
}