'use client';
import { createElement, type CSSProperties } from 'react';
import { Users, CalendarDays, Code2, Network } from 'lucide-react';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';
import Reveal from '@/editions/2025/components/ui/Reveal';
import SplitText from '@/editions/2025/components/ui/SplitText';
import SpotCard from '@/editions/2025/components/ui/SpotCard';
import Counter from '@/editions/2025/components/ui/Counter';

// KTUCEC genel rakamları
const statValues = [5320, 370, 9, 8];

export default function Impact() {
    const { d } = useCodewave();

    return (
        <section id="impact" className="section">
            <Reveal>
                <p className="label">02 / IMPACT LOG</p>
            </Reveal>
            <h2 className="impact-heading">
                <SplitText text={d.impactHeading[0]} /> <em><SplitText text={d.impactHeading[1]} delay={250} /></em>
            </h2>

            <div className="stats">
                {statValues.map((v, i) => (
                    <Reveal key={i} delay={i * 90}>
                        <SpotCard className="stat">
                            <div className="stat-icon">{createElement([Users, CalendarDays, Code2, Network][i], { size: 20 })}</div>
                            <strong>
                                <Counter value={v} />
                                <sup>{i === 1 ? '+' : ''}</sup>
                            </strong>
                            <span>{d.stats[i]}</span>
                            <div className="ring" />
                        </SpotCard>
                    </Reveal>
                ))}
            </div>

            <div className="split-cards">
                <Reveal>
                    <SpotCard as="article" className="split-card">
                        <p className="label">CODEWAVE / 2025</p>
                        <h3>
                            {d.whatIsTitle[0]} <em>{d.whatIsTitle[1]}</em>
                        </h3>
                        <p className="split-text">{d.whatIsText}</p>
                        <div className="equalizer" aria-hidden="true">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <i key={i} style={{ '--i': i } as CSSProperties} />
                            ))}
                        </div>
                    </SpotCard>
                </Reveal>

                <Reveal delay={120}>
                    <SpotCard as="article" className="split-card accent-card">
                        <p className="label accent-black">2025 / FIRST WAVE</p>
                        <h3 className="accent-black">
                            180+ {d.firstWaveTitle}
                            <em>IMPACT</em>
                        </h3>
                        <p className="split-text accent-black text-bold">{d.firstWaveText}</p>
                        <div className="mini-metrics">
                            <b className="accent-black">
                                180+<small className="accent-black">{d.firstWaveMetrics[0]}</small>
                            </b>
                            <b className="accent-black">
                                4<small className="accent-black">{d.firstWaveMetrics[1]}</small>
                            </b>
                            <b className="accent-black">
                                100%<small className="accent-black">{d.firstWaveMetrics[2]}</small>
                            </b>
                        </div>
                    </SpotCard>
                </Reveal>
            </div>
        </section>
    );
}
