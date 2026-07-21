'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddManagerModal from '@/components/ui/AdminAddManagerModal';


export default function ManagersManagementPage() {
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                // TODO: Gerçek servisi bağladığında burayı aç
                // const data = await GetAllAdmins();

                // Mock Data (Geçici)
                const data = [
                    { id: 1, name: 'Kulüp Başkanı', role: 1 },
                    { id: 2, name: 'Web Master', role: 3 },
                    { id: 3, name: 'Etkinlik Koordinatörü', role: 3 },
                ];

                setManagers(data || []);
            } catch (error) {
                console.error('Veriler çekilirken hata oldu:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Bu yöneticiyi silmek istediğinize emin misiniz?');
        if (!confirmed) return;

        try {
            // TODO: Gerçek servisi bağladığında burayı aç
            // await DeleteAdmin(id);

            setManagers((prev) => prev.filter((item) => item.id !== id));
            alert('Yönetici başarıyla silindi!');
        } catch (error) {
            alert(error.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
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

                {/* Mobile */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={`skeleton-mob-${index}`} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm animate-pulse space-y-4">
                                <div className="h-3 w-20 bg-surface-variant rounded" />
                                <div className="h-5 w-48 bg-surface-variant rounded" />
                            </div>
                        ))
                    ) : managers.length === 0 ? (
                        <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl text-center text-sm text-secondary font-medium">
                            Henüz hiç yönetici eklenmemiş.
                        </div>
                    ) : (
                        managers.map((item) => (
                            <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm space-y-4">
                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Yönetici Adı</span>
                                    <p className="font-body-lg text-on-surface font-semibold mt-1">{item.name}</p>
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

                {/* desktop */}
                <div className="hidden md:block bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider">Yönetici Adı</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={`skeleton-desk-${index}`} className="border-b border-outline-variant/20 animate-pulse">
                                        <td className="px-6 py-5"><div className="h-5 w-64 bg-surface-variant rounded" /></td>
                                        <td className="px-6 py-5 flex justify-end"><div className="h-6 w-6 bg-surface-variant rounded" /></td>
                                    </tr>
                                ))
                            ) : managers.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="px-6 py-10 text-sm text-center text-secondary font-medium">
                                        Henüz hiç yönetici eklenmemiş.
                                    </td>
                                </tr>
                            ) : (
                                managers.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-body-lg text-on-surface font-semibold">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-4 items-center">
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

            {/* Add Pop-up */}
            <AddManagerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

        </main>
    );
}