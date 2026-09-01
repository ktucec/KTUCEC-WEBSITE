'use client';
import { useState, useEffect, TouchEvent } from 'react';
import { Maximize2, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useCodewave } from '@/components/context/CodewaveContext';
import Reveal from '@/components/ui/Reveal';

// Public klasöründen çekilecek bağımsız resim dizisi
// Sonradan kendi görsellerini eklerken 'gridClass' değerleri ile puzzle düzenini değiştirebilirsin
const galleryImages = [
    {
        id: 0,
        src: '/codewave/gallery/IMG_4226.JPG',
        alt: 'CODEWAVE Event 1',
        gridClass: 'g-large' 
    },
    {
        id: 1,
        src: '/codewave/gallery/IMG_4296.JPG',
        alt: 'CODEWAVE Event 2',
        gridClass: 'g-tall' 
    },
    {
        id: 2,
        src: '/codewave/gallery/IMG_4309.JPG',
        alt: 'CODEWAVE Event 3',
        gridClass: 'g-normal'
    },
    {
        id: 3,
        src: '/codewave/gallery/IMG_4355.JPG',
        alt: 'CODEWAVE Event 4',
        gridClass: 'g-normal'
    },
    {
        id: 4,
        src: '/codewave/gallery/IMG_4426.JPG',
        alt: 'CODEWAVE Event 5',
        gridClass: 'g-wide' 
    },
    {
        id: 5,
        src: '/codewave/gallery/IMG_4560.JPG',
        alt: 'CODEWAVE Event 6',
        gridClass: 'g-normal'
    }
];

export default function Gallery() {
    const { d, lang } = useCodewave();
    const [light, setLight] = useState<number | null>(null);

    // Mobil Swipe (Dokunma) Kontrolleri için State'ler
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50; // Kaydırma hassasiyeti (piksel)

    const prevImage = () => {
        if (light === null) return;
        setLight((light + galleryImages.length - 1) % galleryImages.length);
    };

    const nextImage = () => {
        if (light === null) return;
        setLight((light + 1) % galleryImages.length);
    };

    // --- PC Klavye Tuş Kontrolleri ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (light === null) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') setLight(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [light]);

    // --- Mobil Swipe (Dokunarak Kaydırma) İşleyicileri ---
    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextImage();
        } else if (isRightSwipe) {
            prevImage();
        }
    };

    return (
        <>
            <section id="gallery" className="section">
                <Reveal>
                    <p className="label">06 / MEMORY BANK</p>
                    <h2 className="gallery-heading">{d.gallery}</h2>
                </Reveal>

                {/* Puzzle / Bento Tarzı Izgara Düzeni */}
                <div className="puzzle-gallery">
                    {galleryImages.map((img, index) => (
                        <Reveal key={img.id}>
                            <article
                                className={`puzzle-card ${img.gridClass}`}
                                onClick={() => setLight(index)}
                            >
                                <div className="puzzle-image-wrapper">
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        className="puzzle-img"
                                        loading="lazy"
                                    />
                                    <div className="puzzle-overlay">
                                        <div className="zoom-badge">
                                            <Maximize2 size={18} />
                                            <span>{lang === 'TR' ? 'BÜYÜT' : 'EXPAND'}</span>
                                        </div>
                                    </div>
                                    <div className="puzzle-border-glow" />
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* FULLSCREEN LIGHTBOX (PC + MOBİL SWIPE DESTEKLİ) */}
            {light !== null && (
                <div
                    className="lightbox-backdrop"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setLight(null)}
                >
                    {/* Üst Bilgi Barı */}
                    <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
                        <span className="lightbox-counter">
                            <Sparkles size={14} className="neon-pink" />
                            {light + 1} / {galleryImages.length}
                        </span>
                        <button
                            className="lightbox-close-btn"
                            onClick={() => setLight(null)}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* PC Sol Ok Butonu */}
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

                    {/* Ana Resim Alanı (Mobil Dokunmatik Alanı) */}
                    <div
                        className="lightbox-content"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <img
                            src={galleryImages[light].src}
                            alt={galleryImages[light].alt}
                            className="lightbox-img"
                        />
                        <p className="lightbox-caption">
                            {galleryImages[light].alt} — CODEWAVE 2026
                        </p>
                    </div>

                    {/* PC Sağ Ok Butonu */}
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

                    {/* Mobilde Alt Kısımda İpucu Yazısı */}
                    <div className="mobile-swipe-hint">
                        <span>{lang === 'TR' ? '← Kaydırarak Geçiş Yapın →' : '← Swipe to Navigate →'}</span>
                    </div>
                </div>
            )}
        </>
    );
}