'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnnouncementsCount } from '@/services/announcements';
import { getEventsCount } from '@/services/events';
import { getManagersCount } from '@/services/auth';
import { getForms } from '@/services/forms';
import { getContactForms } from '@/services/contact';
import { useAdmin } from '@/components/layout/AdminProvider';
import { Icon, Skeleton } from '@/components/admin/ui';

const parseCount = (res) => {
    if (typeof res === 'number') return res;
    if (typeof res?.data === 'number') return res.data;
    if (res?.data?.count !== undefined) return res.data.count;
    if (res?.count !== undefined) return res.count;
    return 0;
};

const asList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.forms)) return res.data.forms;
    return [];
};

function greeting() {
    const h = new Date().getHours();
    if (h < 6) return 'İyi geceler';
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
}

export default function DashboardPage() {
    const { adminName, role, isRoleLoading } = useAdmin();
    const isAdmin = role === 2 || role === '2';

    const [c, setC] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [ann, ev, adm, forms, msgs] = await Promise.allSettled([
                getAnnouncementsCount(),
                getEventsCount(),
                getManagersCount(),
                getForms(),
                getContactForms(),
            ]);
            if (cancelled) return;
            const val = (r, fn) => (r.status === 'fulfilled' ? fn(r.value) : null);
            const formList = val(forms, asList);
            setC({
                announcements: val(ann, parseCount),
                events: val(ev, parseCount),
                managers: val(adm, parseCount),
                forms: formList ? formList.length : null,
                activeForms: formList ? formList.filter((f) => f.isActive).length : null,
                messages: val(msgs, (r) => asList(r).length),
            });
            setIsLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const tiles = [
        { href: '/admin/forms', icon: 'dynamic_form', label: 'Başvuru formu', v: c?.forms, note: c?.activeForms != null ? `${c.activeForms} tanesi aktif` : null },
        { href: '/admin/contactforms', icon: 'mail', label: 'İletişim mesajı', v: c?.messages },
        { href: '/admin/announcements', icon: 'campaign', label: 'Duyuru', v: c?.announcements },
        { href: '/admin/events', icon: 'event', label: 'Etkinlik', v: c?.events },
        ...(isAdmin ? [{ href: '/admin/managers', icon: 'manage_accounts', label: 'Yönetici', v: c?.managers }] : []),
    ];

    const quick = [
        { href: '/admin/forms', icon: 'table_chart', t: 'Başvuru yanıtlarını incele', d: 'Ara, filtrele, CSV indir' },
        { href: '/admin/announcements', icon: 'campaign', t: 'Duyuru yayınla', d: 'Ana sayfada anında görünür' },
        { href: '/admin/events', icon: 'event', t: 'Etkinlik ekle', d: 'Etkinlik akışını güncelle' },
        { href: '/admin/contactforms', icon: 'mark_email_read', t: 'Mesajları oku', d: 'Gelen iletişim formları' },
    ];

    return (
        <>
            <section className="ad-hero ad-rise">
                <span className="ad-eyebrow">Genel Bakış</span>
                <h1 className="ad-h1" style={{ marginTop: 10 }}>
                    {greeting()}, <span style={{ color: 'var(--ad-brand)' }}>{isRoleLoading ? '…' : adminName.split(' ')[0]}</span>
                </h1>
                <p className="ad-sub">KTÜCEC web sitesi ve kulüp içeriklerinin güncel durumu aşağıda. Kısayol için <span className="ad-kbd">Ctrl K</span> ile her sayfaya hızlıca geçebilirsiniz.</p>
            </section>

            <section className="ad-grid" aria-label="Özet" style={{ marginBottom: 26, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))' }}>
                {tiles.map((t, i) => (
                    <Link key={t.href} href={t.href} className="ad-tile ad-rise" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="ic"><Icon name={t.icon} /></div>
                        <Icon name="arrow_outward" className="go ad-ico" />
                        <div>
                            {isLoading ? <Skeleton h={34} w={60} /> : <div className="v">{t.v ?? '—'}</div>}
                            <div className="l" style={{ marginTop: 6 }}>{t.label}{t.note ? ` · ${t.note}` : ''}</div>
                        </div>
                    </Link>
                ))}
            </section>

            <h2 className="ad-nav-label" style={{ padding: '0 2px 10px' }}>Hızlı işlemler</h2>
            <section className="ad-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
                {quick.map((q) => (
                    <Link key={q.href + q.t} href={q.href} className="ad-qlink">
                        <span className="ic"><Icon name={q.icon} className="ad-ico" /></span>
                        <span>
                            {q.t}
                            <small>{q.d}</small>
                        </span>
                    </Link>
                ))}
            </section>
        </>
    );
}
