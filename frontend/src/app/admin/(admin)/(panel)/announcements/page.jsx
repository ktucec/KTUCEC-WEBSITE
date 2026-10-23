'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminAddAnnouncementModal from '@/components/ui/AdminAddAnnouncementModal';
import AdminUpdateAnnouncementModal from '@/components/ui/AdminUpdateAnnouncementModal';
import { getAnnouncements, deleteAnnouncement } from '@/services/announcements';
import { formatShortDate, norm, stripHtml, timeAgo } from '@/lib/adminFormat';
import DataView from '@/components/admin/DataView';
import { Badge, Highlight, Icon, PageHeader, SearchBox, useConfirm, useToast } from '@/components/admin/ui';

export default function AnnouncementsManagementPage() {
    const toast = useToast();
    const confirm = useConfirm();

    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAnnouncements();
            const data = response?.data || response || [];
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch {
            setError('Sunucuya bağlanırken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const rows = useMemo(() => {
        const q = norm(query.trim());
        if (!q) return announcements;
        return announcements.filter((a) => norm(`${a.title} ${stripHtml(a.content)}`).includes(q));
    }, [announcements, query]);

    const handleDelete = async (item) => {
        const ok = await confirm({
            title: 'Duyuru silinsin mi?',
            message: `"${item.title}" duyurusu sitenizden de kaldırılacak. Bu işlem geri alınamaz.`,
        });
        if (!ok) return;
        try {
            await deleteAnnouncement(item.id);
            setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
            toast.success('Duyuru silindi.');
        } catch (err) {
            toast.error(err?.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
        }
    };

    const openUpdate = (id) => {
        setSelectedAnnouncementId(id);
        setIsUpdateModalOpen(true);
    };

    const columns = [
        {
            key: 'title',
            label: 'Duyuru',
            render: (a) => (
                <button
                    type="button"
                    onClick={() => openUpdate(a.id)}
                    style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left', display: 'block' }}
                >
                    <div className="strong" style={{ fontSize: 15 }}><Highlight text={a.title} query={query} /></div>
                    {stripHtml(a.content) && (
                        <div className="ad-clamp2 ad-muted" style={{ fontSize: 13, marginTop: 2, maxWidth: 560 }}>
                            <Highlight text={stripHtml(a.content)} query={query} />
                        </div>
                    )}
                </button>
            ),
        },
        {
            key: 'link',
            label: 'Bağlantı',
            render: (a) =>
                a.link ? (
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="ad-badge info" style={{ textDecoration: 'none' }}>
                        <Icon name="link" className="ad-ico-xs" />
                        Link var
                    </a>
                ) : (
                    <span className="ad-muted">—</span>
                ),
        },
        ...(announcements.some((a) => a.createdAt)
            ? [
                  {
                      key: 'date',
                      label: 'Tarih',
                      render: (a) => (
                          <div style={{ whiteSpace: 'nowrap' }}>
                              <div>{formatShortDate(a.createdAt)}</div>
                              <div className="ad-muted" style={{ fontSize: 12 }}>{timeAgo(a.createdAt)}</div>
                          </div>
                      ),
                  },
              ]
            : []),
    ];

    const renderActions = (a) => (
        <>
            <button type="button" className="ad-ib" data-tip="Düzenle" aria-label="Duyuruyu düzenle" onClick={() => openUpdate(a.id)}>
                <Icon name="edit" className="ad-ico-sm" />
            </button>
            <button type="button" className="ad-ib danger" data-tip="Sil" aria-label="Duyuruyu sil" onClick={() => handleDelete(a)}>
                <Icon name="delete" className="ad-ico-sm" />
            </button>
        </>
    );

    const renderCard = (a) => (
        <div key={a.id} className="ad-item">
            <div className="ad-item-head">
                <div className="ad-logo" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ad-brand-soft)', color: 'var(--ad-brand)', boxShadow: 'none' }}>
                    <Icon name="campaign" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ad-item-title"><Highlight text={a.title} query={query} /></div>
                    {a.createdAt && <div className="ad-item-sub">{formatShortDate(a.createdAt)} · {timeAgo(a.createdAt)}</div>}
                </div>
            </div>
            {stripHtml(a.content) && <div className="ad-clamp2 ad-muted" style={{ fontSize: 13.5 }}>{stripHtml(a.content)}</div>}
            {a.link && (
                <div className="ad-item-meta">
                    <Badge tone="info" icon="link">Bağlantı var</Badge>
                </div>
            )}
            <div className="ad-item-actions">
                <button type="button" className="ad-btn" onClick={() => openUpdate(a.id)}>
                    <Icon name="edit" className="ad-ico-sm" />
                    Düzenle
                </button>
                <button type="button" className="ad-btn ad-btn-danger" onClick={() => handleDelete(a)}>
                    <Icon name="delete" className="ad-ico-sm" />
                    Sil
                </button>
            </div>
        </div>
    );

    return (
        <>
            <PageHeader
                title="Duyurular"
                description="Ana sayfada ve duyurular sayfasında görünen duyuruları ekleyin, düzenleyin veya kaldırın."
                actions={
                    <button type="button" className="ad-btn ad-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Icon name="add" className="ad-ico-sm" />
                        Yeni duyuru
                    </button>
                }
            />

            {(announcements.length > 3 || query) && (
                <div className="ad-toolbar">
                    <SearchBox value={query} onChange={setQuery} placeholder="Duyurularda ara…" label="Duyurularda ara" />
                    <span className="ad-muted" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }} aria-live="polite">
                        {query ? `${rows.length} / ${announcements.length}` : `${announcements.length} duyuru`}
                    </span>
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
                    announcements.length === 0
                        ? {
                              icon: 'campaign',
                              title: 'Henüz duyuru yok',
                              text: 'İlk duyurunuzu ekleyin; sitede anında yayınlanır.',
                              action: (
                                  <button type="button" className="ad-btn ad-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                      <Icon name="add" className="ad-ico-sm" />
                                      Yeni duyuru
                                  </button>
                              ),
                          }
                        : { icon: 'search_off', title: 'Sonuç bulunamadı', text: 'Aramanıza uyan duyuru yok.' }
                }
            />

            <AdminAddAnnouncementModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={(n) => {
                    setAnnouncements((prev) => [n, ...prev]);
                    toast.success('Duyuru eklendi.');
                }}
            />
            <AdminUpdateAnnouncementModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSuccess={(u) => {
                    setAnnouncements((prev) => prev.map((a) => (a.id === u.id ? { ...a, ...u } : a)));
                    toast.success('Duyuru güncellendi.');
                }}
                announcementId={selectedAnnouncementId}
            />
        </>
    );
}
