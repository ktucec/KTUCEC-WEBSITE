// CODEWAVE edisyon listesi — üstteki geçiş çubuğu buradan beslenir.
// Yeni yıl eklerken: eski güncel edisyonun href'ini '/<yıl>' yap, yenisini '/' olarak ekle.
export type EditionId = '2025' | '2026';

export const EDITIONS: { id: EditionId; label: string; href: string; latest?: boolean }[] = [
    { id: '2025', label: '2025', href: '/2025' },
    { id: '2026', label: '2026', href: '/', latest: true },
];
