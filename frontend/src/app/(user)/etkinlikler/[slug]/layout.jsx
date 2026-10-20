import { SITE_URL, absoluteUrl, fetchPublic } from '@/lib/site';

// Sayfa istemci bileşeni olduğu için başlık/açıklama/canonical burada, sunucuda üretilir.
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const path = `/etkinlikler/${slug}`;
    const event = await fetchPublic(`/api/events/slug/${encodeURIComponent(slug)}`, 600);

    if (!event) {
        return { title: 'Etkinlik', alternates: { canonical: path } };
    }

    const description =
        (event.summary || event.description || '').replace(/\s+/g, ' ').trim().slice(0, 160) ||
        `${event.title} - KTÜCEC etkinliği`;
    const image = absoluteUrl(event.imageUrl);

    return {
        title: { absolute: `${event.title} | KTÜCEC` },
        description,
        alternates: { canonical: path },
        openGraph: {
            type: 'article',
            title: `${event.title} | KTÜCEC`,
            description,
            url: `${SITE_URL}${path}`,
            ...(image ? { images: [{ url: image, alt: event.title }] } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title: `${event.title} | KTÜCEC`,
            description,
            ...(image ? { images: [image] } : {}),
        },
    };
}

export default function Layout({ children }) {
    return children;
}
