export default function manifest() {
    return {
        name: 'KTÜCEC | KTÜ Bilgisayar Mühendisliği Kulübü',
        short_name: 'KTÜCEC',
        description: 'Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü resmi web sitesi.',
        start_url: '/',
        display: 'browser',
        background_color: '#ffffff',
        theme_color: '#d81212',
        lang: 'tr',
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    };
}
