'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/components/layout/AdminProvider';
import { Avatar, Icon } from '@/components/admin/ui';
import { NAV_GROUPS, SETTINGS_ITEM, isActivePath } from '@/components/admin/nav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const ROLE_LABEL = { 1: 'President', 2: 'Vice President', 3: 'Board Member' };

export default function AdminSidebar({ open, onClose, mini, onToggleMini }) {
    const pathname = usePathname();
    const { role, adminName, adminRole, email, profileUrl, isRoleLoading } = useAdmin();
    const isAdmin = role === 2 || role === '2';

    const link = (item) => {
        const active = isActivePath(pathname, item);
        return (
            <Link
                key={item.href}
                href={item.href}
                className="ad-nav-link"
                aria-current={active ? 'page' : undefined}
                title={mini ? item.label : undefined}
                onClick={onClose}
            >
                <Icon name={item.icon} fill={active} />
                <span className="t">{item.label}</span>
            </Link>
        );
    };

    return (
        <aside className={`ad-sb ${open ? 'open' : ''}`} aria-label="Ana menü">
            <div className="ad-sb-head">
                <Link href="/admin" className="ad-logo" aria-label="KTÜCEC Admin" onClick={onClose}>
                    KC
                </Link>
                <div className="ad-brand-txt">
                    <b>KTÜCEC</b>
                    <small>Yönetim Paneli</small>
                </div>
                <button type="button" className="ad-ib ad-mob-only" style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="Menüyü kapat">
                    <Icon name="close" />
                </button>
            </div>

            <nav className="ad-sb-scroll">
                {NAV_GROUPS.filter((g) => !g.adminOnly || isAdmin).map((g, gi) => (
                    <div key={g.label}>
                        {mini && gi > 0 ? <div className="ad-nav-sep" /> : null}
                        <div className="ad-nav-label">{g.label}</div>
                        {g.items.map(link)}
                    </div>
                ))}
            </nav>

            <div className="ad-sb-foot">
                <div className="ad-user">
                    <Avatar
                        name={adminName}
                        src={profileUrl ? `${API_URL}${profileUrl}` : null}
                        size="sm"
                    />
                    <div className="ad-user-txt">
                        <b>{isRoleLoading ? 'Yükleniyor…' : adminName}</b>
                        <small>{ROLE_LABEL[adminRole] || email || 'Yönetici'}</small>
                    </div>
                </div>

                {link(SETTINGS_ITEM)}
                <a href="/" target="_blank" rel="noopener noreferrer" className="ad-nav-link" title={mini ? 'Siteyi görüntüle' : undefined}>
                    <Icon name="open_in_new" />
                    <span className="t">Siteyi Görüntüle</span>
                </a>
                <Link href="/admin/logout" className="ad-nav-link" style={{ color: 'var(--ad-danger)' }} title={mini ? 'Çıkış yap' : undefined}>
                    <Icon name="logout" />
                    <span className="t">Çıkış Yap</span>
                </Link>
                <button
                    type="button"
                    className="ad-nav-link ad-desk-only"
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', width: '100%', font: 'inherit', fontWeight: 600, fontSize: 14.5 }}
                    onClick={onToggleMini}
                    aria-label={mini ? 'Menüyü genişlet' : 'Menüyü daralt'}
                    title={mini ? 'Menüyü genişlet' : undefined}
                >
                    <Icon name={mini ? 'left_panel_open' : 'left_panel_close'} />
                    <span className="t">Menüyü daralt</span>
                </button>
            </div>
        </aside>
    );
}
