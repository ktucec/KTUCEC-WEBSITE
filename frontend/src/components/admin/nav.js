// Admin menü tanımı — sidebar, komut paleti ve üst başlık bunu paylaşır.
export const NAV_GROUPS = [
    {
        label: 'Genel',
        items: [{ href: '/admin', label: 'Genel Bakış', icon: 'space_dashboard', exact: true, keywords: 'dashboard pano ana sayfa' }],
    },
    {
        label: 'Başvurular',
        items: [
            { href: '/admin/forms', label: 'Başvuru Formları', icon: 'dynamic_form', keywords: 'forms yanıtlar başvuru' },
            { href: '/admin/contactforms', label: 'İletişim Mesajları', icon: 'mail', keywords: 'contact mesaj iletişim' },
        ],
    },
    {
        label: 'İçerik',
        items: [
            { href: '/admin/announcements', label: 'Duyurular', icon: 'campaign', keywords: 'announcements duyuru' },
            { href: '/admin/events', label: 'Etkinlikler', icon: 'event', keywords: 'events etkinlik' },
        ],
    },
    {
        label: 'Yönetim',
        adminOnly: true,
        items: [{ href: '/admin/managers', label: 'Yöneticiler', icon: 'manage_accounts', keywords: 'managers yönetici' }],
    },
];

export const SETTINGS_ITEM = { href: '/admin/settings', label: 'Hesap Ayarları', icon: 'settings', keywords: 'settings profil şifre' };

export function isActivePath(pathname, item) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
}

export function titleForPath(pathname) {
    if (/^\/admin\/forms\/[^/]+/.test(pathname)) return 'Form Yanıtları';
    const all = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];
    const hit = all.find((i) => isActivePath(pathname, i));
    return hit ? hit.label : 'Yönetim Paneli';
}
