'use client';

import { useState, useEffect } from 'react';

export default function AdminUpdateAnnouncementModal({ isOpen, onClose, onSuccess, announcementId }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && announcementId) {
            fetchAnnouncementDetails(announcementId);
        } else {
            setFormData({ title: '', content: '' });
            setOriginalData({});
            setIsLoading(true);
        }
    }, [isOpen, announcementId]);

    const fetchAnnouncementDetails = async (id) => {
        setIsLoading(true);
        try {
            // TODO: Implement actual API fetch here
            // const response = await GetAnnouncementById(id);

            await new Promise(res => setTimeout(res, 1000)); // Simulate API delay

            // Mock API Response
            const data = {
                title: 'Google Hash Code 2024 Hub Duyurusu',
                content: 'Bu yıl Google Hash Code yarışmasına üniversitemizden katılacak takımlar için özel bir hub oluşturulmuştur. Tüm öğrencileri bekliyoruz.'
            };

            setOriginalData(data);
            setFormData(data);
        } catch (error) {
            console.error('Failed to fetch announcement:', error);
            alert('Duyuru bilgileri yüklenemedi.');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const getChangedFields = () => {
        const changes = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] !== originalData[key]) {
                changes[key] = formData[key];
            }
        });
        return changes;
    };

    const hasChanges = Object.keys(getChangedFields()).length > 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const changedData = getChangedFields();
        if (Object.keys(changedData).length === 0) return;

        setIsSubmitting(true);

        try {
            // TODO: Implement actual API update call here passing `changedData`
            // await UpdateAnnouncement(announcementId, changedData);

            await new Promise(res => setTimeout(res, 800)); // Simulate API delay

            onSuccess({ id: announcementId, ...changedData });
            console.log(changedData);
            onClose();
        } catch (error) {
            alert('Güncellenirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
                onClick={onClose}
            ></div>

            <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col hide-scrollbar">

                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-on-surface hover:text-error hover:bg-error-container/30 transition-colors rounded-lg w-8 h-8 flex items-center justify-center z-20 bg-surface/50 backdrop-blur-md border border-outline-variant/30"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                        <p className="mt-4 font-body-md text-secondary">Veriler getiriliyor...</p>
                    </div>
                ) : (
                    <>
                        <div className="pt-6 pb-4 px-6 md:px-8 border-b border-outline-variant/20 text-center">
                            <h2 className="font-headline-sm text-xl text-on-surface">Duyuruyu Düzenle</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 md:p-8">

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="title">Duyuru Başlığı</label>
                                <input
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Örn: 2026-2027 Güz Dönemi Kayıtları"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="content">Duyuru İçeriği</label>
                                <textarea
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                    id="content"
                                    name="content"
                                    rows="6"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Duyurunun detaylarını buraya yazın..."
                                    required
                                ></textarea>
                            </div>

                            <div className="mt-4 pt-2">
                                <button
                                    disabled={!hasChanges || isSubmitting}
                                    type="submit"
                                    className={`w-full font-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${hasChanges ? 'bg-primary hover:bg-primary-container text-white cursor-pointer' : 'bg-surface-container-high text-secondary cursor-not-allowed'}`}
                                >
                                    {isSubmitting ? (
                                        <span>Güncelleniyor...</span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">save</span>
                                            <span>{hasChanges ? 'Değişiklikleri Kaydet' : 'Değişiklik Yok'}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </>
                )}
            </div>
        </div>
    );
}