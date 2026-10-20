'use client';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';
import { SPEAKERS } from '@/editions/2025/data';
import Reveal from '@/editions/2025/components/ui/Reveal';
import SplitText from '@/editions/2025/components/ui/SplitText';
import SpotCard from '@/editions/2025/components/ui/SpotCard';

export default function Speakers() {
    const { d, lang } = useCodewave();

    return (
        <section id="speakers" className="section">
            <Reveal>
                <p className="label">03 / THE VOICES</p>
            </Reveal>
            <h2 className="speakers-heading">
                <SplitText text={d.speakers} />
            </h2>

            <div className="speakers">
                {SPEAKERS.map((s, i) => (
                    <Reveal key={s.name} delay={i * 110} variant="blur">
                        <SpotCard as="article" className="speaker-card" tilt={8}>
                            <div className="portrait-container">
                                <div className="portrait-bg" style={{ backgroundImage: `url(${s.image})` }} />
                                <span className="portrait-num" aria-hidden="true">0{i + 1}</span>
                                <div className="portrait-overlay">
                                    <a
                                        href={s.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-btn"
                                        aria-label={`${s.name} LinkedIn`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                            <rect width="4" height="12" x="2" y="9" />
                                            <circle cx="4" cy="4" r="2" />
                                        </svg>
                                    </a>
                                </div>
                                <div className="portrait-border" />
                            </div>

                            <div className="speaker-info">
                                <p className="label">0{i + 1} / {d.speaker}</p>
                                <h3 className="speaker-name">{s.name}</h3>
                                <span className="speaker-role">{s.role[lang]}</span>
                                <small className="speaker-company">{s.company}</small>
                            </div>
                        </SpotCard>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
