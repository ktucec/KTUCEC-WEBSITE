import '@/styles/globals.css';

export const dynamic = "force-dynamic";

export const metadata = {
    title: 'Admin Login - KTUCEC',
    description: 'KTUCEC Yönetim paneli güvenli giriş sayfası.',
};

export default function AdminAuthLayout({ children }) {
    return (
        <html lang="tr">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@700;800&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-surface text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-white">
                {children}
            </body>
        </html>
    );
}