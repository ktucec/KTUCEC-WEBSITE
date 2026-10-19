"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ScrambleText from '@/components/fx/ScrambleText';
import { getCurrentEvents } from '@/services/events';

const phrases = [
    "beraber proje düzenleyelim",
    "beraber işbirliği kuralım",
    "beraber öğrenelim",
    "beraber eğlenelim"
];
const prefix = "beraber ";

// Yazıp silen alt başlık (mevcut davranış korunuyor)
function useTypewriter() {
    const [text, setText] = useState(prefix);
    const [isDeleting, setIsDeleting] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        let timeout;
        const currentPhrase = phrases[phraseIndex];
        const charIndex = text.length;

        if (isWaiting) {
            timeout = setTimeout(() => {
                setIsWaiting(false);
                setIsDeleting(true);
            }, 2000);
        } else if (isDeleting) {
            timeout = setTimeout(() => {
                setText(currentPhrase.substring(0, charIndex - 1));
                if (charIndex - 1 <= prefix.length) {
                    setIsDeleting(false);
                    setPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }, 45);
        } else {
            timeout = setTimeout(() => {
                setText(currentPhrase.substring(0, charIndex + 1));
                if (charIndex + 1 === currentPhrase.length) setIsWaiting(true);
            }, 90);
        }
        return () => clearTimeout(timeout);
    }, [text, isDeleting, phraseIndex, isWaiting]);

    return text.slice(prefix.length);
}

function pad(n) {
    return String(n).padStart(2, '0');
}

// Sıradaki etkinliğe canlı geri sayım yapan bilet kartı
function NextEventTicket() {
    const [event, setEvent] = useState(null);
    const [now, setNow] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getCurrentEvents()
            .then((res) => {
                const list = res?.data || [];
                const sorted = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
                if (!cancelled && sorted.length) setEvent(sorted[0]);
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!event) return;
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [event]);

    if (!event || now === null) return null;

    // Etkinlik tarihi gün olarak geliyor; Türkiye saatiyle 10:00'u başlangıç kabul ediyoruz
    const target = new Date(`${event.date}T10:00:00+03:00`).getTime();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const dateLabel = new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

    const units = [
        { v: days, l: 'gün' },
        { v: hours, l: 'saat' },
        { v: mins, l: 'dk' },
        { v: secs, l: 'sn' },
    ];

    return (
        <Link
            href={`/etkinlikler/${event.slug}`}
            className="ticket group block w-full sm:w-[340px] rounded-[22px] bg-white/10 backdrop-blur-xl border border-white/20 text-white p-5 pb-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 hover:rotate-[-1.5deg] rise-in"
            style={{ animationDelay: '1.4s' }}
        >
            <div className="flex items-center gap-2 text-[13px] text-white/75">
                <span className="ping-dot !w-2 !h-2" aria-hidden="true" />
                Sıradaki etkinlik
            </div>
            <p className="mt-2 font-display text-[1.45rem] font-bold leading-[1.1] tracking-[-0.02em] line-clamp-2">
                {event.title}
            </p>
            <p className="mt-1 text-sm text-white/70 truncate">{dateLabel}, {event.location}</p>

            <div className="ticket-perf" aria-hidden="true" />

            <div className="mt-7 grid grid-cols-4 gap-1 text-center" aria-label={`${days} gün ${hours} saat kaldı`}>
                {units.map((u) => (
                    <div key={u.l}>
                        <span key={u.v} className="tick-digit font-display text-[1.7rem] font-bold tabular-nums leading-none">
                            {pad(u.v)}
                        </span>
                        <span className="block mt-1 text-[11px] text-white/60">{u.l}</span>
                    </div>
                ))}
            </div>
        </Link>
    );
}

