'use client';

import { useState, useEffect } from 'react';
import AddManagerModal from '@/components/ui/AdminAddManagerModal';
import { getAllManagers, deleteManager } from '@/services/auth';

const getRoleName = (roleId) => {
    switch (roleId) {
        case 1: return 'President';
        case 2: return 'Vice President';
        case 3: return 'Board Member';
        default: return 'Yönetim Üyesi';
    }
};

export default function ManagersManagementPage() {
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const fetchItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getAllManagers();
                if (!isCancelled) {
                    const data = response?.data || response || [];
                    setManagers(data);
                }
            } catch (err) {
                if (!isCancelled) setError('Yöneticiler yüklenirken bir hata oluştu.');
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchItems();

        return () => { isCancelled = true; };
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Bu yöneticiyi silmek istediğinize emin misiniz?');
        if (!confirmed) return;

        try {
            await deleteManager(id);
            setManagers((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            alert(err.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
        }
    };

    const handleAddSuccess = (newManager) => {
        setManagers(prev => [...prev, newManager]);
    };

    return (
        <main className="flex-1 overflow-y-auto bg-surface md:p-4">
            <div className="max-w-5xl mx-auto">

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline-md text-3xl text-on-surface">Yöneticiler Yönetimi</h1>
                        <p className="font-body-md text-on-surface-variant mt-2">
                            Admin paneline erişim yetkisi olan yönetici hesaplarını buradan yönetebilirsiniz.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary hover:bg-primary-container cursor-pointer text-white font-label-md py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-sm inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Yeni Yönetici Ekle
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <span className="material-symbols-outlined text-primary text-5xl animate-spin">
                                progress_activity
                            </span>
                        </div>
                    ) : error ? (
                        <div className="bg-error-container/20 border border-error/30 p-6 rounded-xl text-center text-sm text-error font-medium">
                            {error}
                        </div>
                    ) : managers.length === 0 ? (
                        <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl text-center text-sm text-secondary font-medium">
                            Henüz hiç yönetici eklenmemiş.
                        </div>
                    ) : (
                        managers.map((item) => (
                            <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm space-y-4">
                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">
                                        {getRoleName(item.managerRole)}
                                    </span>
                                    <p className="font-body-lg text-on-surface font-semibold mt-1">
                                        {item.nameSurname}
                                    </p>
                                    <p className="font-body-md text-sm text-on-surface-variant mt-0.5">{item.email}</p>
                                </div>
                                <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-4 items-center">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-error hover:text-on-error-container transition-colors bg-error-container/30 hover:bg-error-container/60 px-3 py-2 rounded-md cursor-pointer inline-flex items-center gap-1 font-label-md flex-1 justify-center"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="hidden md:block bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider">Yönetici Adı</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
                                            progress_activity
                                        </span>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-sm text-center text-error font-medium">
                                        {error}
                                    </td>
                                </tr>
                            ) : managers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-sm text-center text-secondary font-medium">
                                        Henüz hiç yönetici eklenmemiş.
                                    </td>
                                </tr>
                            ) : (
                                managers.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-body-lg text-on-surface font-semibold">{item.nameSurname || item.name}</p>
                                            <p className="font-body-md text-sm text-on-surface-variant">{item.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-body-md text-on-surface">
                                            <span className="bg-primary-container/30 text-primary px-3 py-1 rounded-full text-xs font-label-md">
                                                {item.managerRole}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-4 items-center h-full">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-error hover:text-on-error-container transition-colors bg-transparent border-0 p-2 rounded-lg hover:bg-error-container/30 cursor-pointer inline-flex items-center"
                                                title="Sil"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            <AddManagerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

        </main>
    );
}