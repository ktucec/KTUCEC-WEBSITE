'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getContactForms, deleteContactForm } from '@/services/contact';
import ViewContactMessageModal from '@/components/ui/ViewContactMessageModal';
import { formatShortDate, norm, timeAgo } from '@/lib/adminFormat';
import DataView from '@/components/admin/DataView';
import { Avatar, Highlight, Icon, PageHeader, SearchBox, useConfirm, useToast } from '@/components/admin/ui';

export default function ContactFormsManagementPage() {
    const toast = useToast();
    const confirm = useConfirm();

    const [forms, setForms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [selectedForm, setSelectedForm] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getContactForms();
            const data = response?.data || response || [];
            setForms(Array.isArray(data) ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
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
        if (!q) return forms;
        return forms.filter((f) => norm(`${f.nameSurname} ${f.email} ${f.subject} ${f.message}`).includes(q));
    }, [forms, query]);

    const handleDelete = async (item) => {
        const ok = await confirm({
            title: 'Mesaj silinsin mi?',
            message: `${item.nameSurname} kişisinin "${item.subject}" konulu mesajı kalıcı olarak silinecek.`,
        });
        if (!ok) return;
        try {
            await deleteContactForm(item.id);
            setForms((prev) => prev.filter((f) => f.id !== item.id));
            if (selectedForm?.id === item.id) setSelectedForm(null);
            toast.success('Mesaj silindi.');
        } catch (err) {
            toast.error(err?.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
        }
    };

    const columns = [
        {
            key: 'from',
            label: 'Gönderen',
            render: (f) => (
                <button
                    type="button"
                    onClick={() => setSelectedForm(f)}
                    className="ad-row"
                    style={{ gap: 12, border: 0, background: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                >
                    <Avatar name={f.nameSurname} size="sm" />
                    <span style={{ minWidth: 0 }}>
                        <span className="strong" style={{ display: 'block' }}><Highlight text={f.nameSurname} query={query} /></span>
                        {f.email && <span className="ad-muted" style={{ display: 'block', fontSize: 12.5 }}><Highlight text={f.email} query={query} /></span>}
                    </span>
                </button>
            ),
        },
        {
            key: 'subject',
            label: 'Konu',
            render: (f) => (
                <div style={{ maxWidth: 460 }}>
                    <div className="strong ad-trunc"><Highlight text={f.subject} query={query} /></div>
                    <div className="ad-clamp2 ad-muted" style={{ fontSize: 13 }}><Highlight text={f.message} query={query} /></div>
                </div>
            ),
        },
        {
            key: 'date',
            label: 'Tarih',
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
            <button type="button" className="ad-ib" data-tip="Mesajı oku" aria-label="Mesajı oku" onClick={() => setSelectedForm(f)}>
                <Icon name="visibility" className="ad-ico-sm" />
            </button>
            {f.email && (
                <a className="ad-ib" data-tip="Yanıtla" aria-label="E-posta ile yanıtla" href={`mailto:${f.email}?subject=${encodeURIComponent('Re: ' + (f.subject || ''))}`}>
                    <Icon name="reply" className="ad-ico-sm" />
                </a>
            )}
            <button type="button" className="ad-ib danger" data-tip="Sil" aria-label="Mesajı sil" onClick={() => handleDelete(f)}>
                <Icon name="delete" className="ad-ico-sm" />
            </button>
        </>
    );

    const renderCard = (f) => (
        <div key={f.id} className="ad-item">
            <button
                type="button"
                className="ad-item-head"
                style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', width: '100%' }}
                onClick={() => setSelectedForm(f)}
            >
                <Avatar name={f.nameSurname} />
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ad-item-title"><Highlight text={f.nameSurname} query={query} /></div>
                    <div className="ad-item-sub">{f.email}</div>
                </div>
                <span className="ad-muted" style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{timeAgo(f.createdAt)}</span>
            </button>
            <div>
                <div className="strong" style={{ fontSize: 14, fontWeight: 700 }}><Highlight text={f.subject} query={query} /></div>
                <div className="ad-clamp2 ad-muted" style={{ fontSize: 13.5, marginTop: 2 }}><Highlight text={f.message} query={query} /></div>
            </div>
            <div className="ad-item-actions">
                <button type="button" className="ad-btn" onClick={() => setSelectedForm(f)}>
                    <Icon name="visibility" className="ad-ico-sm" />
                    Oku
                </button>
                <button type="button" className="ad-btn ad-btn-danger" onClick={() => handleDelete(f)}>
                    <Icon name="delete" className="ad-ico-sm" />
                    Sil
                </button>
            </div>
        </div>
    );

    return (
        <>
            <PageHeader
                title="İletişim Mesajları"
                description="Web sitesindeki iletişim formundan gönderilen mesajları okuyun, e-posta ile yanıtlayın veya silin."
            />

            {(forms.length > 0 || query) && (
                <div className="ad-toolbar">
                    <SearchBox value={query} onChange={setQuery} placeholder="Gönderen, konu veya mesajda ara…" label="Mesajlarda ara" />
                    <span className="ad-muted" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }} aria-live="polite">
                        {query ? `${rows.length} / ${forms.length} mesaj` : `${forms.length} mesaj`}
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
                    forms.length === 0
                        ? { icon: 'mark_email_unread', title: 'Henüz mesaj yok', text: 'İletişim formundan gelen mesajlar burada görünecek.' }
                        : { icon: 'search_off', title: 'Sonuç bulunamadı', text: 'Aramanıza uyan mesaj yok.' }
                }
            />

            <ViewContactMessageModal isOpen={!!selectedForm} onClose={() => setSelectedForm(null)} contactData={selectedForm} />
        </>
    );
}
