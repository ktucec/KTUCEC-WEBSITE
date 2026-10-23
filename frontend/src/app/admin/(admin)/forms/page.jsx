'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getForms } from '@/services/forms';
import { formatShortDate, norm, stripHtml, timeAgo } from '@/lib/adminFormat';
import AdminAddFormModal from '@/components/ui/AdminAddFormModal';
import AdminUpdateFormModal from '@/components/ui/AdminUpdateFormModal';
import DataView from '@/components/admin/DataView';
import { Badge, Highlight, Icon, PageHeader, SearchBox, Segmented, useToast } from '@/components/admin/ui';

const PUBLIC_FORM_URL = (id) => `https://www.ktucec.com/basvurular?id=${id}`;

export default function FormsManagementPage() {
    const toast = useToast();
    const [forms, setForms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState(null);

    const fetchForms = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getForms();
            let list = [];
            if (Array.isArray(response)) list = response;
            else if (Array.isArray(response?.data)) list = response.data;
            else if (Array.isArray(response?.data?.forms)) list = response.data.forms;
            else if (Array.isArray(response?.forms)) list = response.forms;
            setForms([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err?.message || 'Formlar yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const counts = useMemo(() => {
        const active = forms.filter((f) => f.isActive).length;
        return { all: forms.length, active, passive: forms.length - active };
    }, [forms]);

    const rows = useMemo(() => {
        const q = norm(query.trim());
        return forms.filter((f) => {
            if (status === 'active' && !f.isActive) return false;
            if (status === 'passive' && f.isActive) return false;
            if (!q) return true;
            return norm(`${f.title} ${stripHtml(f.description)}`).includes(q);
        });
    }, [forms, query, status]);

    const copyLink = async (id) => {
        try {
            await navigator.clipboard.writeText(PUBLIC_FORM_URL(id));
            toast.success('Başvuru linki kopyalandı.');
        } catch {
            toast.error('Link kopyalanamadı.');
        }
    };

    const openEdit = (id) => {
        setSelectedFormId(id);
        setIsUpdateModalOpen(true);
    };

    const statusBadge = (f) => (
        <Badge tone={f.isActive ? 'ok' : ''} dot>
            {f.isActive ? 'Aktif' : 'Pasif'}
        </Badge>
    );

    const columns = [
        {
            key: 'title',
            label: 'Form',
            render: (f) => (
                <Link href={`/admin/forms/${f.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', minWidth: 0 }}>
                    <div className="strong" style={{ fontSize: 15 }}>
                        <Highlight text={f.title} query={query} />
                    </div>
                    {stripHtml(f.description) && (
                        <div className="ad-clamp2 ad-muted" style={{ fontSize: 13, marginTop: 2, maxWidth: 520 }}>
                            {stripHtml(f.description)}
                        </div>
                    )}
                </Link>
            ),
        },
        { key: 'status', label: 'Durum', render: statusBadge },
        {
            key: 'date',
            label: 'Oluşturulma',
            render: (f) => (
                <div style={{ whiteSpace: 'nowrap' }}>
                    <div>{formatShortDate(f.createdAt)}</div>
                    <div className="ad-muted" style={{ fontSize: 12 }}>{timeAgo(f.createdAt)}</div>
                </div>
            ),
        },
    ];

    const renderActions = (f) => (
        <>
            <Link href={`/admin/forms/${f.id}`} className="ad-btn ad-btn-sm" style={{ marginRight: 4 }}>
                <Icon name="table_chart" className="ad-ico-sm" />
                Yanıtlar
            </Link>
            <button type="button" className="ad-ib" data-tip="Linki kopyala" aria-label="Başvuru linkini kopyala" onClick={() => copyLink(f.id)}>
                <Icon name="link" className="ad-ico-sm" />
            </button>
            <button type="button" className="ad-ib" data-tip="Düzenle" aria-label="Formu düzenle" onClick={() => openEdit(f.id)}>
                <Icon name="edit" className="ad-ico-sm" />
            </button>
        </>
    );

    const renderCard = (f) => (
        <div key={f.id} className="ad-item">
            <div className="ad-item-head">
                <div className="ad-logo" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ad-brand-soft)', color: 'var(--ad-brand)', boxShadow: 'none' }}>
                    <Icon name="dynamic_form" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ad-item-title"><Highlight text={f.title} query={query} /></div>
                    <div className="ad-item-sub">{formatShortDate(f.createdAt)} · {timeAgo(f.createdAt)}</div>
                </div>
                {statusBadge(f)}
            </div>
            {stripHtml(f.description) && <div className="ad-clamp2 ad-muted" style={{ fontSize: 13.5 }}>{stripHtml(f.description)}</div>}
            <div className="ad-item-actions">
                <Link href={`/admin/forms/${f.id}`} className="ad-btn ad-btn-primary">
                    <Icon name="table_chart" className="ad-ico-sm" />
                    Yanıtlar
                </Link>
                <button type="button" className="ad-btn" style={{ flex: '0 0 auto', width: 46, padding: 0 }} aria-label="Linki kopyala" onClick={() => copyLink(f.id)}>
                    <Icon name="link" className="ad-ico-sm" />
                </button>
                <button type="button" className="ad-btn" style={{ flex: '0 0 auto', width: 46, padding: 0 }} aria-label="Düzenle" onClick={() => openEdit(f.id)}>
                    <Icon name="edit" className="ad-ico-sm" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            <PageHeader
                title="Başvuru Formları"
                description="Etkinlik ve organizasyonlar için oluşturduğunuz formları yönetin, başvuru linkini kopyalayın ve gelen yanıtları inceleyin."
                actions={
                    <button type="button" className="ad-btn ad-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Icon name="add" className="ad-ico-sm" />
                        Yeni form
                    </button>
                }
            />

            {(forms.length > 0 || query) && (
                <div className="ad-toolbar">
                    <SearchBox value={query} onChange={setQuery} placeholder="Formlarda ara…" label="Formlarda ara" />
                    <Segmented
                        label="Durum"
                        scroll
                        value={status}
                        onChange={setStatus}
                        options={[
                            { value: 'all', label: `Tümü (${counts.all})` },
                            { value: 'active', label: `Aktif (${counts.active})` },
                            { value: 'passive', label: `Pasif (${counts.passive})` },
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
                onRetry={fetchForms}
                empty={
                    forms.length === 0
                        ? {
                              icon: 'dynamic_form',
                              title: 'Henüz form yok',
                              text: 'İlk başvuru formunu oluşturarak yanıt toplamaya başlayın.',
                              action: (
                                  <button type="button" className="ad-btn ad-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                      <Icon name="add" className="ad-ico-sm" />
                                      Yeni form
                                  </button>
                              ),
                          }
                        : { icon: 'search_off', title: 'Sonuç bulunamadı', text: 'Arama veya durum filtresine uyan form yok.' }
                }
            />

            <AdminAddFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchForms} />
            <AdminUpdateFormModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onSuccess={fetchForms} formId={selectedFormId} />
        </>
    );
}
