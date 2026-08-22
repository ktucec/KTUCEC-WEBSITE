'use client';

import { useState, useEffect } from 'react';
import { getFormById, updateForm } from '@/services/forms';
import { ApiError } from '@/lib/api';

export default function AdminUpdateFormModal({ isOpen, onClose, onSuccess, formId }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isActive: true
    });

    // Değişiklikleri kıyaslamak için orijinal veriyi burada saklıyoruz
    const [originalData, setOriginalData] = useState({
        title: '',
        description: '',
        isActive: true
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && formId) {
            document.body.style.overflow = 'hidden';
            fetchFormDetails();
        } else {
            document.body.style.overflow = 'unset';
            // Modal kapandığında state'leri temizliyoruz
            setFormData({ title: '', description: '', isActive: true });
            setOriginalData({ title: '', description: '', isActive: true });
            setError(null);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, formId]);

    const fetchFormDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getFormById(formId);
            const form = response?.data || response;

            // Backend'den gelen <br> taglerini textarea için \n'e geri çeviriyoruz
            const descText = form.description ? form.description.replace(/<br\s*\/?>/gi, '\n') : '';

            const initialData = {
                title: form.title || '',
                description: descText,
                isActive: form.isActive !== undefined ? form.isActive : true
            };

            setFormData(initialData);
            setOriginalData(initialData); // Referans noktası
        } catch (err) {
            setError('Form bilgileri alınırken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Herhangi bir alanda değişiklik yapıldı mı kontrolü
    const hasChanges =
        formData.title !== originalData.title ||
        formData.description !== originalData.description ||
        formData.isActive !== originalData.isActive;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Değişiklik yoksa boşuna istek atma
        if (!hasChanges) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {};

            // YALNIZCA DEĞİŞEN ALANLARI PAYLOAD'A EKLİYORUZ
            if (formData.title !== originalData.title) {
                payload.title = formData.title;
            }

            if (formData.description !== originalData.description) {
                // Backend'e yollarken tekrar \n'leri <br>'ye çeviriyoruz
                payload.description = formData.description.replace(/\r?\n/g, '<br>');
            }

            if (formData.isActive !== originalData.isActive) {
                payload.isActive = formData.isActive;
            }

            await updateForm(formId, payload);

            onSuccess();
            onClose();
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : "Güncellenirken bir hata oluştu.";
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

            <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between pt-6 pb-4 px-6 md:px-8 border-b border-outline-variant/20 shrink-0 bg-surface-container-lowest z-20">
                    <h2 className="font-headline-sm text-xl text-on-surface">Formu Güncelle</h2>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors rounded-lg w-8 h-8 flex items-center justify-center bg-surface-container hover:border-error border border-transparent cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 flex-1 bg-surface/30">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-70">
                            <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-2">progress_activity</span>
                            <span className="font-label-md text-sm">Form bilgileri yükleniyor...</span>
                        </div>
                    ) : (
                        <form id="updateFormForm" onSubmit={handleSubmit} className="flex flex-col gap-5">

                            {error && (
                                <div className="p-3.5 text-sm text-error bg-error-container/20 border border-error/30 rounded-xl font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="title">Form Başlığı</label>
                                <input
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="description">Açıklama & Yönerge</label>
                                <textarea
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                    id="description"
                                    name="description"
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            {/* Form Durumu (Aktif / Pasif) */}
                            <label className="flex items-center gap-3 mt-2 cursor-pointer select-none bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 hover:border-primary/50 transition-colors">
                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${formData.isActive ? 'bg-primary border-primary' : 'bg-white border-2 border-outline-variant'}`}>
                                    {formData.isActive && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                                </div>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    className="hidden"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <div className="flex flex-col">
                                    <span className="font-label-md text-on-surface leading-none">Formu Erişime Aç (Aktif)</span>
                                    <span className="font-body-md text-xs text-on-surface-variant mt-1">İşareti kaldırırsanız kullanıcılar bu forma başvuru yapamaz.</span>
                                </div>
                            </label>

                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 md:px-8 md:py-5 border-t border-outline-variant/20 bg-surface-container-lowest shrink-0 z-20">
                    <button
                        form="updateFormForm"
                        disabled={isSubmitting || isLoading || !hasChanges}
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-container text-white font-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                <span>Kaydediliyor...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                <span>{hasChanges ? 'Değişiklikleri Kaydet' : 'Değişiklik Yapılmadı'}</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}