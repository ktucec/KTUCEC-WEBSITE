'use client';

import { useState, useEffect } from 'react';
import { getContactForms, deleteContactForm } from '@/services/contact'; 
import ViewContactMessageModal from '@/components/ui/ViewContactMessageModal';
import { formatDate } from '@/lib/formatDate'; 

export default function ContactFormsManagementPage() {
    const [forms, setForms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getContactForms();

                if (!isCancelled) {
                    const data = response?.data || response || [];
                    setForms(data);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError('Sunucuya bağlanırken hata oluştu');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchItems();

        return () => {
            isCancelled = true;
        };
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Bu mesajı silmek istediğinize emin misiniz?');
        if (!confirmed) return;

        try {
            await deleteContactForm(id);
            setForms((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            alert(error.message || 'Silme işlemi sırasında bir şeyler yanlış gitti.');
        }
    };

    const handleViewMessage = (formItem) => {
        setSelectedForm(formItem);
        setIsModalOpen(true);
    };

    return (
        <main className="flex-1 overflow-y-auto bg-surface md:p-4">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <h1 className="font-headline-md text-3xl text-on-surface">İletişim Formları</h1>
                    <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
                        Kullanıcılar tarafından web sitesi üzerinden gönderilen tüm iletişim mesajlarını buradan görüntüleyebilir ve yönetebilirsiniz.
                    </p>
                </div>

                {/* Mobile View (Grid Cards) */}
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
                            Henüz hiç mesaj gönderilmemiş.
                        </div>
                    ) : (
                        forms.map((item) => (
                            <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm space-y-4">
                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Gönderen</span>
                                    <p className="font-body-lg text-on-surface font-semibold mt-0.5">{item.nameSurname}</p>
                                </div>
                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Konu</span>
                                    <p className="font-body-md text-on-surface-variant mt-0.5">{item.subject}</p>
                                </div>
                                <div>
                                    <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider">Tarih</span>
                                    <p className="font-body-md text-on-surface-variant mt-0.5">{formatDate(item.createdAt)}</p>
                                </div>
                                <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-3 items-center">
                                    <button
                                        onClick={() => handleViewMessage(item)}
                                        className="text-primary hover:text-primary-container font-label-md transition-colors inline-flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-md flex-1 justify-center cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">visibility</span>
                                        Detaylar
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

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider w-1/4">Gönderen</th>
                                <th className="px-6 py-4 font-label-md text-secondary uppercase tracking-wider w-1/3">Konu</th>
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
                                        Henüz hiç mesaj gönderilmemiş.
                                    </td>
                                </tr>
                            ) : (
                                forms.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-body-lg text-on-surface font-semibold">
                                            {item.nameSurname}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {item.subject}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant text-sm">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                                            <button
                                                onClick={() => handleViewMessage(item)}
                                                className="text-primary hover:text-primary-container font-medium transition-colors inline-flex items-center p-2 rounded-lg hover:bg-primary/5 cursor-pointer border-none bg-transparent"
                                                title="Görüntüle"
                                            >
                                                <span className="material-symbols-outlined text-xl">visibility</span>
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

            {/* Message View Modal */}
            <ViewContactMessageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contactData={selectedForm}
            />

        </main>
    );
}