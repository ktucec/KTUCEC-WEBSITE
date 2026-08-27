'use client';

import { useState, useEffect } from 'react';
import { getForms } from '@/services/forms';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';
import AdminAddFormModal from '@/components/ui/AdminAddFormModal';
import AdminUpdateFormModal from '@/components/ui/AdminUpdateFormModal';

export default function FormsManagementPage() {
    const [forms, setForms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState(null);

    const fetchForms = async (isCancelled = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getForms();

            if (!isCancelled) {
                let list = [];
                if (Array.isArray(response)) {
                    list = response;
                } else if (Array.isArray(response?.data)) {
                    list = response.data;
                } else if (Array.isArray(response?.data?.forms)) {
                    list = response.data.forms;
                } else if (Array.isArray(response?.forms)) {
                    list = response.forms;
                }

                setForms(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (err) {
            if (!isCancelled) {
                setError('Formlar yüklenirken bir hata oluştu.');
            }
        } finally {
            if (!isCancelled) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        let isCancelled = false;
        fetchForms(isCancelled);
        return () => {
            isCancelled = true;
        };
    }, []);

    // Form eklendiğinde VEYA güncellendiğinde tabloyu yenile
    const handleSuccess = () => {
        fetchForms();
    };

    const handleUpdateClick = (id) => {
        setSelectedFormId(id);
        setIsUpdateModalOpen(true);
    };

    // Copy form URL to clipboard
    const handleCopyLink = (id) => {
        const url = `https://www.ktucec.com/basvurular?id=${id}`;
        navigator.clipboard.writeText(url);
    };

    return (
        <main className="flex-1 overflow-y-auto bg-surface md:p-4">
            <div className="max-w-6xl mx-auto">

                {/* Header & Action Button */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-headline-md text-3xl text-on-surface">Başvuru Formları</h1>
                        <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
                            Kulüp etkinlikleri ve organizasyonlar için oluşturulan başvuru formlarını buradan yönetebilir, gelen yanıtları listeleyebilirsiniz.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-glow bg-primary text-white font-label-md px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors shrink-0 self-start sm:self-auto cursor-pointer border-none"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                        <span>Yeni Form Ekle</span>
                    </button>
                </div>

                {/* Mobile View (Cards) */}
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
                    ) : forms.length === 0 ? (
                        <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl text-center text-sm text-secondary font-medium">
                            Henüz kayıtlı başvuru formu bulunmuyor.
                        </div>
                    ) : (
                        forms.map((item) => (
                            <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Form Başlığı</span>
                                        <p className="font-body-lg text-on-surface font-semibold mt-0.5">{item.title}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {item.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>

                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Açıklama</span>
                                    <p className="font-body-md text-on-surface-variant mt-0.5 line-clamp-2">
                                        {item.description ? item.description.replace(/<[^>]*>?/gm, '') : '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Oluşturulma Tarihi</span>
                                    <p className="font-body-md text-on-surface-variant mt-0.5">{formatDate(item.createdAt)}</p>
                                </div>

                                <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-3 items-center">
                                    <button
                                        onClick={() => handleCopyLink(item.id)}
                                        className="text-secondary hover:text-on-surface transition-colors bg-surface-container hover:bg-surface-container-high px-3 py-2 rounded-md cursor-pointer inline-flex items-center gap-1 font-label-md flex-1 justify-center border-none"
                                        title="Linki Kopyala"
                                    >
                                        <span className="material-symbols-outlined text-base">content_copy</span>
                                        Kopyala
                                    </button>
                                    <Link
                                        href={`/admin/forms/${item.id}`}
                                        className="text-primary hover:text-primary-container font-label-md transition-colors inline-flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-md flex-1 justify-center"
                                    >
                                        <span className="material-symbols-outlined text-base">table_chart</span>
                                        Yanıtlar
                                    </Link>
                                    <button
                                        onClick={() => handleUpdateClick(item.id)}
                                        className="text-secondary hover:text-on-surface transition-colors bg-surface-container hover:bg-surface-container-high px-3 py-2 rounded-md cursor-pointer inline-flex items-center gap-1 font-label-md flex-1 justify-center border-none"
                                    >
                                        <span className="material-symbols-outlined text-base">edit</span>
                                        Güncelle
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider w-1/3">Form Başlığı</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
                                            progress_activity
                                        </span>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-sm text-center text-error font-medium">
                                        {error}
                                    </td>
                                </tr>
                            ) : forms.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-sm text-center text-secondary font-medium">
                                        Henüz kayıtlı başvuru formu bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                forms.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-body-lg text-on-surface font-semibold">
                                            <div>
                                                <span>{item.title}</span>
                                                <p className="font-body-md text-xs text-on-surface-variant font-normal line-clamp-1 mt-0.5">
                                                    {item.description ? item.description.replace(/<[^>]*>?/gm, '') : ''}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {item.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant text-sm">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                <button
                                                    onClick={() => handleCopyLink(item.id)}
                                                    className="text-secondary hover:text-on-surface transition-colors bg-transparent border-0 p-2 rounded-lg hover:bg-surface-container cursor-pointer inline-flex items-center"
                                                    title="Linki Kopyala"
                                                >
                                                    <span className="material-symbols-outlined text-xl">content_copy</span>
                                                </button>
                                                <Link
                                                    href={`/admin/forms/${item.id}`}
                                                    className="text-primary hover:text-primary-container font-medium transition-colors inline-flex items-center p-2 rounded-lg hover:bg-primary/5 cursor-pointer"
                                                    title="Yanıtları Görüntüle"
                                                >
                                                    <span className="material-symbols-outlined text-xl">table_chart</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleUpdateClick(item.id)}
                                                    className="text-secondary hover:text-on-surface transition-colors bg-transparent border-0 p-2 rounded-lg hover:bg-surface-container cursor-pointer inline-flex items-center"
                                                    title="Formu Güncelle"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- ADD FORM MODAL --- */}
                <AdminAddFormModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={handleSuccess}
                />

                {/* --- UPDATE FORM MODAL --- */}
                <AdminUpdateFormModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSuccess={handleSuccess}
                    formId={selectedFormId}
                />

            </div>
        </main>
    );
}