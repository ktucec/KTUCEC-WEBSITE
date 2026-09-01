'use client';

import { useState, useEffect, useRef } from 'react';
import { updateEvent, getEventById } from '@/services/events';
import { ApiError } from '@/lib/api';

export default function AdminUpdateEventModal({ isOpen, onClose, onSuccess, eventId }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isPastEvent, setIsPastEvent] = useState(false);

    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        location: '',
        description: '',
        applicationUrl: '',
        participantCount: '',
        summary: ''
    });

    // Afiş Yönetimi
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Galeri Yönetimi
    const [existingGallery, setExistingGallery] = useState([]);
    const [deletedGalleryIds, setDeletedGalleryIds] = useState([]); // Silinmek üzere işaretlenenler
    const [newGalleryFiles, setNewGalleryFiles] = useState([]); // Yeni eklenecekler
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
    const galleryInputRef = useRef(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        let isCancelled = false;

        if (isOpen && eventId) {
            const fetchDetails = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await getEventById(eventId);
                    if (!isCancelled) {
                        const data = response?.data || response || {};
                        const formattedDate = data.date ? data.date.split('T')[0] : '';

                        // Tarih kontrolü (Bugün veya geçmiş mi?)
                        const eventDateObj = new Date(formattedDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        setIsPastEvent(eventDateObj < today);

                        const fetchedData = {
                            title: data.title || '',
                            date: formattedDate,
                            location: data.location || '',
                            description: data.description || '',
                            applicationUrl: data.applicationUrl || '',
                            participantCount: data.participantCount?.toString() || '',
                            summary: data.summary || ''
                        };

                        setOriginalData(fetchedData);
                        setFormData(fetchedData);
                        setExistingGallery(data.galleryImages || []);
                        setDeletedGalleryIds([]);
                        setNewGalleryFiles([]);
                        setNewGalleryPreviews([]);

                        if (data.imageUrl) {
                            setImagePreview(`${API_URL}${data.imageUrl}`);
                        } else {
                            setImagePreview(null);
                        }
                    }
                } catch (err) {
                    if (!isCancelled) setError('Etkinlik bilgileri yüklenemedi.');
                } finally {
                    if (!isCancelled) setIsLoading(false);
                }
            };
            fetchDetails();
        } else {
            setFormData({ title: '', date: '', location: '', description: '', applicationUrl: '', participantCount: '', summary: '' });
            setOriginalData({});
            setImageFile(null);
            setImagePreview(null);
            setExistingGallery([]);
            setDeletedGalleryIds([]);
            setNewGalleryFiles([]);
            setNewGalleryPreviews([]);
            setIsLoading(true);
        }

        return () => { isCancelled = true; };
    }, [isOpen, eventId]);

    const getChangedFields = () => {
        const changes = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] !== originalData[key]) {
                changes[key] = formData[key];
            }
        });
        return changes;
    };

    const hasChanges = Object.keys(getChangedFields()).length > 0 || imageFile !== null || deletedGalleryIds.length > 0 || newGalleryFiles.length > 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Eğer tarihi değiştiriyorsa isPastEvent durumunu anlık güncelle
        if (name === 'date') {
            const newDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setIsPastEvent(newDate < today);
        }
    };

    // --- Afiş Fonksiyonları ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setError(null);
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Galeri Fonksiyonları ---
    const toggleDeleteExistingGallery = (id) => {
        setDeletedGalleryIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleNewGalleryImages = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewGalleryFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setNewGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
        if (galleryInputRef.current) galleryInputRef.current.value = ''; // Reset
    };

    const removeNewGalleryImage = (index) => {
        setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
        setNewGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!hasChanges) return;

        setIsSubmitting(true);
        try {
            const changedData = getChangedFields();
            const data = new FormData();

            // Sadece değişen text alanlarını bas
            if (changedData.title !== undefined) data.append('title', changedData.title);
            if (changedData.description !== undefined) data.append('description', changedData.description);
            if (changedData.date !== undefined) data.append('date', changedData.date);
            if (changedData.location !== undefined) data.append('location', changedData.location);
            if (changedData.summary !== undefined) data.append('summary', changedData.summary);
            if (changedData.applicationUrl !== undefined) data.append('applicationUrl', changedData.applicationUrl);
            if (changedData.participantCount !== undefined) data.append('participantCount', changedData.participantCount);

            // Afiş backend'de 'posterImage' bekliyor
            if (imageFile) {
                data.append('posterImage', imageFile);
            }

            // Silinen Galeri ID'leri
            deletedGalleryIds.forEach(id => {
                data.append('deletedGalleryImageIds', id);
            });

            // Yeni Galeri Fotoları (Backend 'newGalleryImages' bekliyor)
            newGalleryFiles.forEach(file => {
                data.append('newGalleryImages', file);
            });

            await updateEvent(eventId, data);
            onSuccess({ id: eventId, ...changedData });
            onClose();
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'Güncellenirken bir hata oluştu.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" onClick={onClose}></div>

            <div className="relative bg-surface-container-lowest w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col hide-scrollbar">

                <button onClick={onClose} className="absolute top-4 left-4 text-on-surface hover:text-error hover:bg-error-container/30 transition-colors rounded-lg w-8 h-8 flex items-center justify-center z-20 bg-surface/50 backdrop-blur-md border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col">

                        {/* AFİŞ KISMI */}
                        <div className={`relative w-full h-64 bg-surface-container flex flex-col items-center justify-center cursor-pointer transition-all ${imagePreview ? '' : 'border-b border-dashed border-outline-variant hover:bg-surface-container-high'}`} onClick={() => fileInputRef.current?.click()}>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Afiş Önizleme" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-label-md flex items-center gap-2"><span className="material-symbols-outlined">change_circle</span> Afişi Değiştir</span>
                                    </div>
                                    <button type="button" onClick={handleRemoveImage} className="absolute top-4 right-4 bg-error text-white p-1.5 rounded-lg shadow-lg cursor-pointer"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-secondary p-6 text-center">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-primary">add_photo_alternate</span>
                                    <p className="font-label-md">Yeni Afiş Yükle</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-5 p-6 md:p-8">
                            <div className="text-center mb-2">
                                <h2 className="font-headline-sm text-xl text-on-surface">Etkinliği Düzenle</h2>
                                {isPastEvent && <p className="text-sm font-label-md text-primary mt-1">Bu etkinlik tamamlanmış (Arşiv Modu)</p>}
                            </div>

                            {error && <div className="p-3.5 text-sm text-error bg-error-container/20 border border-error/30 rounded-xl font-medium">{error}</div>}

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1">Etkinlik Başlığı</label>
                                <input className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" name="title" value={formData.title} onChange={handleChange} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-secondary ml-1">Tarih</label>
                                    <input type="date" className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:border-primary transition-all" name="date" value={formData.date} onChange={handleChange} required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-secondary ml-1">Yer / Konum</label>
                                    <input className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:border-primary transition-all" name="location" value={formData.location} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-secondary ml-1">
                                        {isPastEvent ? 'Başvuru Linki (Geçersiz)' : 'Başvuru Linki'}
                                    </label>
                                    <input
                                        type="url" className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:border-primary transition-all disabled:opacity-50"
                                        name="applicationUrl" value={formData.applicationUrl} onChange={handleChange}
                                        disabled={isPastEvent} // Tarih geçmişse link kapatılır
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-secondary ml-1">
                                        {isPastEvent ? 'Gerçekleşen Katılım Sayısı' : 'Kontenjan'}
                                    </label>
                                    <input type="number" min="0" className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:border-primary transition-all" name="participantCount" value={formData.participantCount} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1">Orijinal Etkinlik Açıklaması</label>
                                <textarea className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md focus:border-primary transition-all resize-none" name="description" rows="3" value={formData.description} onChange={handleChange} required />
                            </div>

                            {/* SADECE TARİHİ GEÇEN ETKİNLİKLERDE AÇILIR */}
                            {isPastEvent && (
                                <div className="mt-4 border-t border-outline-variant/30 pt-6 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="flex flex-col gap-2 mb-6">
                                        <label className="font-label-md text-primary ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-lg">history_edu</span> Etkinlik Özeti (Arşiv İçin)</label>
                                        <textarea className="bg-surface border border-primary/30 rounded-xl px-4 py-3 font-body-md focus:border-primary transition-all resize-none" name="summary" rows="4" value={formData.summary} onChange={handleChange} placeholder="Etkinlik nasıl geçti? Neler konuşuldu? Kısaca özetleyin..." />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <label className="font-label-md text-primary ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-lg">photo_library</span> Arşiv Galerisi</label>
                                            <button type="button" onClick={() => galleryInputRef.current?.click()} className="text-sm bg-primary-container text-on-primary-container px-3 py-1.5 rounded-lg font-label-md flex items-center gap-1 hover:bg-primary hover:text-white transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-sm">add</span> Fotoğraf Ekle
                                            </button>
                                            <input type="file" multiple accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleNewGalleryImages} />
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">

                                            {/* Sunucudaki Mevcut Fotoğraflar */}
                                            {existingGallery.map((img) => {
                                                const isDeleted = deletedGalleryIds.includes(img.id);
                                                return (
                                                    <div key={img.id} className={`relative aspect-square rounded-lg overflow-hidden border ${isDeleted ? 'border-error/50 opacity-50 grayscale' : 'border-outline-variant/30'} group`}>
                                                        <img src={`${API_URL}${img.imageUrl}`} alt="Galeri" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleDeleteExistingGallery(img.id)}
                                                            className={`absolute top-2 right-2 p-1 rounded-md text-white transition-all ${isDeleted ? 'bg-secondary hover:bg-secondary-container' : 'bg-error/80 hover:bg-error opacity-0 group-hover:opacity-100'}`}
                                                            title={isDeleted ? 'Geri Al' : 'Sil'}
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">{isDeleted ? 'undo' : 'delete'}</span>
                                                        </button>
                                                        {isDeleted && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="bg-error text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Silinecek</span></div>}
                                                    </div>
                                                );
                                            })}

                                            {/* Yeni Yüklenecek Fotoğraflar (Önizleme) */}
                                            {newGalleryPreviews.map((preview, index) => (
                                                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-primary/50 group shadow-[0_0_10px_rgba(158,0,0,0.2)]">
                                                    <img src={preview} alt="Yeni" className="w-full h-full object-cover" />
                                                    <div className="absolute top-0 left-0 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-md">YENİ</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewGalleryImage(index)}
                                                        className="absolute top-2 right-2 p-1 rounded-md text-white bg-error hover:bg-error-container transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                </div>
                                            ))}

                                            {existingGallery.length === 0 && newGalleryPreviews.length === 0 && (
                                                <div className="col-span-full py-6 text-center text-secondary font-label-md text-sm">
                                                    Galeriye henüz hiç fotoğraf eklenmemiş.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-2">
                                <button
                                    disabled={!hasChanges || isSubmitting} type="submit"
                                    className={`w-full font-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${hasChanges ? 'bg-primary hover:bg-primary-container text-white cursor-pointer' : 'bg-surface-container-high text-secondary cursor-not-allowed'}`}
                                >
                                    {isSubmitting ? (<span>Güncelleniyor...</span>) : (
                                        <><span className="material-symbols-outlined text-[18px]">save</span><span>{hasChanges ? 'Değişiklikleri Kaydet' : 'Değişiklik Yok'}</span></>
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