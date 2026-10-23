'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAdmin } from '@/components/layout/AdminProvider';
import { Icon } from '@/components/admin/ui';
import { useAdminTheme, setHtml, ThemeButton } from '@/components/admin/theme';
import { NAV_GROUPS, SETTINGS_ITEM, titleForPath } from '@/components/admin/nav';

function CommandPalette({ open, onClose, items }) {
    const [q, setQ] = useState('');
    const [idx, setIdx] = useState(0);
    const inputRef = useRef(null);
    const router = useRouter();

    const filtered = useMemo(() => {
        const s = q.trim().toLocaleLowerCase('tr-TR');
        if (!s) return items;
        return items.filter((i) => `${i.label} ${i.keywords || ''}`.toLocaleLowerCase('tr-TR').includes(s));
    }, [q, items]);

    useEffect(() => {
        if (open) {
            setQ('');
            setIdx(0);
            setTimeout(() => inputRef.current?.focus(), 30);
        }
    }, [open]);
    useEffect(() => setIdx(0), [q]);

    if (!open) return null;

    const run = (item) => {
        onClose();
        if (item.action) item.action();
        else router.push(item.href);
    };

    const onKey = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIdx((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filtered[idx]) {
            e.preventDefault();
            run(filtered[idx]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="ad-cmd-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="ad-cmd" role="dialog" aria-modal="true" aria-label="Hızlı gezinme" onKeyDown={onKey}>
                <div className="ad-cmd-in">
                    <Icon name="search" className="ad-muted" />
                    <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nereye gitmek istersiniz?" aria-label="Sayfa ara" />
                    <span className="ad-kbd">Esc</span>
                </div>
                <div className="ad-cmd-list" role="listbox">
                    {filtered.length === 0 && <div className="ad-empty" style={{ padding: 28 }}><p>Sonuç bulunamadı.</p></div>}
                    {filtered.map((it, i) => (
                        <button
                            key={it.href || it.label}
                            type="button"
                            role="option"
                            aria-selected={i === idx}
                            className="ad-cmd-item"
                            onMouseMove={() => setIdx(i)}
                            onClick={() => run(it)}
                        >
                            <Icon name={it.icon} />
                            {it.label}
                            {it.hint && <small>{it.hint}</small>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminShell({ children }) {
    const pathname = usePathname();
    const { role } = useAdmin();
    const isAdmin = role === 2 || role === '2';

    const [open, setOpen] = useState(false);
    const [mini, setMini] = useState(false);
    const [cmd, setCmd] = useState(false);
    const [theme, toggleTheme] = useAdminTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 70);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMini(document.documentElement.getAttribute('data-sb') === 'mini');
    }, []);

    const toggleMini = () => {
        setMini((m) => {
            const next = !m;
            setHtml('data-sb', next ? 'mini' : 'full');
            try {
                localStorage.setItem('adm-sb', next ? 'mini' : 'full');
            } catch {}
            return next;
        });
    };

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCmd((c) => !c);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const cmdItems = useMemo(() => {
        const nav = NAV_GROUPS.filter((g) => !g.adminOnly || isAdmin).flatMap((g) => g.items.map((i) => ({ ...i, hint: g.label })));
        return [
            ...nav,
            { ...SETTINGS_ITEM, hint: 'Hesap' },
            { label: theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç', icon: theme === 'dark' ? 'light_mode' : 'dark_mode', keywords: 'tema karanlık aydınlık', hint: 'Görünüm', action: toggleTheme, href: 'theme' },
            { href: '/admin/logout', label: 'Çıkış yap', icon: 'logout', keywords: 'logout oturum', hint: 'Hesap' },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, theme]);

    return (
        <div className="ad-shell">
            <a href="#ad-main" className="ad-sr">İçeriğe geç</a>
            <AdminSidebar open={open} onClose={() => setOpen(false)} mini={mini} onToggleMini={toggleMini} />
            <div className={`ad-scrim ${open ? 'on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />

            <div className="ad-body">
                <header className="ad-top">
                    <button type="button" className="ad-ib bordered ad-mob-only" onClick={() => setOpen(true)} aria-label="Menüyü aç" aria-expanded={open}>
                        <Icon name="menu" />
                    </button>
                    <div className="ad-top-title" data-show={scrolled ? '1' : '0'}>{titleForPath(pathname)}</div>
                    <div className="ad-top-spacer" />
                    <button type="button" className="ad-search-trigger" onClick={() => setCmd(true)} aria-label="Hızlı gezinme (Ctrl K)">
                        <Icon name="search" className="ad-ico" />
                        <span>Sayfa ara…</span>
                        <kbd className="ad-kbd">Ctrl K</kbd>
                    </button>
                    <ThemeButton />
                </header>

                <main id="ad-main" className="ad-page">
                    {children}
                </main>
            </div>

            <CommandPalette open={cmd} onClose={() => setCmd(false)} items={cmdItems} />
        </div>
    );
}
