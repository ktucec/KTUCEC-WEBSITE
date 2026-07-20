import '../styles/globals.css';
import BackgroundCanvas from '@/components/ui/BackgroundCanvas';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'KTUCEC - Engineering the Future',
  description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü Resmi Web Sitesi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="antialiased relative min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-white">
        
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