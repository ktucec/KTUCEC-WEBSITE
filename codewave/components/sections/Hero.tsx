'use client';
import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useCodewave } from '@/components/context/CodewaveContext';

export default function Hero() {
    const { d, lang, nav } = useCodewave();

    // Typewriter Mekanizması
    const [displayText, setDisplayText] = useState('');
    useEffect(() => {
        setDisplayText('');
        let currentIndex = 0;
        const fullText = d.title;

        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 35);

        return () => clearInterval(interval);
    }, [d.title, lang]);

    // Dinamik Geri Sayım Mekanizması (8 Aralık 2026 10:00 TSİ)
    const [timeLeft, setTimeLeft] = useState<{
        days: string;
        hours: string;
        minutes: string;
        seconds: string;
    }>({
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
    });

    useEffect(() => {
        const targetDate = new Date('2026-12-08T10:00:00+03:00').getTime();

        const calculateTime = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / (1000 * 60)) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({
                days: String(days).padStart(2, '0'),
                hours: String(hours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0'),
            });
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section id="hero" className="hero section">
            <div className="eyebrow"><i /> {d.badge}</div>
            <p className="kicker">TRABZON / 2026</p>

            {/* Bozuk Neon Efektli Başlık */}
            <h1>
                <span>CODE</span>
                <em className="neon-flicker">WAVE</em>
                <b>2026</b>
            </h1>

            {/* Dinamik Typewriter Metni */}
            <div className="hero-copy">
                <p>
                    {displayText}
                    <span className="typewriter-cursor" />
                </p>
            </div>

            {/* Aksiyon Grubu */}
            <div className="actions">
                <div className="btn-group">
                    <button disabled className="btn btn-disabled" aria-disabled="true">
                        {d.register}<ArrowUpRight size={18} />
                    </button>
                    <span className="reg-note">{d.regClosedNote}</span>
                </div>

                <div>
                    <button className="btn ghost" onClick={() => nav(1)}>
                        {d.explore}<ArrowDown size={17} />
                    </button>
                </div>
            </div>

            {/* Canlı Geri Sayım */}
            <div className="countdown">
                <div>
                    <strong>{timeLeft.days}</strong>
                    <span>{d.countdownLabels[0]}</span>
                </div>
                <div>
                    <strong>{timeLeft.hours}</strong>
                    <span>{d.countdownLabels[1]}</span>
                </div>
                <div>
                    <strong>{timeLeft.minutes}</strong>
                    <span>{d.countdownLabels[2]}</span>
                </div>
                <div>
                    <strong>{timeLeft.seconds}</strong>
                    <span>{d.countdownLabels[3]}</span>
                </div>
            </div>

            {/* Keşfet */}
            <div className="scrollmark">
                {d.scrollDiscover} <ArrowDown size={14} />
            </div>
        </section>
    );
}