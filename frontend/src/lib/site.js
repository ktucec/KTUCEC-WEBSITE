// Tek yerden site ayarları. Domain değişirse sadece NEXT_PUBLIC_SITE_URL env'i güncellenir.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ktucec.com').replace(/\/+$/, '');
export const SITE_NAME = 'KTÜCEC';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Sunucu tarafında (sitemap, metadata) herkese açık API'den veri çeker.
// API kapalıysa/hata verirse null döner; çağıran taraf sessizce yedeğe düşer.
export async function fetchPublic(path, revalidate = 3600) {
    if (!API_URL) return null;
    try {
        const res = await fetch(`${API_URL}${path}`, {
            next: { revalidate },
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        const body = await res.json();
        if (body?.isSuccess === false) return null;
        return body?.data ?? null;
    } catch {
        return null;
    }
}

// Göreli görsel yollarını mutlak URL'ye çevirir (sitemap ve OG için gerekli).
export function absoluteUrl(url) {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return `${SITE_URL}${url}`;
    return null;
}
