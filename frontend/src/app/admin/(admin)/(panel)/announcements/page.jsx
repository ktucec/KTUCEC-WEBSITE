'use client';

import { useState, useEffect } from 'react';
import AdminAddAnnouncementModal from '@/components/ui/AdminAddAnnouncementModal';
import AdminUpdateAnnouncementModal from '@/components/ui/AdminUpdateAnnouncementModal';

export default function AnnouncementsManagementPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                // TODO: Uncomment when actual service is connected
                // const data = await GetAllAnnouncements();

                // Mock Data (Temporary)
                const data = [
                    { id: 1, title: 'Google Hash Code 2024 Hub Duyurusu' },
                    { id: 2, title: 'Büyük Şirketlerde Staj Arayışı Semineri' },
                    { id: 3, title: 'Python ile Veri Bilimi Atölyesi' },
                ];

                setAnnouncements(data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?');
        if (!confirmed) return;

        try {
            // TODO: Uncomment when actual service is connected
            // await DeleteAnnouncement(id);

            setAnnouncements((prev) => prev.filter((item) => item.id !== id));
            alert('Duyuru başarıyla silindi!');
        } catch (error) {
            alert(error.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
        }
    };

    const handleAddSuccess = (newAnnouncement) => {
        setAnnouncements(prev => [...prev, newAnnouncement]);
    };

    const handleUpdateSuccess = (updatedAnnouncement) => {
        setAnnouncements(prev => prev.map(item => item.id === updatedAnnouncement.id ? { ...item, ...updatedAnnouncement } : item));
    };

    const openUpdateModal = (id) => {
        setSelectedAnnouncementId(id);
        setIsUpdateModalOpen(true);
    };

    return (
        <main className="flex-1 overflow-y-auto bg-surface md:p-4">
            <div className="max-w-5xl mx-auto">

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline-md text-3xl text-on-surface">Duyurular Yönetimi</h1>
                        <p className="font-body-md text-on-surface-variant mt-2">
                            Sitenin ana sayfasında ve duyurular sayfasında listelenen duyuruları buradan yönetebilirsiniz.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary hover:bg-primary-container text-white font-label-md py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-sm inline-flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Yeni Duyuru Ekle
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={`skeleton-mob-${index}`} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm animate-pulse space-y-4">
                                <div className="h-3 w-20 bg-surface-variant rounded" />
                                <div className="h-5 w-48 bg-surface-variant rounded" />
                                <div className="pt-3 border-t border-outline-variant/20 flex gap-4">
                                    <div className="h-8 bg-surface-variant rounded flex-1" />
                                    <div className="h-8 bg-surface-variant rounded flex-1" />
                                </div>
                            </div>
                        ))
                    ) : announcements.length === 0 ? (
                        <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl text-center text-sm text-secondary font-medium">
                            Henüz hiç duyuru eklenmemiş.
                        </div>
                    ) : (
                        announcements.map((item) => (
                            <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm space-y-4">
                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Duyuru Başlığı</span>
                                    <p className="font-body-lg text-on-surface font-semibold mt-1">{item.title}</p>
                                </div>
                                <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-4 items-center">
                                    <button
                                        onClick={() => openUpdateModal(item.id)}
                                        className="text-primary hover:text-primary-container font-label-md transition-colors inline-flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-md flex-1 justify-center cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">edit</span>
                                        Düzenle
                                    </button>
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
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider">Duyuru Başlığı</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={`skeleton-desk-${index}`} className="border-b border-outline-variant/20 animate-pulse">
                                        <td className="px-6 py-5">
                                            <div className="h-5 w-64 bg-surface-variant rounded" />
                                        </td>
                                        <td className="px-6 py-5 flex justify-end gap-6 items-center">
                                            <div className="h-6 w-6 bg-surface-variant rounded" />
                                            <div className="h-6 w-6 bg-surface-variant rounded" />
                                        </td>
                                    </tr>
                                ))
                            ) : announcements.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="px-6 py-10 text-sm text-center text-secondary font-medium">
                                        Henüz hiç duyuru eklenmemiş.
                                    </td>
                                </tr>
                            ) : (
                                announcements.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-body-lg text-on-surface font-semibold">
                                            {item.title}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-4 items-center">
                                            <button
                                                onClick={() => openUpdateModal(item.id)}
                                                className="text-primary hover:text-primary-container font-medium transition-colors inline-flex items-center p-2 rounded-lg hover:bg-primary/5 cursor-pointer border-none bg-transparent"
                                                title="Düzenle"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
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

            <AdminAddAnnouncementModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            <AdminUpdateAnnouncementModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSuccess={handleUpdateSuccess}
                announcementId={selectedAnnouncementId}
            />

        </main>
    );
}