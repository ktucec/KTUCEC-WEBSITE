'use client';

import { useState, useEffect } from 'react';

export default function AdminAddManagerModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 3 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
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

        try {
            // TODO: Gerçek API bağlantısını buraya yapacaksın
            // await AddAdmin(formData);

            await new Promise(res => setTimeout(res, 800));

            onSuccess({
                id: Date.now(), 
                name: formData.name,
                email: formData.email,
                role: formData.role
            });
            
            setFormData({ name: '', email: '', role: 3 });
            console.log(formData)
            onClose();
        } catch (error) {
            alert('Eklerken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Dark Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
                onClick={onClose}
            ></div>

            {/* Modal Body */}
            <div className="relative bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col">

                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors rounded-lg w-8 h-8 flex items-center justify-center z-20"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {/* Header */}
                <div className="pt-6 pb-4 px-6 md:px-8 border-b border-outline-variant/20 text-center">
                    <h2 className="font-headline-sm text-xl text-on-surface">Yeni Yönetici Ekle</h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 md:p-8">
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
                                className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-full appearance-none"
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
                            className="w-full bg-primary hover:bg-primary-container text-white font-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
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