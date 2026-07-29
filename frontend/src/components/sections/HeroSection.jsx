"use client";

import { useState, useEffect, useRef } from 'react';

// Mobilde arka planın saniyede kaç "%" birim kayacağını belirler.
// backgroundPositionX 0% ile 100% arasında salınıyor (0 = sol kenar görünür, 100 = sağ kenar görünür).
// Değeri büyütürsen kayma hızlanır, küçültürsen yavaşlar.
const BG_PAN_SPEED_PERCENT_PER_SEC = 4;
const BG_PAN_MIN = 7;   // en sola kayınca ulaşacağı yüzde
const BG_PAN_MAX = 90; // en sağa kayınca ulaşacağı yüzde

export default function HeroSection() {
    const [text, setText] = useState('beraber ');
    const [isDeleting, setIsDeleting] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);

    const bgRef = useRef(null);

    const phrases = [
        "beraber proje düzenleyelim",
        "beraber işbirliği kuralım",
        "beraber öğrenelim",
        "beraber eğlenelim"
    ];
    const prefix = "beraber ";

    useEffect(() => {
        let timeout;

        const type = () => {
            const currentPhrase = phrases[phraseIndex];
            const charIndex = text.length;

            if (isWaiting) {
                timeout = setTimeout(() => {
                    setIsWaiting(false);
                    setIsDeleting(true);
                }, 2000);
                return;
            }

            if (isDeleting) {
                setText(currentPhrase.substring(0, charIndex - 1));
                if (charIndex - 1 <= prefix.length) {
                    setIsDeleting(false);
                    setPhraseIndex((prev) => (prev + 1) % phrases.length);
                    timeout = setTimeout(() => { }, 500);
                } else {
                    timeout = setTimeout(type, 50); // deleting speed
                }
            } else {
                setText(currentPhrase.substring(0, charIndex + 1));
                if (charIndex + 1 === currentPhrase.length) {
                    setIsWaiting(true);
                } else {
                    timeout = setTimeout(type, 100); // writing speed
                }
            }
        };

        timeout = setTimeout(type, isDeleting ? 50 : 100);

        return () => clearTimeout(timeout);
    }, [text, isDeleting, phraseIndex, isWaiting]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        let rafId;
        let lastTimestamp = null;
        let position = 50; // başlangıçta ortada
        let direction = 1;  // 1: sağa, -1: sola

        const animate = (timestamp) => {
            if (lastTimestamp === null) lastTimestamp = timestamp;
            const deltaSeconds = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;

            position += direction * BG_PAN_SPEED_PERCENT_PER_SEC * deltaSeconds;

            if (position >= BG_PAN_MAX) {
                position = BG_PAN_MAX;
                direction = -1;
            } else if (position <= BG_PAN_MIN) {
                position = BG_PAN_MIN;
                direction = 1;
            }

            if (bgRef.current) {
                bgRef.current.style.backgroundPositionX = `${position}%`;
            }

            rafId = requestAnimationFrame(animate);
        };

        const startAnimation = () => {
            if (rafId) return;
            lastTimestamp = null;
            rafId = requestAnimationFrame(animate);
        };

        const stopAnimation = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            // Masaüstünde varsayılan (ortalanmış) konuma dön.
            if (bgRef.current) {
                bgRef.current.style.backgroundPositionX = '50%';
            }
        };

        const handleChange = (e) => {
            if (e.matches) {
                startAnimation();
            } else {
                stopAnimation();
            }
        };

        if (mediaQuery.matches) {
            startAnimation();
        }
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            stopAnimation();
        };
    }, []);

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 w-full h-full z-0">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <div
                    ref={bgRef}
                    className="w-full h-full bg-cover object-cover"
                    style={{ backgroundImage: "url('/hero.jpeg')", backgroundPositionY: 'center' }}
                ></div>
            </div>

            <div className="relative z-20 w-full px-0 sm:px-4 flex flex-col items-start -translate-y-32 md:-translate-y-44">
                <div className="max-w-container-max mx-auto px-gutter w-full">
                    <h1 className="font-display-lg text-display-lg-mobile text-[60px] md:text-[80px] lg:text-[100px] xl::text-[120px] text-white mb-6 drop-shadow-2xl leading-none">
                        KTUCEC
                    </h1>
                    <div className="font-headline-sm text-xl md:text-4xl text-white/90 min-h-12">
                        {text}
                        <span className="cursor h-8 md:h-12 align-middle"></span>
                    </div>
                    {/* <button className="mt-12 bg-[var(--color-primary-container)] text-white px-8 py-3 rounded-xl font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary-container/40 hover:scale-105 active:scale-95">
                        Keşfet
                    </button> */}
                </div>
            </div>
        </section>
    );
}