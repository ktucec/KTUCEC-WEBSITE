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

    // Sayfa yükleme hatası: { type: 'not_found' | 'server_error', message: string }
    const [loadError, setLoadError] = useState(null);

    // Form gönderme aşamasındaki hata ve başarı mesajı
    const [submitError, setSubmitError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Form cevaplarını tutacağımız state. Key: questionId, Value: string veya array
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        let isCancelled = false;

        async function fetchInitialData() {
            if (!formIdParam) {
                setLoadError({
                    type: 'not_found',
                    message: "Geçerli bir form bağlantısı (ID) bulunamadı."
                });
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setLoadError(null);

            try {
                // Paralel olarak hem formu hem de oturum durumunu çekiyoruz
                const [formResult, authResult] = await Promise.allSettled([
                    getFormById(formIdParam),
                    getMe()
                ]);

                if (!isCancelled) {
                    if (formResult.status === 'fulfilled') {
                        if (formResult.value?.isSuccess && formResult.value.data) {
                            setForm(formResult.value.data);
                        } else {
                            const status = formResult.value?.statusCode || formResult.value?.status;
                            if (status === 404) {
                                setLoadError({
                                    type: 'not_found',
                                    message: "Aradığınız başvuru formu sistemde bulunamadı veya bağlantı hatalı."
                                });
                            } else {
                                setLoadError({
                                    type: 'server_error',
                                    message: formResult.value?.message || "Form bilgileri sunucudan alınırken bir hata oluştu."
                                });
                            }
                        }
                    } else {
                        // Promise rejected durumu (ApiError veya Ağ / Sunucu Hatası)
                        const reason = formResult.reason;
                        const status = reason?.status || reason?.statusCode;

                        if (status === 404) {
                            setLoadError({
                                type: 'not_found',
                                message: reason?.message || "Aradığınız başvuru formu sistemde bulunamadı veya bağlantı hatalı."
                            });
                        } else {
                            setLoadError({
                                type: 'server_error',
                                message: reason?.message || "Sunucuya bağlanırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
                            });
                        }
                    }

                    // Eğer 401 dönerse authResult rejected olacaktır, bu durumda user null kalır (Misafir)
                    if (authResult.status === 'fulfilled') {
                        setUser(authResult.value?.data);
                    }
                }
            } catch (err) {
                if (!isCancelled) {
                    setLoadError({
                        type: 'server_error',
                        message: "Form bilgileri alınırken beklenmeyen bir sunucu hatası oluştu."
                    });
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
        setSubmitError(null);
        setSuccessMessage(null);

        // Kullanıcı giriş yapmışsa submit öncesi token'ı doğrula (ping at)
        if (user) {
            try {
                await getMe();
            } catch (err) {
                setSubmitError("Oturum süreniz dolmuş. Lütfen sayfayı yenileyip tekrar giriş yapın.");
                setIsSubmitting(false);
                return;
            }
        }

        const payloadAnswers = visibleQuestions.map(q => {
            let val = answers[q.id];

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
            setSubmitError(err instanceof ApiError ? err.message : "Başvuru gönderilirken beklenmeyen bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- SENARYO 1: YÜKLENİYOR ---
    if (isLoading) {
        return (
            <div className="flex-grow pt-32 pb-24 px-gutter max-w-container-max mx-auto w-full relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-label-md text-on-surface-variant animate-pulse">Form hazırlanıyor...</p>
            </div>
        );
    }

    // --- HATA SENARYOSU 1: FORM BULUNAMADI (404 / ID HATALI) ---
    if (loadError?.type === 'not_found' && !form) {
        return (
            <div className="flex-grow pt-32 pb-24 px-gutter max-w-container-max mx-auto w-full relative z-10 text-center fade-up visible">
                <div className="glass-panel rounded-3xl p-10 md:p-16 inline-block max-w-lg border-white/60 shadow-lg">
                    <div className="w-20 h-20 bg-error-container/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-error">search_off</span>
                    </div>
                    <h2 className="font-headline-sm text-on-surface mb-3">Form Bulunamadı</h2>
                    <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed">
                        {loadError.message}
                    </p>
                    <Link href="/" className="btn-glow bg-primary text-white font-label-md py-3.5 px-8 rounded-xl inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">home</span>
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    // --- HATA SENARYOSU 2: SUNUCU / BAĞLANTI HATASI (500 / NETWORK ERROR) ---
    if (loadError?.type === 'server_error' && !form) {
        return (
            <div className="flex-grow pt-32 pb-24 px-gutter max-w-container-max mx-auto w-full relative z-10 text-center fade-up visible">
                <div className="glass-panel rounded-3xl p-10 md:p-16 inline-block max-w-lg border-white/60 shadow-lg">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-amber-500">dns</span>
                    </div>
                    <h2 className="font-headline-sm text-on-surface mb-3">Sunucu Hatası</h2>
                    <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed">
                        {loadError.message}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-glow bg-primary text-white font-label-md py-3.5 px-6 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">refresh</span>
                            Sayfayı Yenile
                        </button>
                        <Link
                            href="/"
                            className="bg-surface-container-high text-on-surface font-label-md py-3.5 px-6 rounded-xl inline-flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">home</span>
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // --- HATA SENARYOSU 3: BAŞVURULAR KAPANDI (FORM VAR AMA PASİF) ---
    if (form && form.isActive === false) {
        return (
            <div className="flex-grow pt-32 pb-24 px-gutter max-w-container-max mx-auto w-full relative z-10 text-center fade-up visible">
                <div className="glass-panel rounded-3xl p-10 md:p-16 inline-block max-w-lg border-white/60 shadow-lg">
                    <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-secondary">timer_off</span>
                    </div>
                    <h2 className="font-headline-sm text-on-surface mb-3">Başvurular Kapandı</h2>
                    <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed">
                        İlginiz için teşekkür ederiz! <b>"{form.title}"</b> için başvuru süresi dolmuş veya yönetici tarafından erişime kapatılmıştır.
                    </p>
                    <Link href="/" className="btn-glow bg-primary text-white font-label-md py-3.5 px-8 rounded-xl inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">home</span>
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    // --- NORMAL RENDER (FORM AÇIK VE KULLANIMA HAZIR) ---
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
                    <div className="text-center py-10 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                        </div>
                        <h2 className="font-headline-sm text-on-surface mb-3">Başarılı!</h2>
                        <p className="font-body-md text-on-surface-variant mb-8">{successMessage}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-glow bg-primary-container text-white font-label-md py-3.5 px-8 rounded-xl flex items-center gap-2 mx-auto cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">home</span>
                            Ana Sayfaya Dön
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8 relative z-10">
                        {submitError && (
                            <div className="p-4 text-sm text-error bg-error/10 rounded-xl border border-error/20 flex items-center gap-3">
                                <span className="material-symbols-outlined">warning</span>
                                {submitError}
                            </div>
                        )}

                        {visibleQuestions.map((q) => (
                            <div key={q.id} className="flex flex-col gap-2 fade-up visible">
                                {q.type !== 5 && (
                                    <label className="font-label-md text-sm md:text-base text-secondary ml-1 flex items-center gap-1">
                                        {q.label}
                                        {q.isRequired && <span className="text-primary-container font-bold">*</span>}
                                    </label>
                                )}

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

                                {q.type === 1 && (
                                    <textarea
                                        className="input-glass rounded-xl px-5 py-4 font-body-md text-on-background w-full resize-y min-h-[120px]"
                                        placeholder={q.placeholder}
                                        required={q.isRequired}
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    />
                                )}

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
                                className="btn-glow bg-primary-container text-white font-label-md py-4 px-10 rounded-xl flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50 transition-all cursor-pointer"
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