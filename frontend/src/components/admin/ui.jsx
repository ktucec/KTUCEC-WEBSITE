'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { avatarColor, initials, norm } from '@/lib/adminFormat';

/* ------------------------------------------------------------------ */
/* Temel                                                               */
/* ------------------------------------------------------------------ */

export function Icon({ name, className = '', fill = false }) {
    return (
        <span
            aria-hidden="true"
            className={`material-symbols-outlined ${fill ? 'ad-ico-fill' : ''} ${className}`}
        >
            {name}
        </span>
    );
}

export function Avatar({ name, src, size = '' }) {
    return (
        <span className={`ad-avatar ${size}`} style={{ '--av': avatarColor(name) }} aria-hidden="true">
            {src ? <img src={src} alt="" /> : initials(name)}
        </span>
    );
}

export function Badge({ tone = '', dot = false, icon, children }) {
    return (
        <span className={`ad-badge ${tone}`}>
            {dot && <span className="dot" />}
            {icon && <Icon name={icon} className="ad-ico-xs" />}
            {children}
        </span>
    );
}

export function Highlight({ text, query }) {
    const value = text == null ? '' : String(text);
    const q = (query || '').trim();
    if (!q) return value;
    const lower = norm(value);
    const ql = norm(q);
    const out = [];
    let i = 0;
    let idx = lower.indexOf(ql, i);
    let guard = 0;
    while (idx !== -1 && guard++ < 50) {
        if (idx > i) out.push(value.slice(i, idx));
        out.push(
            <mark key={idx} className="ad-hl">
                {value.slice(idx, idx + q.length)}
            </mark>
        );
        i = idx + q.length;
        idx = lower.indexOf(ql, i);
    }
    out.push(value.slice(i));
    return out;
}

const URL_RE = /((?:https?:\/\/|www\.)[^\s<>"']+|[\w.+-]+@[\w-]+\.[\w.-]+)/gi;
export function Linkified({ text }) {
    const value = text == null ? '' : String(text);
    const parts = value.split(URL_RE);
    return parts.map((p, i) => {
        if (i % 2 === 0) return p;
        const isMail = p.includes('@') && !/^https?:|^www\./i.test(p);
        const href = isMail ? `mailto:${p}` : p.startsWith('www.') ? `https://${p}` : p;
        return (
            <a key={i} href={href} target={isMail ? undefined : '_blank'} rel="noopener noreferrer">
                {p}
            </a>
        );
    });
}

/* ------------------------------------------------------------------ */
/* Sayfa iskeleti                                                      */
/* ------------------------------------------------------------------ */

export function PageHeader({ title, description, back, actions, children }) {
    return (
        <header className="ad-ph">
            <div className="ad-ph-main">
                {back && (
                    <Link href={back.href} className="ad-crumb">
                        <Icon name="chevron_left" className="ad-ico-sm" />
                        {back.label}
                    </Link>
                )}
                <h1 className="ad-h1">{title}</h1>
                {description && <p className="ad-sub">{description}</p>}
                {children}
            </div>
            {actions && <div className="ad-ph-actions">{actions}</div>}
        </header>
    );
}

export function SearchBox({ value, onChange, placeholder = 'Ara…', label = 'Ara' }) {
    return (
        <div className="ad-search">
            <Icon name="search" />
            <input
                className="ad-input"
                type="search"
                inputMode="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={label}
                autoComplete="off"
            />
            {value && (
                <button type="button" className="ad-ib clear" onClick={() => onChange('')} aria-label="Aramayı temizle">
                    <Icon name="close" className="ad-ico-sm" />
                </button>
            )}
        </div>
    );
}

export function Segmented({ value, onChange, options, label, scroll = false }) {
    return (
        <div className={`ad-seg ${scroll ? 'ad-seg-scroll' : ''}`} role="group" aria-label={label}>
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    aria-pressed={value === o.value}
                    onClick={() => onChange(o.value)}
                    title={o.title}
                >
                    {o.icon && <Icon name={o.icon} className="ad-ico-sm" />}
                    {o.label}
                </button>
            ))}
        </div>
    );
}

export function EmptyState({ icon = 'inbox', title, text, action }) {
    return (
        <div className="ad-empty">
            <div className="ico">
                <Icon name={icon} />
            </div>
            <h3>{title}</h3>
            {text && <p>{text}</p>}
            {action}
        </div>
    );
}

export function ErrorState({ message, onRetry }) {
    return (
        <div className="ad-empty" role="alert">
            <div className="ico" style={{ background: 'var(--ad-danger-soft)', color: 'var(--ad-danger)' }}>
                <Icon name="cloud_off" />
            </div>
            <h3>Bir sorun oluştu</h3>
            <p>{message || 'Veriler yüklenemedi.'}</p>
            {onRetry && (
                <button type="button" className="ad-btn" onClick={onRetry}>
                    <Icon name="refresh" className="ad-ico-sm" />
                    Tekrar dene
                </button>
            )}
        </div>
    );
}

