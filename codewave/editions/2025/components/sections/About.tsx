'use client';
import { useState } from 'react';
import { Terminal } from 'lucide-react';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';
import Reveal from '@/editions/2025/components/ui/Reveal';
import SplitText from '@/editions/2025/components/ui/SplitText';
import ScrollWords from '@/editions/2025/components/ui/ScrollWords';

export default function About() {
    const { d } = useCodewave();

    // 3B eğim terminali (fare + dokunmatik)
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const setFrom = (clientX: number, clientY: number, el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        setTilt({ x: ((clientY - rect.top - cy) / cy) * -12, y: ((clientX - rect.left - cx) / cx) * 12 });
    };

    return (
        <section id="about" className="section about">
            <div>
                <Reveal>
                    <p className="label">01 / KTUCEC</p>
                </Reveal>
                <h2 className="about-heading">
                    <SplitText text={d.about} mode="words" />
                </h2>
                <Reveal variant="clip" delay={200}>
                    <div className="line" />
                </Reveal>
            </div>

            <div className="about-body">
                <ScrollWords text={d.aboutText} className="about-text" />

                <Reveal delay={150}>
                    <div
                        className="terminal terminal-tilt"
                        onMouseMove={(e) => setFrom(e.clientX, e.clientY, e.currentTarget)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => {
                            setTilt({ x: 0, y: 0 });
                            setIsHovered(false);
                        }}
                        onTouchStart={() => setIsHovered(true)}
                        onTouchMove={(e) => e.touches[0] && setFrom(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)}
                        onTouchEnd={() => {
                            setTilt({ x: 0, y: 0 });
                            setIsHovered(false);
                        }}
                        style={{
                            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
                            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
                        }}
                    >
                        <div className="terminal-bar">
                            <span className="dots"><i /><i /><i /></span>
                            <Terminal size={14} /> ktucec@codewave:~
                        </div>
                        <pre>
                            <span className="t-line" style={{ '--l': 0 } as React.CSSProperties}>{'{'}</span>
                            <span className="t-line" style={{ '--l': 1 } as React.CSSProperties}>{'  "founded": 2006,'}</span>
                            <span className="t-line" style={{ '--l': 2 } as React.CSSProperties}>{'  "mission": "build the future",'}</span>
                            <span className="t-line" style={{ '--l': 3 } as React.CSSProperties}>{'  "status": "always shipping"'}</span>
                            <span className="t-line" style={{ '--l': 4 } as React.CSSProperties}>{'}'}<b className="typewriter-cursor" /></span>
                        </pre>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
