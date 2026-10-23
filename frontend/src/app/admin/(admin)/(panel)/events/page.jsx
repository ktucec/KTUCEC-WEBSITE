'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminAddEventModal from '@/components/ui/AdminAddEventModal';
import AdminUpdateEventModal from '@/components/ui/AdminUpdateEventModal';
import { getAllEvents, deleteEvent } from '@/services/events';
import { formatShortDate, norm, parseDate } from '@/lib/adminFormat';
import DataView from '@/components/admin/DataView';
import { Badge, Highlight, Icon, PageHeader, SearchBox, Segmented, useConfirm, useToast } from '@/components/admin/ui';

function isUpcoming(ev) {
    const d = parseDate(ev.date);
    if (!d) return false;
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    return end > Date.now();
}

export default function EventsManagementPage() {
    const toast = useToast();
    const confirm = useConfirm();

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [when, setWhen] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllEvents();
            const data = response?.data || response || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch {
            setError('Sunucuya bağlanırken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const counts = useMemo(() => {
        const up = events.filter(isUpcoming).length;
        return { all: events.length, up, past: events.length - up };
    }, [events]);

    const rows = useMemo(() => {
        const q = norm(query.trim());
        const list = events.filter((e) => {
            if (when === 'up' && !isUpcoming(e)) return false;
            if (when === 'past' && isUpcoming(e)) return false;
            if (!q) return true;
            return norm(`${e.title} ${e.location}`).includes(q);
        });
        const t = (e) => parseDate(e.date)?.getTime() || 0;
        // Yaklaşanlar önce (en yakın tarih), sonra geçmişler (en yeni)
        return [...list].sort((a, b) => {
            const ua = isUpcoming(a);
            const ub = isUpcoming(b);
            if (ua !== ub) return ua ? -1 : 1;
            return ua ? t(a) - t(b) : t(b) - t(a);
        });
    }, [events, query, when]);

    const handleDelete = async (item) => {
        const ok = await confirm({
            title: 'Etkinlik silinsin mi?',
            message: `"${item.title}" etkinliği ve sayfası sitenizden kaldırılacak. Bu işlem geri alınamaz.`,
        });
        if (!ok) return;
        try {
            await deleteEvent(item.id);
            setEvents((prev) => prev.filter((e) => e.id !== item.id));
            toast.success('Etkinlik silindi.');
        } catch (err) {
            toast.error(err?.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
        }
    };

    const openUpdate = (id) => {
        setSelectedEventId(id);
        setIsUpdateModalOpen(true);
    };

    const dateBadge = (e) => (
        <Badge tone={isUpcoming(e) ? 'ok' : ''} dot>
            {isUpcoming(e) ? 'Yaklaşan' : 'Geçmiş'}
        </Badge>
    );

    const columns = [
        {
            key: 'title',
            label: 'Etkinlik',
            render: (e) => (
                <button
                    type="button"
                    onClick={() => openUpdate(e.id)}
                    style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left', display: 'block' }}
                >
                    <div className="strong" style={{ fontSize: 15 }}><Highlight text={e.title} query={query} /></div>
                    {e.location && (
                        <div className="ad-muted ad-row" style={{ fontSize: 13, gap: 4, marginTop: 2 }}>
                            <Icon name="location_on" className="ad-ico-xs" />
                            <Highlight text={e.location} query={query} />
                        </div>
                    )}
                </button>
            ),
        },
        {
            key: 'date',
            label: 'Tarih',
            render: (e) => <span style={{ whiteSpace: 'nowrap' }}>{formatShortDate(e.date) || '—'}</span>,
        },
        { key: 'state', label: 'Durum', render: dateBadge },
    ];

    const renderActions = (e) => (
        <>
            {e.slug && (
                <a className="ad-ib" data-tip="Sayfayı aç" aria-label="Etkinlik sayfasını aç" href={`/etkinlikler/${e.slug}`} target="_blank" rel="noopener noreferrer">
                    <Icon name="open_in_new" className="ad-ico-sm" />
                </a>
            )}
            <button type="button" className="ad-ib" data-tip="Düzenle" aria-label="Etkinliği düzenle" onClick={() => openUpdate(e.id)}>
                <Icon name="edit" className="ad-ico-sm" />
            </button>
            <button type="button" className="ad-ib danger" data-tip="Sil" aria-label="Etkinliği sil" onClick={() => handleDelete(e)}>
                <Icon name="delete" className="ad-ico-sm" />
            </button>
        </>
    );

    const renderCard = (e) => (
        <div key={e.id} className="ad-item">
            <div className="ad-item-head">
                <div className="ad-logo" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ad-brand-soft)', color: 'var(--ad-brand)', boxShadow: 'none' }}>
                    <Icon name="event" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ad-item-title"><Highlight text={e.title} query={query} /></div>
                    <div className="ad-item-sub">{formatShortDate(e.date)}</div>
                </div>
                {dateBadge(e)}
            </div>
            {e.location && (
                <div className="ad-item-meta">
                    <span className="ad-m"><Icon name="location_on" className="ad-ico-xs" />{e.location}</span>
                </div>
            )}
            <div className="ad-item-actions">
                <button type="button" className="ad-btn" onClick={() => openUpdate(e.id)}>
                    <Icon name="edit" className="ad-ico-sm" />
                    Düzenle
                </button>
                <button type="button" className="ad-btn ad-btn-danger" onClick={() => handleDelete(e)}>
                    <Icon name="delete" className="ad-ico-sm" />
                    Sil
                </button>
            </div>
        </div>
    );

    return (
        <>
            <PageHeader
                title="Etkinlikler"
                description="Sitenin etkinlik akışında yer alan kulüp etkinliklerini yönetin. Yaklaşan etkinlikler listenin başında görünür."
                actions={
                    <button type="button" className="ad-btn ad-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Icon name="add" className="ad-ico-sm" />
                        Yeni etkinlik
                    </button>
                }
            />

            {(events.length > 0 || query) && (
                <div className="ad-toolbar">
                    <SearchBox value={query} onChange={setQuery} placeholder="Etkinlik veya konumda ara…" label="Etkinliklerde ara" />
                    <Segmented
                        label="Zaman"
                        scroll
                        value={when}
                        onChange={setWhen}
                        options={[
                            { value: 'all', label: `Tümü (${counts.all})` },
                            { value: 'up', label: `Yaklaşan (${counts.up})` },
                            { value: 'past', label: `Geçmiş (${counts.past})` },
                        ]}
                    />
                </div>
            )}

            <DataView
                columns={columns}
                rows={rows}
                renderCard={renderCard}
                renderActions={renderActions}
                loading={isLoading}
                error={error}
                onRetry={load}
                empty={
                    events.length === 0
                        ? {
                              icon: 'event',
                              title: 'Henüz etkinlik yok',
                              text: 'İlk etkinliğinizi ekleyin; sitenin etkinlik sayfasında görünür.',
                              action: (
                                  <button type="button" className="ad-btn ad-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                      <Icon name="add" className="ad-ico-sm" />
                                      Yeni etkinlik
                                  </button>
                              ),
                          }
                        : { icon: 'search_off', title: 'Sonuç bulunamadı', text: 'Arama veya filtreye uyan etkinlik yok.' }
                }
            />

            <AdminAddEventModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={(n) => {
                    setEvents((prev) => [...prev, n]);
                    toast.success('Etkinlik eklendi.');
                }}
            />
            <AdminUpdateEventModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSuccess={(u) => {
                    setEvents((prev) => prev.map((e) => (e.id === u.id ? { ...e, ...u } : e)));
                    toast.success('Etkinlik güncellendi.');
                }}
                eventId={selectedEventId}
            />
        </>
    );
}
