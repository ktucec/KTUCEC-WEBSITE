import { SITE_URL, absoluteUrl, fetchPublic } from '@/lib/site';

// API'den veri çektiği için saatte bir yenilenir; yeni etkinlik/duyuru en geç 1 saatte sitemap'e düşer.
export const revalidate = 3600;

const toDate = (value) => {
    if (!value) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
};

const latest = (dates) => {
    const valid = dates.filter(Boolean);
    return valid.length ? new Date(Math.max(...valid.map((d) => d.getTime()))) : undefined;
};

export default async function sitemap() {
    const [events, announcements] = await Promise.all([
        fetchPublic('/api/events'),
        fetchPublic('/api/announcements'),
    ]);

    const eventList = Array.isArray(events) ? events.filter((e) => e?.slug) : [];
    const announcementList = Array.isArray(announcements) ? announcements : [];

    const lastAnnouncement = latest(announcementList.map((a) => toDate(a.createdAt)));

    // lastModified'ı sadece gerçekten bildiğimiz yerlerde veriyoruz. Her istekte "şimdi" yazmak
    // Google'ın bu alanı güvenilmez sayıp görmezden gelmesine yol açar.
    const staticPages = [
        { url: SITE_URL, lastModified: lastAnnouncement, changeFrequency: 'weekly', priority: 1 },
        { url: `${SITE_URL}/duyurular`, lastModified: lastAnnouncement, changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/etkinlikler`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${SITE_URL}/hakkimizda`, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${SITE_URL}/basvurular`, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${SITE_URL}/iletisim`, changeFrequency: 'yearly', priority: 0.5 },
    ];

    const now = Date.now();
    const eventPages = eventList.map((e) => {
        const date = toDate(e.date);
        const isUpcoming = date ? date.getTime() >= now : false;
        const image = absoluteUrl(e.imageUrl);
        return {
            url: `${SITE_URL}/etkinlikler/${encodeURIComponent(e.slug)}`,
            // Gelecekteki bir tarihi lastmod olarak vermek geçersiz; sadece geçmiş etkinliklerde veriyoruz.
            ...(date && !isUpcoming ? { lastModified: date } : {}),
            // Yaklaşan etkinlik sık değişir, geçmiş etkinlik arşivdir.
            changeFrequency: isUpcoming ? 'weekly' : 'yearly',
            priority: isUpcoming ? 0.8 : 0.6,
            ...(image ? { images: [image] } : {}),
        };
    });

    return [...staticPages, ...eventPages];
}
