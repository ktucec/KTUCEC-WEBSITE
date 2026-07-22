'use client';

import { useState, useEffect } from 'react';
import { createManager } from '@/services/auth';
import { ApiError } from '@/lib/api';

export default function AdminAddManagerModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 3
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setFormData({ name: '', email: '', role: 3 });
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'role' ? parseInt(value) : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                nameSurname: formData.name,
                email: formData.email,
                role: 1,
                managerRole: formData.role
            };

            const response = await createManager(payload);

            const newManager = response?.data || {
                id: response?.id || Date.now(),
                name: formData.name,
                email: formData.email,
                role: formData.role
            };

            onSuccess(newManager);
            onClose();
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'Eklerken bir hata oluştu.';
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

            <div className="relative bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col">

                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors rounded-lg w-8 h-8 flex items-center justify-center z-20 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="pt-6 pb-4 px-6 md:px-8 border-b border-outline-variant/20 text-center">
                    <h2 className="font-headline-sm text-xl text-on-surface">Yeni Yönetici Ekle</h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 md:p-8">

                    {error && (
                        <div className="p-3.5 text-sm text-error bg-error-container/20 border border-error/30 rounded-xl font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="font-label-md text-secondary ml-1" htmlFor="name">Ad Soyad</label>
                        <input
                            className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Örn: Barış"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-label-md text-secondary ml-1" htmlFor="email">E-Posta</label>
                        <input
                            className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@ktucec.com"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-label-md text-secondary ml-1" htmlFor="role">Rol / Yetki</label>
                        <div className="relative">
                            <select
                                className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-full appearance-none cursor-pointer"
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value={1}>President (Başkan)</option>
                                <option value={2}>Vice President (Başkan Yardımcısı)</option>
                                <option value={3}>Board Member (Yönetim Kurulu Üyesi)</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                                arrow_drop_down
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 pt-2">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-container text-white font-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <span>Ekleniyor...</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    <span>Yönetici Ekle</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}