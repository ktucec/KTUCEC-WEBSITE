"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFormById, submitFormApplication } from '@/services/forms';
import { getMe } from '@/services/auth';
import { ApiError } from '@/lib/api';

function ApplicationFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const formIdParam = searchParams.get('id');

    const [form, setForm] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Form cevaplarını tutacağımız state. Key: questionId, Value: string veya array
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        let isCancelled = false;

        async function fetchInitialData() {
            if (!formIdParam) {
                setError("Geçerli bir form ID'si bulunamadı.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Paralel olarak hem formu hem de oturum durumunu çekiyoruz
                const [formResult, authResult] = await Promise.allSettled([
                    getFormById(formIdParam),
                    getMe()
                ]);

                if (!isCancelled) {
                    if (formResult.status === 'fulfilled' && formResult.value.isSuccess) {
                        setForm(formResult.value.data);
                    } else {
                        throw new Error("Form bulunamadı veya kapalı.");
                    }

                    // Eğer 401 dönerse authResult rejected olacaktır, bu durumda user null kalır (Misafir)
                    if (authResult.status === 'fulfilled') {
                        setUser(authResult.value.data);
                    }
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message || "Form yüklenirken bir hata oluştu.");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchInitialData();

        return () => {
            isCancelled = true;
        };
    }, [formIdParam]);

    // Giriş yapmış kullanıcılar için mappedUserField dolu olan soruları filtreliyoruz
    const visibleQuestions = form?.questions?.filter(q => {
        if (user && q.mappedUserField) {
            return false; // Backend otomatik dolduracak, frontend'de gösterme
        }
        return true;
    }).sort((a, b) => a.order - b.order) || [];

    const handleTextChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleCheckboxChange = (qId, option, isChecked) => {
        setAnswers(prev => {
            const currentArr = Array.isArray(prev[qId]) ? prev[qId] : [];
            if (isChecked) {
                return { ...prev, [qId]: [...currentArr, option] };
            } else {
                return { ...prev, [qId]: currentArr.filter(item => item !== option) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        // Backend'in beklediği formata dönüştür
        const payloadAnswers = visibleQuestions.map(q => {
            let val = answers[q.id];

            // Eğer çoklu seçimse ve dizi ise, virgülle ayrılmış stringe çevir (veya backend nasıl bekliyorsa)
            if (Array.isArray(val)) {
                val = val.join(', ');
            }

            return {
                formQuestionId: q.id,
                value: val || ""
            };
        });

        const requestPayload = {
            formId: parseInt(formIdParam),
            answers: payloadAnswers
        };

        try {
            const res = await submitFormApplication(formIdParam, requestPayload);
            setSuccessMessage(res.message || "Başvurunuz başarıyla alındı!");
            // Formu temizle
            setAnswers({});
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Başvuru gönderilirken beklenmeyen bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-grow pt-32 pb-24 px-gutter max-w-container-max mx-auto w-full relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-label-md text-on-surface-variant animate-pulse">Form hazırlanıyor...</p>
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="flex-grow pt-32 pb-24 px-gutter max-w-container-max mx-auto w-full relative z-10 text-center">
                <div className="glass-panel rounded-3xl p-12 inline-block">
                    <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
                    <h2 className="font-headline-md text-on-surface mb-2">Eyvah!</h2>
                    <p className="font-body-lg text-on-surface-variant">{error}</p>
                    <Link href="/" className="btn-glow bg-primary text-white px-6 py-3 rounded-xl mt-6 inline-block font-label-md">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-grow pt-32 pb-24 px-gutter max-w-3xl mx-auto w-full relative z-10 fade-up visible">
            {/* Header Section */}
            <div className="mb-10 text-left">
                <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-on-surface-variant/60 font-label-md text-xs md:text-label-md mb-3 md:mb-4 uppercase tracking-widest">
                    <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                    <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">chevron_right</span>
                    <span className="text-primary font-bold">Başvuru</span>
                </nav>
                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-4">
                    {form?.title}
                </h1>

                <div
                    className="font-body-lg text-on-surface-variant border-l-4 border-primary-container pl-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: form?.description || '' }}
                />

                {user && (
                    <div className="mt-6 inline-flex items-center gap-3 bg-surface-container-high/50 backdrop-blur px-4 py-2.5 rounded-full border border-white/20 shadow-sm">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        <span className="font-label-md text-sm text-secondary">
                            Giriş yapıldı. Profil bilgileriniz forma otomatik eklenecektir.
                        </span>
                    </div>
                )}
            </div>

            {/* Form Section */}
            <div className="glass-panel rounded-[24px] md:rounded-[32px] p-6 md:p-10 relative overflow-hidden shadow-lg border-white/60">
                {successMessage ? (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                        </div>
                        <h2 className="font-headline-sm text-on-surface mb-3">Başarılı!</h2>
                        <p className="font-body-md text-on-surface-variant mb-8">{successMessage}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-glow bg-primary-container text-white font-label-md py-3 px-8 rounded-xl"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8 relative z-10">
                        {error && (
                            <div className="p-4 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3">
                                <span className="material-symbols-outlined">warning</span>
                                {error}
                            </div>
                        )}

                        {visibleQuestions.map((q) => (
                            <div key={q.id} className="flex flex-col gap-2 fade-up visible">
                                {/* Type 5 (Tekli Onay Checkbox'ı) hariç tüm sorular için üst başlık */}
                                {q.type !== 5 && (
                                    <label className="font-label-md text-sm md:text-base text-secondary ml-1 flex items-center gap-1">
                                        {q.label}
                                        {q.isRequired && <span className="text-primary-container font-bold">*</span>}
                                    </label>
                                )}

                                {/* 0 = Text, 2 = Number, 6 = Date, 7 = Email, 8 = Phone */}
                                {(q.type === 0 || q.type === 2 || q.type === 6 || q.type === 7 || q.type === 8) && (
                                    <input
                                        type={
                                            q.type === 7 ? "email" :
                                                q.type === 2 ? "number" :
                                                    q.type === 6 ? "date" :
                                                        q.type === 8 ? "tel" : "text"
                                        }
                                        className="input-glass rounded-xl px-5 py-3.5 font-body-md text-on-background w-full"
                                        placeholder={q.placeholder || (q.type === 8 ? "05XX XXX XX XX" : "")}
                                        required={q.isRequired}
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    />
                                )}

                                {/* 1 = TextArea */}
                                {q.type === 1 && (
                                    <textarea
                                        className="input-glass rounded-xl px-5 py-4 font-body-md text-on-background w-full resize-y min-h-[120px]"
                                        placeholder={q.placeholder}
                                        required={q.isRequired}
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    />
                                )}

                                {/* 3 = SingleChoice */}
                                {q.type === 3 && (
                                    <div className="relative">
                                        <select
                                            className="input-glass rounded-xl px-5 py-3.5 font-body-md text-on-background w-full appearance-none cursor-pointer"
                                            required={q.isRequired}
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                                        >
                                            <option value="" disabled>Seçim yapınız...</option>
                                            {q.options?.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                                            expand_more
                                        </span>
                                    </div>
                                )}

                                {/* 4 = MultiChoice */}
                                {q.type === 4 && (
                                    <div className="flex flex-col gap-3 mt-1 bg-white/40 p-4 rounded-xl border border-white/50">
                                        {q.options?.map((opt, i) => {
                                            const isChecked = Array.isArray(answers[q.id]) && answers[q.id].includes(opt);
                                            return (
                                                <label key={i} className="flex items-center gap-3 cursor-pointer group select-none">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary' : 'bg-white border-2 border-outline-variant group-hover:border-primary/50'}`}>
                                                        {isChecked && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isChecked}
                                                        onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                    />
                                                    <span className="font-body-md text-on-surface">{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 5 = Checkbox (Tekli Onay Kutusu) */}
                                {q.type === 5 && (
                                    <label className="flex items-start gap-3 mt-2 cursor-pointer group select-none bg-white/40 p-4 rounded-xl border border-white/50">
                                        <div className={`w-5 h-5 rounded mt-0.5 shrink-0 flex items-center justify-center transition-all ${answers[q.id] === 'true' ? 'bg-primary border-primary' : 'bg-white border-2 border-outline-variant group-hover:border-primary/50'}`}>
                                            {answers[q.id] === 'true' && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            required={q.isRequired}
                                            checked={answers[q.id] === 'true'}
                                            onChange={(e) => handleTextChange(q.id, e.target.checked ? 'true' : '')}
                                        />
                                        <span className="font-body-md text-sm md:text-base text-on-surface">
                                            {q.label}
                                            {q.isRequired && <span className="text-primary-container font-bold ml-1">*</span>}
                                        </span>
                                    </label>
                                )}
                            </div>
                        ))}

                        <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/40 pt-6">
                            <small className="font-body-md text-sm opacity-60 w-full md:w-1/2">
                                * işareti ile belirtilen alanların doldurulması zorunludur.
                            </small>
                            <button
                                disabled={isSubmitting}
                                className="btn-glow bg-primary-container text-white font-label-md py-4 px-10 rounded-xl flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50 transition-all"
                                type="submit"
                            >
                                <span>{isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Tamamla'}</span>
                                {!isSubmitting && <span className="material-symbols-outlined text-[20px]">send</span>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

export default function ApplicationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ApplicationFormContent />
        </Suspense>
    );
}