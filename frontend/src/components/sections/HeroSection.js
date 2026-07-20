"use client";

import { useState, useEffect } from 'react';

export default function HeroSection() {
    const [text, setText] = useState('beraber ');
    const [isDeleting, setIsDeleting] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);

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
    }, [text, isDeleting, phraseIndex, isWaiting]); // Dependency'leri ekliyoruz

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 w-full h-full z-0">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <div
                    className="w-full h-full bg-cover bg-center object-cover"
                    style={{ backgroundImage: "url('/hero.jpeg')" }}
                ></div>
            </div>

            <div className="relative z-20 w-full px-4 flex flex-col items-start">
                <div className="max-w-container-max mx-auto px-gutter w-full">
                    <h1 className="font-display-lg text-display-lg-mobile text-[60px] md:text-[80px] lg:text-[100px] xl::text-[120px] text-white mb-6 drop-shadow-2xl leading-none">
                        KTUCEC
                    </h1>
                    <div className="font-headline-sm text-2xl md:text-4xl text-white/90 h-12 flex items-center">
                        <span>{text}</span>
                        <span className="cursor h-8 md:h-12"></span>
                    </div>
                    <button className="mt-12 bg-[var(--color-primary-container)] text-white px-8 py-3 rounded-xl font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary-container/40 hover:scale-105 active:scale-95">
                        Keşfet
                    </button>
                </div>
            </div>
        </section>
    );
}