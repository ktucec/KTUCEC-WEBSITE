import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/instrument-sans/wdth.css';
import '@/styles/globals.css';
import '@/styles/admin.css';
import AdminShell from '@/components/admin/AdminShell';
import { AdminProvider } from '@/components/layout/AdminProvider';
import { AdminUIProvider } from '@/components/admin/ui';

export const metadata = {
    title: 'KTÜCEC Yönetim Paneli',
    description: 'KTÜCEC yönetim paneli',
    robots: { index: false, follow: false },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};

// Boyanmadan önce tema ve menü durumunu uygular (yanıp sönmeyi önler)
const initScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('adm-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t);d.setAttribute('data-sb',localStorage.getItem('adm-sb')==='mini'?'mini':'full')}catch(e){}})();`;

export default function AdminRootLayout({ children }) {
    return (
        <html lang="tr" className="adm" data-theme="light" data-sb="full" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: initScript }} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AdminProvider>
                    <AdminUIProvider>
                        <AdminShell>{children}</AdminShell>
                    </AdminUIProvider>
                </AdminProvider>
            </body>
        </html>
    );
}
