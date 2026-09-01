'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEventBySlug } from '@/services/events';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/formatDate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const SLIDE_DURATION_MS = 4000;

function resolveUrl(url) {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_URL}${url}`;
}

function chipAnim(delay = 0.1) {
    return { animationDelay: `${delay}s, ${delay + 0.6}s` };
}

function AmbientOrbs({ tone = 'vivid' }) {
    const palettes = {
        vivid: [
            { cls: 'orb orb-a', style: { top: '6%', left: '2%', width: 340, height: 340, background: 'var(--color-primary-container)', opacity: 0.26 } },
            { cls: 'orb orb-b', style: { top: '50%', right: '2%', width: 380, height: 380, background: 'var(--color-tertiary-container)', opacity: 0.18 } },
            { cls: 'orb orb-c', style: { bottom: '2%', left: '15%', width: 220, height: 220, background: 'var(--color-primary)', opacity: 0.16 } },
        ],
        muted: [
            { cls: 'orb orb-a', style: { top: '10%', left: '2%', width: 260, height: 260, background: 'var(--color-secondary)', opacity: 0.12 } },
            { cls: 'orb orb-b', style: { bottom: '8%', right: '2%', width: 300, height: 300, background: 'var(--color-outline-variant)', opacity: 0.16 } },
        ],
    };
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {palettes[tone].map((o, i) => (
                <div key={i} className={o.cls} style={o.style} />
            ))}
        </div>
    );
}

function FloatingParticles({ tone = 'vivid' }) {
    const particles = [
        { left: '8%', size: 6, delay: '0s', duration: '9s' },
        { left: '22%', size: 4, delay: '1.5s', duration: '11s' },
        { left: '40%', size: 5, delay: '3s', duration: '8s' },
        { left: '58%', size: 3, delay: '2s', duration: '12s' },
        { left: '74%', size: 6, delay: '4s', duration: '10s' },
        { left: '90%', size: 4, delay: '0.8s', duration: '9.5s' },
    ];
    const color = tone === 'muted' ? 'var(--color-secondary)' : 'var(--color-primary-container)';
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p, i) => (
                <span
                    key={i}
                    className="particle"
                    style={{
                        left: p.left,
                        bottom: '-20px',
                        width: p.size,
                        height: p.size,
                        background: color,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}
        </div>
    );
}

function TypewriterTitle({ text, className = '', speed = 32 }) {
    const ref = useRef(null);
    const [visibleChars, setVisibleChars] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || started) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            // threshold: 0 -> Elemanın bir pikseli bile o çizgiye değdiğinde tetikle.
            // rootMargin -> Alt kısımdan 300px içerde tetikle (-300px)
            { threshold: 0, rootMargin: '0px 0px -100px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started || visibleChars >= text.length) return;
        const timeout = setTimeout(() => setVisibleChars((c) => c + 1), speed);
        return () => clearTimeout(timeout);
    }, [started, visibleChars, text, speed]);

    const isDone = visibleChars >= text.length;

    return (
        <h1 ref={ref} className={className}>
            {text.slice(0, visibleChars)}
            <span className={`type-cursor ${isDone ? 'cursor-fade' : ''}`} />
        </h1>
    );
}

export default function EventDetailPage() {
    const params = useParams();
    const slug = params?.slug;

    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPosterFullscreen, setIsPosterFullscreen] = useState(false);
    const [isGalleryFullscreen, setIsGalleryFullscreen] = useState(false);

    const posterRef = useRef(null);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    useEffect(() => {
        let isCancelled = false;
        async function fetchEventDetail() {
            if (!slug) return;
            setIsLoading(true);
            setError(null);
            try {
                const res = await getEventBySlug(slug);
                if (!isCancelled) setEvent(res?.data || res);
            } catch (err) {
                if (!isCancelled) {
                    const msg = err instanceof ApiError ? err.message : 'Etkinlik detayları yüklenemedi.';
                    setError(msg);
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        }
        fetchEventDetail();
        return () => { isCancelled = true; };
    }, [slug]);

    useEffect(() => {
        if (!event?.galleryImages || event.galleryImages.length <= 1) return;
        if (isGalleryFullscreen) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % event.galleryImages.length);
        }, SLIDE_DURATION_MS);
        return () => clearInterval(interval);
    }, [event, isGalleryFullscreen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsPosterFullscreen(false);
                setIsGalleryFullscreen(false);
            }
            if (isGalleryFullscreen) {
                if (e.key === 'ArrowRight') nextGallerySlide();
                if (e.key === 'ArrowLeft') prevGallerySlide();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGalleryFullscreen, event]);

    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEndEvent = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) nextGallerySlide();
        if (distance < -minSwipeDistance) prevGallerySlide();
    };

    const nextGallerySlide = (e) => {
        e?.stopPropagation();
        setCurrentSlide((prev) => (prev + 1) % event.galleryImages.length);
    };
    const prevGallerySlide = (e) => {
        e?.stopPropagation();
        setCurrentSlide((prev) => (prev - 1 + event.galleryImages.length) % event.galleryImages.length);
    };

    const handlePosterMouseMove = (e) => {
        const el = posterRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--tilt-x', `${x * 10}deg`);
        el.style.setProperty('--tilt-y', `${-y * 10}deg`);
    };
    const handlePosterMouseLeave = () => {
        const el = posterRef.current;
        if (!el) return;
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: event.title, text: 'Bu muhteşem etkinliğe göz at!', url: window.location.href });
            } catch (error) {
                console.log('Paylaşım iptal edildi veya desteklenmiyor.');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Bağlantı kopyalandı!');
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen pt-40 pb-20 flex flex-col items-center justify-center bg-background">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">progress_activity</span>
                <p className="text-on-surface-variant font-body-lg animate-pulse">Etkinlik detayları yükleniyor...</p>
            </main>
        );
    }

    if (error || !event) {
        return (
            <main className="min-h-screen pt-40 pb-20 px-gutter max-w-container-max mx-auto text-center flex flex-col items-center justify-center">
                <div className="glass-panel p-8 md:p-12 max-w-lg border border-error/30 shadow-xl scale-in">
                    <span className="material-symbols-outlined text-error text-6xl mb-4">event_busy</span>
                    <h1 className="font-headline-md text-2xl text-on-surface mb-2">Etkinlik Bulunamadı</h1>
                    <p className="text-on-surface-variant font-body-md mb-6">{error || 'İstenen etkinlik kaydına ulaşılamadı.'}</p>
                    <Link href="/etkinlikler" className="inline-flex items-center gap-2 btn-glow px-6 py-3 font-label-md">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Tüm Etkinliklere Dön
                    </Link>
                </div>
            </main>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateObj = new Date(event.date);
    const eventYear = eventDateObj.getFullYear();
    const isPast = eventDateObj < today;
    const isArchiveReady = isPast && Boolean(event.summary) && event.galleryImages?.length > 0;
    const posterUrl = resolveUrl(event.imageUrl);
    const orbTone = isPast && !isArchiveReady ? 'muted' : 'vivid';

    return (
        <div className="text-on-background mt-10 antialiased min-h-screen relative overflow-x-hidden">

            {isGalleryFullscreen && event?.galleryImages?.length > 0 && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
                    <button onClick={() => setIsGalleryFullscreen(false)} className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-error text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl leading-none">close</span>
                    </button>
                    <button onClick={prevGallerySlide} className="hidden md:flex absolute left-8 z-50 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-xl">
                        <span className="material-symbols-outlined text-3xl leading-none">chevron_left</span>
                    </button>
                    <button onClick={nextGallerySlide} className="hidden md:flex absolute right-8 z-50 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-xl">
                        <span className="material-symbols-outlined text-3xl leading-none">chevron_right</span>
                    </button>
                    <div className="w-full h-full p-4 md:p-16 flex items-center justify-center relative touch-pan-y" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndEvent}>
                        <img key={currentSlide} src={resolveUrl(event.galleryImages[currentSlide].imageUrl)} alt={`Galeri ${currentSlide + 1}`} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-[fadeIn_0.3s_ease-in-out]" />
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
                        {event.galleryImages.map((_, idx) => (
                            <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 w-2'}`} />
                        ))}
                    </div>
                </div>
            )}

            {isPosterFullscreen && posterUrl && !isArchiveReady && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
                    <button onClick={() => setIsPosterFullscreen(false)} className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-error text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl leading-none">close</span>
                    </button>
                    <div className="w-full h-full p-4 md:p-12 flex items-center justify-center cursor-zoom-out" onClick={() => setIsPosterFullscreen(false)}>
                        <img src={posterUrl} alt="Afiş Tam Ekran" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                    </div>
                </div>
            )}

            {isArchiveReady ? (
                /* ==================== FAZ 3 — ARŞİV ==================== */
                <div className="relative min-h-screen pt-18 overflow-x-hidden fluid-bg">
                    <AmbientOrbs tone="vivid" />
                    <FloatingParticles tone="vivid" />

                    <main className="relative z-10 w-full max-w-container-max px-gutter mx-auto min-h-screen pb-10 md:py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-10 items-center">

                        <div className="flex items-center justify-between md:hidden mb-2">
                            <Link href="/etkinlikler" className="inline-flex items-center gap-2 text-on-surface-variant font-label-md text-sm">
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Etkinliklere Dön
                            </Link>
                            <button onClick={handleShare} className="text-on-surface-variant p-2">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>

                        <div className="relative isolate">
                            <div className="story-stage w-full h-[62vh] md:h-[78vh] cursor-pointer select-none scale-in animate-float shadow-2xl" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndEvent} onClick={() => setIsGalleryFullscreen(true)}>
                                {event.galleryImages.length > 1 && (
                                    <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5">
                                        {event.galleryImages.map((_, idx) => (
                                            <div key={idx} className="story-progress-track">
                                                <div
                                                    key={idx === currentSlide ? `active-${currentSlide}` : `static-${idx}`}
                                                    className={`story-progress-fill ${idx < currentSlide ? 'done' : ''} ${idx === currentSlide ? 'animate' : ''} ${idx === currentSlide && isGalleryFullscreen ? 'paused' : ''}`}
                                                    style={idx === currentSlide ? { animationDuration: `${SLIDE_DURATION_MS}ms` } : undefined}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {event.galleryImages.map((img, idx) => (
                                    <img key={img.id || idx} src={resolveUrl(img.imageUrl)} alt={`${event.title} - ${idx + 1}`} className={`story-slide ${idx === currentSlide ? 'active' : ''}`} />
                                ))}
                                <div className="absolute inset-0 archive-scrim z-10 pointer-events-none" />
                                {event.galleryImages.length > 1 && (
                                    <>
                                        <button onClick={prevGallerySlide} className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 text-white w-10 h-10 rounded-full backdrop-blur-md items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-xl leading-none">chevron_left</span>
                                        </button>
                                        <button onClick={nextGallerySlide} className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 text-white w-10 h-10 rounded-full backdrop-blur-md items-center justify-center transition-colors">
                                            <span className="material-symbols-outlined text-xl leading-none">chevron_right</span>
                                        </button>
                                    </>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setIsGalleryFullscreen(true); }} className="absolute bottom-4 right-4 z-30 w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/25 text-white hover:bg-white/20 transition-colors" title="Tam Ekran">
                                    <span className="material-symbols-outlined text-lg">fullscreen</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative flex flex-col justify-center space-y-8 p-8 md:p-10 rounded-[2rem] glass-panel glass-shine">
                            <Link href="/etkinlikler" className="hidden md:inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-sm transition-colors w-fit">
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Etkinliklere Dön
                            </Link>

                            <div className="flex flex-wrap gap-3 items-center">
                                <span className="ha-tag-chip chip-anim bg-primary-container/15 text-primary border border-primary/20" style={chipAnim(0.1)}>
                                    Geçmiş Etkinlik
                                </span>
                                <div className="ha-tag-chip chip-anim bg-surface-container-lowest/80 border border-outline-variant/30 !normal-case" style={chipAnim(0.3)}>
                                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                                    <span className="text-on-surface">{formatDate(event.date)}</span>
                                </div>
                                {event.participantCount && (
                                    <div className="ha-tag-chip chip-anim bg-surface-container-lowest/80 border border-outline-variant/30 !normal-case" style={chipAnim(0.5)}>
                                        <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                                        <span className="text-on-surface">{event.participantCount}+ Katılımcı</span>
                                    </div>
                                )}
                            </div>

                            <TypewriterTitle
                                key={event.id ?? event.slug}
                                text={event.title}
                                className="font-display-lg text-5xl md:text-6xl lg:text-7xl text-primary font-black leading-[1.05] tracking-tight drop-shadow-sm"
                            />

                            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line rise-in" style={{ animationDelay: '0.3s' }}>
                                {event.summary}
                            </p>

                            {event.galleryImages.length > 1 && (
                                <button onClick={() => setIsGalleryFullscreen(true)} className="rise-in inline-flex items-center gap-2 w-fit text-primary border border-primary/30 hover:border-primary/60 px-5 py-3 rounded-xl transition-colors font-label-md" style={{ animationDelay: '0.45s' }}>
                                    <span className="material-symbols-outlined text-lg">photo_library</span>
                                    Tüm Fotoğrafları Gör ({event.galleryImages.length})
                                </button>
                            )}
                        </div>
                    </main>
                </div>
            ) : (
                /* ==================== FAZ 1 & 2 ==================== */
                <div className="relative min-h-screen overflow-x-hidden bg-background">
                    <AmbientOrbs tone={orbTone} />
                    <FloatingParticles tone={orbTone} />
                    {!isPast && <div className="ghost-text font-display-lg">EVENT.{eventYear}</div>}

                    <main className="relative z-10 w-full max-w-container-max px-gutter mx-auto pt-15 lg:pt-20 pb-20 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 md:gap-24">

                        <div className="w-full md:w-5/12 flex-shrink-0 relative isolate">
                            <div className="ambient-glow top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            <div className="animate-float">
                                <div
                                    ref={posterRef}
                                    onMouseMove={!isPast ? handlePosterMouseMove : undefined}
                                    onMouseLeave={!isPast ? handlePosterMouseLeave : undefined}
                                    onClick={() => posterUrl && setIsPosterFullscreen(true)}
                                    className={`relative rounded-[32px] overflow-hidden shadow-2xl border border-white/50 aspect-[2/3] bg-surface-container-low group scale-in ${posterUrl ? 'cursor-pointer' : ''} ${!isPast ? 'poster-tilt' : ''}`}
                                    title={posterUrl ? 'Tam Ekranda Görmek İçin Tıklayın' : ''}
                                >
                                    {posterUrl ? (
                                        <>
                                            <img src={posterUrl} alt={event.title} className={`w-full h-full object-cover transition-transform duration-500 ease-out ${isPast ? 'grayscale-[60%] opacity-80' : 'group-hover:scale-[1.02]'}`} />
                                            {isPast && <div className="pending-sweep" />}
                                            {!isPast && (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/40">
                                                        <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40">
                                            <span className="material-symbols-outlined text-6xl mb-2">image</span>
                                            <p className="font-label-md">Afiş Bulunmuyor</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                                        <span className="ha-tag-chip bg-white/20 text-white backdrop-blur-md border border-white/30 !text-white !bg-white/20">
                                            <span className="material-symbols-outlined text-[16px]">computer</span>
                                            {eventYear} Etkinliği
                                        </span>
                                    </div>
                                    {posterUrl && (
                                        <div className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white pointer-events-none">
                                            <span className="material-symbols-outlined text-lg leading-none">fullscreen</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-7/12 flex flex-col gap-8 relative z-10">
                            <Link href="/etkinlikler" className="rise-in inline-flex items-center text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md uppercase tracking-wider gap-2 mb-4 w-fit">
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Tüm Etkinlikler
                            </Link>

                            <div className="flex flex-col gap-4">
                                <TypewriterTitle
                                    key={event.id ?? event.slug}
                                    text={event.title}
                                    className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-[1.05] tracking-tight drop-shadow-sm"
                                />
                                <div className="flex flex-wrap gap-3 mt-2">
                                    <span className="ha-tag-chip chip-anim bg-primary/10 text-primary border-primary/20" style={chipAnim(0.15)}>
                                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                        {formatDate(event.date)}
                                    </span>
                                    <span className="ha-tag-chip chip-anim bg-primary/10 text-primary border-primary/20" style={chipAnim(0.3)}>
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        {event.location}
                                    </span>
                                </div>
                            </div>

                            <div className="relative mt-4 rise-in" style={{ animationDelay: '0.3s' }}>
                                <div className="ambient-glow -top-10 -right-10 opacity-50" />
                                <div className="glass-panel glass-shine p-8 md:p-10 relative z-10">
                                    <h3 className="font-headline-sm text-headline-sm text-on-secondary-fixed mb-4">Etkinlik Detayları</h3>
                                    <p className="font-body-lg text-body-lg text-on-surface-variant whitespace-pre-line leading-relaxed mb-6">
                                        {event.description}
                                    </p>

                                    {isPast && (
                                        <div className="mt-8 p-4 bg-secondary/10 border border-secondary/20 rounded-xl flex items-start gap-3">
                                            <span className="material-symbols-outlined text-secondary spin-slow shrink-0">autorenew</span>
                                            <div>
                                                <p className="font-label-md text-secondary mb-1">Arşiv Hazırlanıyor</p>
                                                <p className="font-body-md text-sm text-on-surface-variant">
                                                    Bu etkinliğin fotoğrafları ve özeti hazırlandıkça bu sayfada yayınlanacak.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {!isPast && (
                                        <div className="mt-8 flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                                                </div>
                                                <div>
                                                    <p className="font-label-md text-label-md text-on-secondary-fixed mb-1">Kontenjan</p>
                                                    <p className="font-body-md text-body-md text-on-surface-variant">
                                                        {event.participantCount ? `${event.participantCount} Kişi ile sınırlıdır` : 'Herkesin katılımına açıktır'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>

                    {!isPast && (
                        <div className="fixed bottom-0 left-0 w-full z-40 glass-action-bar py-4 px-gutter shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rise-in" style={{ animationDelay: '0.5s' }}>
                            <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="hidden sm:block">
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Bize Katılın</p>
                                    <p className="font-body-md text-body-md text-on-secondary-fixed font-semibold">
                                        {event.participantCount ? `Kontenjan: ${event.participantCount} Kişi` : 'Kayıtlar Açık'}
                                    </p>
                                </div>
                                <div className="flex w-full sm:w-auto gap-4">
                                    <button onClick={handleShare} className="flex-1 sm:flex-none btn-secondary px-6 py-4 font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                                        <span className="material-symbols-outlined text-[20px]">share</span>
                                        <span className="hidden sm:inline">Paylaş</span>
                                    </button>
                                    {event.applicationUrl ? (
                                        <a href={event.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-[2] sm:flex-none btn-glow px-10 py-4 font-label-md text-label-md uppercase tracking-widest text-lg md:text-xl flex items-center justify-center gap-2 group cursor-pointer">
                                            HEMEN BAŞVUR
                                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </a>
                                    ) : (
                                        <div className="flex-[2] sm:flex-none bg-secondary/20 text-secondary px-10 py-4 rounded-xl font-label-md text-label-md uppercase tracking-widest text-lg md:text-xl flex items-center justify-center gap-2">
                                            Yakında
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}