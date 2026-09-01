'use client';
import { createElement, useState, useEffect, useRef } from 'react';
import { Users, CalendarDays, Code2, Radio, Network, Sparkles, Loader2 } from 'lucide-react';
import { useCodewave } from '@/components/context/CodewaveContext';
import Reveal from '@/components/ui/Reveal';
import Counter from '@/components/ui/Counter';

const statValues = [5320, 370, 9, 201, 12, 8];

// Tekrar kullanılabilir Akıllı Typewriter Bileşeni
function AnimatedTypewriter({ text, className = "" }: { text: string, className?: string }) {
    const [displayText, setDisplayText] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        setDisplayText('');
        setHasStarted(false);
    }, [text]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.2 }
        );
        if (textRef.current) observer.observe(textRef.current);
        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayText(text.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 15); // Daktilo hızı
        return () => clearInterval(interval);
    }, [hasStarted, text]);

    return (
        <p ref={textRef} className={`typewriter-container ${className}`}>
            {displayText}
            {hasStarted && displayText.length < text.length && (
                <span className="typewriter-cursor" />
            )}
        </p>
    );
}

export default function Impact() {
    const { d, lang } = useCodewave();

    return (
        <section id="impact" className="section">
            <Reveal>
                <p className="label">02 / IMPACT LOG</p>
                <h2 className="impact-heading">{d.impactHeading[0]} <em>{d.impactHeading[1]}</em></h2>
            </Reveal>

            <div className="stats">
                {statValues.map((v, i) => (
                    <Reveal key={v}>
                        <div className="stat hover-lift">
                            <div className="stat-icon">
                                {createElement([Users, CalendarDays, Code2, Radio, Network, Sparkles][i], { size: 20 })}
                            </div>
                            <strong><Counter value={v} /><sup>{i === 1 ? '+' : ''}</sup></strong>
                            <span>{d.stats[i]}</span>
                            <div className="ring" />
                        </div>
                    </Reveal>
                ))}
            </div>

            <div className="split-cards">
                <Reveal>
                    <article className="hover-lift">
                        <p className="label">CODEWAVE / 2026</p>
                        <h3>{d.whatIsTitle[0]} <em>{d.whatIsTitle[1]}</em></h3>

                        <AnimatedTypewriter
                            text={lang === 'TR'
                                ? 'Bilgisayar ve yazılım ekosistemine katılmaya hazırlanan yetenekleri sektörün öncü profesyonelleriyle bir araya getiren prestijli bir zirve.'
                                : 'A prestigious summit connecting emerging software talent with leading industry professionals.'}
                        />

                        {/* Animasyonlu Yükleniyor Metni (Güncellendi) */}
                        <div className="loading-pulse-wrapper">
                            <Loader2 className="spinner-icon" size={16} />
                            <span className="loading-pulse">
                                {lang === 'TR' ? 'Yükleniyor' : 'LOADING'}
                                <span className="loading-dots"></span>
                            </span>
                        </div>
                    </article>
                </Reveal>

                <Reveal>
                    <article className="accent-card hover-lift">
                        <p className="label accent-black">2025 / FIRST WAVE</p>
                        <h3 className="accent-black">180+ {lang === 'TR' ? 'KATILIMCI' : 'PARTICIPANTS'}<em>IMPACT</em></h3>

                        <AnimatedTypewriter
                            className="accent-black text-bold"
                            text={lang === 'TR'
                                ? 'İlk zirvemizde bölgesel çapta büyük bir etki yarattık.'
                                : 'Our first summit created a major regional impact.'}
                        />

                        <div className="mini-metrics">
                            <b className="accent-black">
                                180+
                                <small className="accent-black">{d.firstWaveMetrics[0]}</small>
                            </b>
                            <b className="accent-black">
                                4
                                <small className="accent-black">{d.firstWaveMetrics[1]}</small>
                            </b>
                            <b className="accent-black">
                                100%
                                <small className="accent-black">{d.firstWaveMetrics[2]}</small>
                            </b>
                        </div>
                    </article>
                </Reveal>
            </div>
        </section>
    );
}