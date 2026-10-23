// Admin paneline özel biçimlendirme yardımcıları (backend'e dokunmaz)

export function parseDate(value) {
    if (!value) return null;
    const d = new Date(String(value).replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value) {
    const d = parseDate(value);
    if (!d) return '';
    return d.toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatShortDate(value) {
    const d = parseDate(value);
    if (!d) return '';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(value) {
    const d = parseDate(value);
    if (!d) return '';
    const diff = Date.now() - d.getTime();
    if (diff < 0) return formatShortDate(value);
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'az önce';
    if (min < 60) return `${min} dk önce`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} sa önce`;
    const day = Math.floor(hr / 24);
    if (day === 1) return 'dün';
    if (day < 7) return `${day} gün önce`;
    if (day < 30) return `${Math.floor(day / 7)} hf önce`;
    return formatShortDate(value);
}

export function initials(name) {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr-TR');
    return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase('tr-TR');
}

const PALETTE = ['#c8102e', '#1d5fd1', '#12805c', '#a15c07', '#7a3fd0', '#0b8799', '#b8326b', '#4b5563'];
export function avatarColor(seed) {
    const s = String(seed || '');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
}

export function stripHtml(html) {
    return html ? String(html).replace(/<[^>]*>?/gm, '').trim() : '';
}

export function norm(s) {
    return String(s ?? '').toLocaleLowerCase('tr-TR');
}

export function pluralTr(n, one) {
    return `${n.toLocaleString('tr-TR')} ${one}`;
}
