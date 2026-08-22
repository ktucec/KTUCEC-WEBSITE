'use client';

import { useState, useEffect } from 'react';
import { createForm } from '@/services/forms';
import { ApiError } from '@/lib/api';

const QUESTION_TYPES = [
    { value: 0, label: 'Kısa Metin (Text)' },
    { value: 1, label: 'Uzun Metin (TextArea)' },
    { value: 2, label: 'Sayı (Number)' },
    { value: 3, label: 'Açılır Liste (SingleChoice)' },
    { value: 4, label: 'Çoklu Seçim (MultiChoice)' },
    { value: 5, label: 'Onay Kutusu (Checkbox)' },
    { value: 6, label: 'Tarih (Date)' },
    { value: 7, label: 'E-posta (Email)' },
    { value: 8, label: 'Telefon (Phone)' }
];

const MAPPED_FIELDS = [
    { value: '', label: 'Eşleştirme Yok (Standart)' },
    { value: 'NameSurname', label: 'Ad Soyad Eşleştirmesi' },
    { value: 'Email', label: 'E-posta Eşleştirmesi' },
    { value: 'ProfileUrl', label: 'Profil Linki Eşleştirmesi' }
];

export default function AdminAddFormModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const [questions, setQuestions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setFormData({ title: '', description: '' });
            // Default olarak 1 tane boş soru ile başlatıyoruz
            setQuestions([{
                id: Date.now(),
                label: '',
                placeholder: '',
                type: 0,
                isRequired: false,
                optionsText: '', // virgülle ayrılmış string olarak tutacağız
                mappedUserField: ''
            }]);
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            {
                id: Date.now(),
                label: '',
                placeholder: '',
                type: 0,
                isRequired: false,
                optionsText: '',
                mappedUserField: ''
            }
        ]);
    };

    const removeQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (questions.length === 0) {
            setError("Lütfen forma en az bir soru ekleyin.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const formattedQuestions = questions.map((q, index) => {
                const typeNum = parseInt(q.type);
                const isChoiceType = typeNum === 3 || typeNum === 4;

                return {
                    label: q.label,
                    placeholder: q.placeholder || null,
                    type: typeNum,
                    isRequired: q.isRequired,
                    order: index + 1,
                    options: isChoiceType && q.optionsText
                        ? q.optionsText.split(',').map(s => s.trim()).filter(Boolean)
                        : null,
                    mappedUserField: q.mappedUserField || null
                };
            });

            const payload = {
                title: formData.title,
                // DEĞİŞİKLİK BURADA: Enter (\n) vuruşlarını <br> tagine çeviriyoruz
                description: formData.description.replace(/\r?\n/g, '<br>'),
                questions: formattedQuestions
            };

            const response = await createForm(payload);
            const newForm = response?.data || response;

            onSuccess(newForm);
            onClose();
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : "Form oluşturulurken bir hata oluştu.";
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

            {/* w-full max-w-4xl diyerek formu genişlettik çünkü dinamik sorular var */}
            <div className="relative bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between pt-6 pb-4 px-6 md:px-8 border-b border-outline-variant/20 shrink-0 bg-surface-container-lowest z-20">
                    <h2 className="font-headline-sm text-xl text-on-surface">Yeni Başvuru Formu Oluştur</h2>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors rounded-lg w-8 h-8 flex items-center justify-center bg-surface-container hover:border-error border border-transparent cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="overflow-y-auto p-6 md:p-8 flex-1 hide-scrollbar bg-surface/30">
                    <form id="createFormForm" onSubmit={handleSubmit} className="flex flex-col gap-8">

                        {error && (
                            <div className="p-3.5 text-sm text-error bg-error-container/20 border border-error/30 rounded-xl font-medium">
                                {error}
                            </div>
                        )}

                        {/* Temel Form Bilgileri */}
                        <div className="flex flex-col gap-4">
                            <h3 className="font-label-md text-primary uppercase tracking-wider border-b border-outline-variant/20 pb-2">Temel Bilgiler</h3>

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="title">Form Başlığı <span className="text-error">*</span></label>
                                <input
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    placeholder="Örn: 2026 Yaz Kampı Başvuruları"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-label-md text-secondary ml-1" htmlFor="description">Açıklama & Yönerge <span className="text-error">*</span></label>
                                <textarea
                                    className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Formla ilgili detayları ve talimatları yazın (HTML tagleri kullanabilirsiniz)..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        {/* Dinamik Sorular Bölümü */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                                <h3 className="font-label-md text-primary uppercase tracking-wider">Sorular ({questions.length})</h3>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg text-sm font-label-md transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Soru Ekle
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {questions.map((q, index) => (
                                    <div key={q.id} className="relative bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-sm group">

                                        {/* Soru Silme Butonu */}
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(q.id)}
                                            className="absolute top-4 right-4 text-secondary hover:text-error transition-colors p-1 bg-surface rounded-md border border-outline-variant/20 hover:border-error/50 cursor-pointer"
                                            title="Soruyu Sil"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Soru Etiketi */}
                                            <div className="flex flex-col gap-1.5 md:col-span-2 pr-10">
                                                <label className="font-label-md text-[11px] text-secondary">Soru Metni <span className="text-error">*</span></label>
                                                <input
                                                    className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                                                    value={q.label}
                                                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                                                    placeholder="Örn: Hangi programlama dilini kullanıyorsunuz?"
                                                    required
                                                />
                                            </div>

                                            {/* Soru Tipi */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-label-md text-[11px] text-secondary">Soru Tipi</label>
                                                <select
                                                    className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
                                                    value={q.type}
                                                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                >
                                                    {QUESTION_TYPES.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Akıllı Eşleştirme (MappedUserField) */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-label-md text-[11px] text-secondary">Üye Bilgisi Eşleştirme (Auto-fill)</label>
                                                <select
                                                    className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
                                                    value={q.mappedUserField}
                                                    onChange={(e) => updateQuestion(q.id, 'mappedUserField', e.target.value)}
                                                >
                                                    {MAPPED_FIELDS.map(field => (
                                                        <option key={field.value} value={field.value}>{field.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Seçenekler (Sadece Çoklu/Tekli seçim için) */}
                                            {(parseInt(q.type) === 3 || parseInt(q.type) === 4) ? (
                                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                                    <label className="font-label-md text-[11px] text-secondary">Seçenekler (Virgülle ayırarak yazın) <span className="text-error">*</span></label>
                                                    <input
                                                        className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                                                        value={q.optionsText}
                                                        onChange={(e) => updateQuestion(q.id, 'optionsText', e.target.value)}
                                                        placeholder="Örn: C#, Python, JavaScript, Java"
                                                        required
                                                    />
                                                </div>
                                            ) : (
                                                /* Placeholder (Metin/Sayı tipleri için) */
                                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                                    <label className="font-label-md text-[11px] text-secondary">İpucu Metni (Placeholder)</label>
                                                    <input
                                                        className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                                                        value={q.placeholder}
                                                        onChange={(e) => updateQuestion(q.id, 'placeholder', e.target.value)}
                                                        placeholder="Kullanıcıya gösterilecek silik örnek metin..."
                                                        disabled={parseInt(q.type) === 5} // Checkbox için placeholder kapalı
                                                    />
                                                </div>
                                            )}

                                            {/* Zorunlu Mu Checkbox */}
                                            <div className="flex items-center gap-2 md:col-span-2 mt-1">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-primary bg-surface border-outline-variant/50 rounded focus:ring-primary cursor-pointer"
                                                        checked={q.isRequired}
                                                        onChange={(e) => updateQuestion(q.id, 'isRequired', e.target.checked)}
                                                    />
                                                    <span className="font-body-md text-sm text-on-surface">Bu soruyu yanıtlamak zorunlu olsun</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer / Submit Button */}
                <div className="p-6 md:px-8 md:py-5 border-t border-outline-variant/20 bg-surface-container-lowest shrink-0 z-20">
                    <button
                        form="createFormForm" // Dışarıdaki form'u tetikler
                        disabled={isSubmitting || questions.length === 0}
                        type="submit"
                        className="w-full sm:w-auto sm:float-right bg-primary hover:bg-primary-container text-white font-label-md px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                <span>Form Oluşturuluyor...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">dynamic_form</span>
                                <span>Formu Kaydet ve Yayınla</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}