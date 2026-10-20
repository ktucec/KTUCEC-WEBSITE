import { SITE_URL } from '@/lib/site';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // Yönetim paneli ve API indekslenmesin. _next/ kasıtlı olarak engellenmedi:
                // Google sayfayı çizebilmek için CSS/JS dosyalarına erişebilmeli.
                disallow: ['/admin', '/admin/', '/api/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
