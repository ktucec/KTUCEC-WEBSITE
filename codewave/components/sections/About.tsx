'use client';
import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { useCodewave } from '@/components/context/CodewaveContext';
import Reveal from '@/components/ui/Reveal';

export default function About() {
    const { d, lang } = useCodewave();

    // --- 1. TYPEWRITER ---
    const [displayText, setDisplayText] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        setDisplayText('');
        setHasStarted(false);
    }, [d.aboutText, lang]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.2 }
        );

        if (textRef.current) {
            observer.observe(textRef.current);
        }

        return () => observer.disconnect();
    }, [hasStarted, lang]);

    useEffect(() => {
        if (!hasStarted) return;

        let currentIndex = 0;
        const fullText = d.aboutText;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 12);

        return () => clearInterval(interval);
    }, [hasStarted, d.aboutText]);

    // --- 2. 3D TILT (Masaüstü Mouse + Mobil Dokunmatik) ---
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Mouse Hareketi (Masaüstü)
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -14;
        const rotateY = ((x - centerX) / centerX) * 14;

        setTilt({ x: rotateX, y: rotateY });
    };

    // Touch / Dokunma Hareketi (Mobil)
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!e.touches[0]) return;
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -14;
        const rotateY = ((x - centerX) / centerX) * 14;

        setTilt({ x: rotateX, y: rotateY });
    };

    const handleStart = () => setIsHovered(true);
    const handleEnd = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    };

    return (
        <section id="about" className="section about">
            <Reveal>
                <p className="label">01 / KTUCEC</p>
                <h2 className="about-heading">{d.about}</h2>
                <div className="line" />
            </Reveal>

            <Reveal className="about-body">
                <p ref={textRef} className="about-text-container">
                    {displayText}
                    {hasStarted && displayText.length < d.aboutText.length && (
                        <span className="typewriter-cursor" />
                    )}
                </p>

                {/* 3D Tilt Terminal (Hem PC Hem Mobil Destekli) */}
                <div
                    className="terminal terminal-tilt"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleStart}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleEnd}
                    style={{
                        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
                        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out'
                    }}
                >
                    <div>
                        <Terminal size={15} /> ktucec@codewave:~
                    </div>
                    <pre>{`{\n  "founded": 2006,\n  "mission": "build the future",\n  "status": "always shipping"\n}`}</pre>
                </div>
            </Reveal>
        </section>
    );
}