export default function HeroSection() {
    const typed = useTypewriter();
    const sectionRef = useRef(null);
    const lensRef = useRef(null);
    const ringRef = useRef(null);
    const contentRef = useRef(null);
    const bgRef = useRef(null);

    // Fotoğraf kırmızı duotone; mouse'un olduğu yerde gerçek renkli hali bir mercekle açılır.
    // Dokunmatik cihazlarda mercek kendi kendine yavaşça dolaşır.
    useEffect(() => {
        const section = sectionRef.current;
        const lens = lensRef.current;
        const ring = ringRef.current;
        if (!section || !lens || !ring) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const pos = { x: section.clientWidth * 0.68, y: section.clientHeight * 0.45 };
        const target = { ...pos };
        let radius = 0;
        let targetRadius = finePointer ? 0 : 110;
        let rafId;
        let start = performance.now();

        const onMove = (e) => {
            const r = section.getBoundingClientRect();
            target.x = e.clientX - r.left;
            target.y = e.clientY - r.top;
            targetRadius = 170;
        };
        const onLeave = () => { targetRadius = 0; };

        const loop = (now) => {
            if (!finePointer) {
                const t = (now - start) / 1000;
                target.x = section.clientWidth * (0.5 + 0.32 * Math.sin(t * 0.35));
                target.y = section.clientHeight * (0.42 + 0.18 * Math.sin(t * 0.53 + 1));
            }
            pos.x += (target.x - pos.x) * 0.14;
            pos.y += (target.y - pos.y) * 0.14;
            radius += (targetRadius - radius) * 0.12;

            // Fotoğraf %4 taşmalı yerleştirildiği için koordinatları ona göre kaydır
            const ox = section.clientWidth * 0.04;
            const oy = section.clientHeight * 0.04;
            lens.style.setProperty('--lx', `${pos.x + ox}px`);
            lens.style.setProperty('--ly', `${pos.y + oy}px`);
            lens.style.setProperty('--lr', `${radius}px`);
            ring.style.transform = `translate(${pos.x - radius}px, ${pos.y - radius}px)`;
            ring.style.width = ring.style.height = `${radius * 2}px`;
            ring.style.opacity = radius > 4 ? 1 : 0;
            rafId = requestAnimationFrame(loop);
        };

        if (finePointer) {
            section.addEventListener('pointermove', onMove);
            section.addEventListener('pointerleave', onLeave);
        }
        rafId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(rafId);
            section.removeEventListener('pointermove', onMove);
            section.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    // Hafif paralaks: aşağı kaydırınca yazı yukarı kayıp söner, fotoğraf yakınlaşır
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let ticking = false;
        const update = () => {
            const y = Math.min(window.scrollY, window.innerHeight);
            const p = y / window.innerHeight;
            if (contentRef.current) {
                contentRef.current.style.transform = `translateY(${y * -0.18}px)`;
                contentRef.current.style.opacity = String(1 - p * 1.1);
            }
            if (bgRef.current) bgRef.current.style.transform = `scale(${1 + p * 0.12})`;
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#070d18] text-white"
        >
            {/* Fotoğraf katmanları */}
            <div ref={bgRef} className="absolute inset-0 will-change-transform" aria-hidden="true">
                <div className="hero-duo" style={{ backgroundImage: "url('/hero.jpeg')" }} />
                <div className="hero-duo-red" />
                <div ref={lensRef} className="hero-lens" style={{ backgroundImage: "url('/hero.jpeg')" }} />
            </div>
            <div className="hero-duo-tint" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070d18] via-[#070d18]/30 to-transparent" aria-hidden="true" />
            <div ref={ringRef} className="hero-lens-ring" style={{ opacity: 0 }} aria-hidden="true" />

            {/* İçerik */}
            <div
                ref={contentRef}
                className="relative z-10 h-full max-w-container-max mx-auto px-5 sm:px-gutter flex flex-col justify-end pb-24 md:pb-20 will-change-transform"
            >
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
                    <div className="min-w-0">
                        <p className="flex items-center gap-2.5 text-[15px] text-white/80 rise-in" style={{ animationDelay: '0.1s' }}>
                            <span className="ping-dot" aria-hidden="true" />
                            KTÜ Bilgisayar Mühendisliği Kulübü
                        </p>

                        <h1 className="hero-title mt-4 -ml-[0.04em] select-none">
                            <ScrambleText text="KTUCEC" />
                        </h1>

                        <p className="mt-5 font-display text-[1.45rem] sm:text-3xl md:text-[2.4rem] font-semibold tracking-[-0.02em] min-h-[1.3em]" aria-live="polite">
                            <span className="text-[#ff4a4f]">Beraber </span>
                            <span className="text-white/90">{typed}</span>
                            <span className="type-cursor" aria-hidden="true" />
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3 rise-in" style={{ animationDelay: '0.9s' }}>
                            <Link href="/etkinlikler" className="btn btn-primary">
                                Etkinlikleri gör
                                <span className="material-symbols-outlined btn-icon text-[20px]" aria-hidden="true">arrow_outward</span>
                            </Link>
                            <Link href="/iletisim" className="btn btn-ghost btn-on-dark">
                                Bize yaz
                            </Link>
                        </div>
                    </div>

                    <NextEventTicket />
                </div>
            </div>

            {/* Aşağı kaydır işareti */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/50" aria-hidden="true">
                <div className="w-6 h-10 rounded-full border-2 border-white/35 flex justify-center pt-2">
                    <span className="scroll-cue-dot w-1 h-2 rounded-full bg-white/80" />
                </div>
            </div>
        </section>
    );
}
