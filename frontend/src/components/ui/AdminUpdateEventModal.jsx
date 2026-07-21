'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminUpdateEventModal({ isOpen, onClose, onSuccess, eventId }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({
        imageUrl: '',
        title: '',
        date: '',
        location: '',
        description: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && eventId) {
            fetchEventDetails(eventId);
        } else {
            setFormData({ imageUrl: '', title: '', date: '', location: '', description: '' });
            setOriginalData({});
            setImagePreview(null);
            setIsLoading(true);
        }
    }, [isOpen, eventId]);

    const fetchEventDetails = async (id) => {
        setIsLoading(true);
        try {
            await new Promise(res => setTimeout(res, 1000));

            const data = {
                imageUrl: 'https://via.placeholder.com/800x400.png?text=Event+Image',
                title: 'Yapay Zeka ve Gelecek Zirvesi',
                date: '2026-05-15',
                location: 'Osman Turan Kongre Merkezi',
                description: 'Yapay zeka alanındaki son gelişmelerin konuşulacağı, sektörden uzmanların katılacağı kapsamlı bir zirve.'
            };

            setOriginalData(data);
            setFormData(data);
            setImagePreview(data.imageUrl);
        } catch (error) {
            console.error('Failed to fetch event:', error);
            alert('Etkinlik bilgileri yüklenemedi.');
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImagePreview(null);
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const changedData = getChangedFields();
        if (Object.keys(changedData).length === 0) return;

        setIsSubmitting(true);

        try {
            await new Promise(res => setTimeout(res, 800));

            onSuccess({ id: eventId, ...changedData });
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

            <div className="relative bg-surface-container-lowest w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col hide-scrollbar">

                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-on-surface hover:text-error hover:bg-error-container/30 transition-colors rounded-lg w-8 h-8 flex items-center justify-center z-20 bg-surface/50 backdrop-blur-md border border-outline-variant/30"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                        <p className="mt-4 font-body-md text-secondary">Veriler getiriliyor...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col">

                        <div
                            className={`relative w-full h-56 bg-surface-container flex flex-col items-center justify-center cursor-pointer transition-all ${imagePreview ? '' : 'border-b border-dashed border-outline-variant hover:bg-surface-container-high'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />

                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Etkinlik Önizleme" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-label-md flex items-center gap-2">
                                            <span className="material-symbols-outlined">change_circle</span> Görseli Değiştir
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-4 right-4 bg-error text-white p-1.5 rounded-lg hover:bg-error-container hover:text-on-error-container transition-colors shadow-lg cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-secondary p-6 text-center">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-primary">add_photo_alternate</span>
                                    <p className="font-label-md">Yeni Görsel Yükle</p>
                                    <p className="font-body-md text-xs mt-1 opacity-70">Mevcut görseli kaldırdınız</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-5 p-6 md:p-8">
                            <div className="text-center mb-2">
                                <h2 className="font-headline-sm text-xl text-on-surface">Etkinliği Düzenle</h2>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="title">Etkinlik Başlığı</label>
                                <input
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Örn: Yapay Zeka Zirvesi"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-secondary ml-1" htmlFor="date">Tarih</label>
                                    <input
                                        type="date"
                                        className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-secondary ml-1" htmlFor="location">Yer / Konum</label>
                                    <input
                                        className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Örn: Osman Turan Kongre Merkezi"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="description">Etkinlik Açıklaması</label>
                                <textarea
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                    id="description"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
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
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}