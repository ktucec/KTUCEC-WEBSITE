'use client';
import { useState, useEffect, TouchEvent } from 'react';
import { Maximize2, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';
import { GALLERY } from '@/editions/2025/data';
import Reveal from '@/editions/2025/components/ui/Reveal';
import SplitText from '@/editions/2025/components/ui/SplitText';

export default function Gallery() {
    const { d } = useCodewave();
    const [light, setLight] = useState<number | null>(null);

    // Mobil kaydırma (swipe)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const prevImage = () => {
        if (light === null) return;
        setLight((light + GALLERY.length - 1) % GALLERY.length);
    };
    const nextImage = () => {
        if (light === null) return;
        setLight((light + 1) % GALLERY.length);
    };

    // Klavye: ok tuşları + Esc; açıkken sayfa kaymasın
    useEffect(() => {
        if (light === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') setLight((l) => (l === null ? l : (l + 1) % GALLERY.length));
            if (e.key === 'ArrowLeft') setLight((l) => (l === null ? l : (l + GALLERY.length - 1) % GALLERY.length));
            if (e.key === 'Escape') setLight(null);
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [light]);

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e: TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) nextImage();
        else if (distance < -minSwipeDistance) prevImage();
    };

    return (
        <>
            <section id="gallery" className="section">
                <Reveal>
                    <p className="label">05 / MEMORY BANK</p>
                </Reveal>
                <h2 className="gallery-heading">
                    <SplitText text={d.gallery} />
                </h2>

                <div className="puzzle-gallery">
                    {GALLERY.map((img, index) => (
                        <Reveal key={img.src} className={img.gridClass} delay={index * 80} variant="scale">
                            <article className="puzzle-card" onClick={() => setLight(index)}>
                                <div className="puzzle-image-wrapper">
                                    <img src={img.src} alt={img.alt} className="puzzle-img" loading="lazy" />
                                    <div className="puzzle-overlay">
                                        <div className="zoom-badge">
                                            <Maximize2 size={18} />
                                            <span>{d.expand}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </section>

            {light !== null && (
                <div className="lightbox-backdrop" role="dialog" aria-modal="true" onClick={() => setLight(null)}>
                    <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
                        <span className="lightbox-counter">
                            <Sparkles size={14} className="neon-pink" />
                            {light + 1} / {GALLERY.length}
                        </span>
                        <button className="lightbox-close-btn" onClick={() => setLight(null)} aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>

                    <button
                        className="lightbox-nav-btn prev-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <div
                        className="lightbox-content"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <img key={light} src={GALLERY[light].src} alt={GALLERY[light].alt} className="lightbox-img" />
                        <p className="lightbox-caption">{GALLERY[light].alt}</p>
                        <div className="lightbox-dots" aria-hidden="true">
                            {GALLERY.map((_, i) => (
                                <i key={i} className={i === light ? 'on' : ''} />
                            ))}
                        </div>
                    </div>

                    <button
                        className="lightbox-nav-btn next-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        aria-label="Next image"
                    >
                        <ChevronRight size={28} />
                    </button>

                    <div className="mobile-swipe-hint">
                        <span>{d.swipe}</span>
                    </div>
                </div>
            )}
        </>
    );
}
