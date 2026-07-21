'use client';

import { useState, useEffect } from 'react';
import { addAnnouncement } from '@/services/announcements';
import { ApiError } from '@/lib/api';

export default function AdminAddAnnouncementModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setFormData({ title: '', content: '' });
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await addAnnouncement({
                title: formData.title,
                content: formData.content
            });

            const newAnnouncement = response?.data || {
                id: response?.id || Date.now(),
                title: formData.title,
                content: formData.content
            };

            onSuccess(newAnnouncement);
            onClose();
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : "Eklerken bir hata oluştu.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

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

                <div className="pt-6 pb-4 px-6 md:px-8 border-b border-outline-variant/20 text-center">
                    <h2 className="font-headline-sm text-xl text-on-surface">Yeni Duyuru Oluştur</h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 md:p-8">

                    {/* Hata Mesajı Bandı */}
                    {error && (
                        <div className="p-3.5 text-sm text-error bg-error-container/20 border border-error/30 rounded-xl font-medium">
                            {error}
                        </div>
                    )}

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
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-container text-white font-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    <span>Oluşturuluyor...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">campaign</span>
                                    <span>Duyuruyu Ekle</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}