export function Skeleton({ h = 14, w = '100%', r }) {
    return <span className="ad-skel" style={{ display: 'block', height: h, width: w, borderRadius: r }} />;
}

export function SkeletonRows({ rows = 6 }) {
    return (
        <div className="ad-fade-in" aria-busy="true" aria-label="Yükleniyor">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--ad-line)' }}
                >
                    <Skeleton h={36} w={36} r="50%" />
                    <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                        <Skeleton h={13} w={`${50 + ((i * 13) % 35)}%`} />
                        <Skeleton h={11} w={`${25 + ((i * 17) % 30)}%`} />
                    </div>
                    <Skeleton h={28} w={70} r="8px" />
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Çekmece / bottom-sheet                                              */
/* ------------------------------------------------------------------ */

export function Drawer({ open, onClose, title, subtitle, leading, headerActions, footer, children }) {
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);
    const panelRef = useRef(null);
    const lastFocus = useRef(null);

    useEffect(() => {
        if (open) {
            lastFocus.current = document.activeElement;
            setMounted(true);
            const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
            return () => cancelAnimationFrame(id);
        }
        setVisible(false);
        const t = setTimeout(() => setMounted(false), 340);
        return () => clearTimeout(t);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        const f = setTimeout(() => panelRef.current?.focus(), 60);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
            clearTimeout(f);
            lastFocus.current?.focus?.();
        };
    }, [open, onClose]);

    if (!mounted) return null;

    return (
        <div className={`ad-drawer-wrap ${visible ? 'on' : ''}`} role="presentation">
            <div className="scrim" onClick={onClose} />
            <aside
                className="ad-drawer"
                role="dialog"
                aria-modal="true"
                aria-label={typeof title === 'string' ? title : 'Detay'}
                tabIndex={-1}
                ref={panelRef}
            >
                <div className="ad-grab" />
                <div className="ad-drawer-head">
                    {leading}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="ad-item-title ad-trunc">{title}</div>
                        {subtitle && <div className="ad-item-sub ad-trunc">{subtitle}</div>}
                    </div>
                    {headerActions}
                    <button type="button" className="ad-ib bordered" onClick={onClose} aria-label="Kapat">
                        <Icon name="close" />
                    </button>
                </div>
                <div className="ad-drawer-body">{children}</div>
                {footer && <div className="ad-drawer-foot">{footer}</div>}
            </aside>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Toast + Onay diyaloğu (alert / window.confirm yerine)               */
/* ------------------------------------------------------------------ */

const UICtx = createContext(null);

export function AdminUIProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [dlg, setDlg] = useState(null);
    const idRef = useRef(0);

    const push = useCallback((kind, message, ms = 3800) => {
        const id = ++idRef.current;
        setToasts((t) => [...t.slice(-3), { id, kind, message }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
    }, []);

    const toast = useMemo(
        () => ({
            success: (m) => push('ok', m),
            error: (m) => push('error', m, 5200),
            info: (m) => push('info', m),
        }),
        [push]
    );

    const confirm = useCallback(
        (opts) =>
            new Promise((resolve) => {
                setDlg({ ...opts, resolve });
            }),
        []
    );

    const close = (result) => {
        dlg?.resolve(result);
        setDlg(null);
    };

    useEffect(() => {
        if (!dlg) return;
        const onKey = (e) => {
            if (e.key === 'Escape') close(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dlg]);

    const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

    return (
        <UICtx.Provider value={value}>
            {children}

            <div className="ad-toasts" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`ad-toast ${t.kind}`} role="status">
                        <Icon
                            name={t.kind === 'ok' ? 'check_circle' : t.kind === 'error' ? 'error' : 'info'}
                            fill
                        />
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>

            {dlg && (
                <div className="ad-dlg-wrap" onMouseDown={(e) => e.target === e.currentTarget && close(false)}>
                    <div className="ad-dlg" role="alertdialog" aria-modal="true" aria-labelledby="ad-dlg-t">
                        <div className={`ic ${dlg.danger === false ? 'brand' : ''}`}>
                            <Icon name={dlg.icon || (dlg.danger === false ? 'help' : 'delete')} />
                        </div>
                        <h3 id="ad-dlg-t">{dlg.title || 'Emin misiniz?'}</h3>
                        {dlg.message && <p>{dlg.message}</p>}
                        <div className="ad-dlg-actions">
                            <button type="button" className="ad-btn" autoFocus onClick={() => close(false)}>
                                {dlg.cancelText || 'Vazgeç'}
                            </button>
                            <button
                                type="button"
                                className={`ad-btn ${dlg.danger === false ? 'ad-btn-primary' : 'ad-btn-danger'}`}
                                onClick={() => close(true)}
                            >
                                {dlg.confirmText || 'Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UICtx.Provider>
    );
}

const noop = () => {};
export function useToast() {
    return useContext(UICtx)?.toast || { success: noop, error: noop, info: noop };
}
export function useConfirm() {
    return useContext(UICtx)?.confirm || (async () => window.confirm('Emin misiniz?'));
}
