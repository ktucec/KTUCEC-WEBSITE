'use client';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';
import { SPONSORS } from '@/editions/2025/data';
import Reveal from '@/editions/2025/components/ui/Reveal';
import SplitText from '@/editions/2025/components/ui/SplitText';

// Akış kesintisiz olsun diye liste tekrarlanır; iki satır zıt yönde kayar.
const loop = Array(3).fill(SPONSORS).flat();

function Row({ reverse = false }: { reverse?: boolean }) {
    return (
        <div className={`sponsor-row${reverse ? ' is-reverse' : ''}`}>
            <div className="sponsor-track">
                {[0, 1].map((k) => (
                    <div key={k} className="sponsor-set" aria-hidden={k === 1}>
                        {loop.map((s, i) => (
                            <div key={i} className="sponsor-badge">
                                <span className="sponsor-name">{s}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Sponsors() {
    const { d } = useCodewave();

    return (
        <section id="sponsors" className="marquee-section">
            <div className="section sponsors-head">
                <Reveal>
                    <p className="label">04 / BACKED BY</p>
                </Reveal>
                <h2 className="sponsors-heading">
                    <SplitText text={d.sponsors} />
                </h2>
            </div>

            <div className="premium-marquee-wrapper">
                <div className="marquee-fade-left" />
                <div className="marquee-fade-right" />
                <Row />
                <Row reverse />
            </div>
        </section>
    );
}
