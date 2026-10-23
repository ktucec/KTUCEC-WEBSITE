'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AddManagerModal from '@/components/ui/AdminAddManagerModal';
import { getAllManagers, deleteManager } from '@/services/auth';
import { useAdmin } from '@/components/layout/AdminProvider';
import { norm } from '@/lib/adminFormat';
import DataView from '@/components/admin/DataView';
import { Avatar, Badge, Highlight, Icon, PageHeader, SearchBox, useConfirm, useToast } from '@/components/admin/ui';

const ROLE_NAMES = { 1: 'President', 2: 'Vice President', 3: 'Board Member' };
const roleName = (r) => (typeof r === 'number' || /^\d+$/.test(String(r)) ? ROLE_NAMES[Number(r)] || 'Yönetim Üyesi' : r || 'Yönetim Üyesi');

export default function ManagersManagementPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const { email: myEmail } = useAdmin();

    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllManagers();
            const data = response?.data || response || [];
            setManagers(Array.isArray(data) ? data : []);
        } catch {
            setError('Yöneticiler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const rows = useMemo(() => {
        const q = norm(query.trim());
        if (!q) return managers;
        return managers.filter((m) => norm(`${m.nameSurname || m.name} ${m.email} ${roleName(m.managerRole)}`).includes(q));
    }, [managers, query]);

    const isMe = (m) => !!myEmail && norm(m.email) === norm(myEmail);

    const handleDelete = async (m) => {
        const ok = await confirm({
            title: 'Yönetici silinsin mi?',
            message: isMe(m)
                ? 'Kendi hesabınızı siliyorsunuz. Silerseniz panele erişiminizi kaybedebilirsiniz.'
                : `${m.nameSurname || m.name} artık yönetim paneline erişemeyecek.`,
        });
        if (!ok) return;
        try {
            await deleteManager(m.id);
            setManagers((prev) => prev.filter((x) => x.id !== m.id));
            toast.success('Yönetici silindi.');
        } catch (err) {
            toast.error(err?.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
        }
    };

    const nameOf = (m) => m.nameSurname || m.name || '—';

    const columns = [
        {
            key: 'name',
            label: 'Yönetici',
            render: (m) => (
                <div className="ad-row" style={{ gap: 12 }}>
                    <Avatar name={nameOf(m)} />
                    <div style={{ minWidth: 0 }}>
                        <div className="strong ad-row" style={{ gap: 8 }}>
                            <Highlight text={nameOf(m)} query={query} />
                            {isMe(m) && <Badge tone="brand">Sen</Badge>}
                        </div>
                        <div className="ad-muted" style={{ fontSize: 13 }}><Highlight text={m.email} query={query} /></div>
                    </div>
                </div>
            ),
        },
        { key: 'role', label: 'Rol', render: (m) => <Badge tone="info" icon="shield_person">{roleName(m.managerRole)}</Badge> },
    ];

    const renderActions = (m) => (
        <>
            <a className="ad-ib" data-tip="E-posta gönder" aria-label="E-posta gönder" href={`mailto:${m.email}`}>
                <Icon name="mail" className="ad-ico-sm" />
            </a>
            <button type="button" className="ad-ib danger" data-tip="Sil" aria-label="Yöneticiyi sil" onClick={() => handleDelete(m)}>
                <Icon name="delete" className="ad-ico-sm" />
            </button>
        </>
    );

    const renderCard = (m) => (
        <div key={m.id} className="ad-item">
            <div className="ad-item-head">
                <Avatar name={nameOf(m)} />
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ad-item-title ad-row ad-wrap" style={{ gap: 8 }}>
                        <Highlight text={nameOf(m)} query={query} />
                        {isMe(m) && <Badge tone="brand">Sen</Badge>}
                    </div>
                    <div className="ad-item-sub">{m.email}</div>
                </div>
            </div>
            <div className="ad-item-meta"><Badge tone="info" icon="shield_person">{roleName(m.managerRole)}</Badge></div>
            <div className="ad-item-actions">
                <a className="ad-btn" href={`mailto:${m.email}`}>
                    <Icon name="mail" className="ad-ico-sm" />
                    E-posta
                </a>
                <button type="button" className="ad-btn ad-btn-danger" onClick={() => handleDelete(m)}>
                    <Icon name="delete" className="ad-ico-sm" />
                    Sil
                </button>
            </div>
        </div>
    );

    return (
        <>
            <PageHeader
                title="Yöneticiler"
                description="Yönetim paneline erişim yetkisi olan hesapları ekleyin ve kaldırın."
                actions={
                    <button type="button" className="ad-btn ad-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Icon name="person_add" className="ad-ico-sm" />
                        Yeni yönetici
                    </button>
                }
            />

            {(managers.length > 5 || query) && (
                <div className="ad-toolbar">
                    <SearchBox value={query} onChange={setQuery} placeholder="İsim veya e-posta ara…" label="Yöneticilerde ara" />
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
                    managers.length === 0
                        ? { icon: 'manage_accounts', title: 'Henüz yönetici yok', text: 'Panele erişebilecek yeni bir yönetici ekleyin.' }
                        : { icon: 'search_off', title: 'Sonuç bulunamadı', text: 'Aramanıza uyan yönetici yok.' }
                }
            />

            <AddManagerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={(n) => {
                    setManagers((prev) => [...prev, n]);
                    toast.success('Yönetici eklendi.');
                }}
            />
        </>
    );
}
