'use client';
import { useEffect, useRef, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';
import SplitText from '@/editions/2025/components/ui/SplitText';
import Counter from '@/editions/2025/components/ui/Counter';
import Magnetic from '@/editions/2025/components/ui/Magnetic';

const HERO_STATS = [180, 4, 5];

export default function Hero() {
    const { d, nav } = useCodewave();
    const root = useRef<HTMLElement>(null);

    // Kaydırırken içerik yavaşça yukarı çekilip solar; fareyle sağdaki küre hafifçe kayar.
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const p = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.9), 0), 1);
                el.style.setProperty('--hp', String(p));
            });
        };
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            const r = el.getBoundingClientRect();
            el.style.setProperty('--ox', String(((e.clientX - r.left) / r.width - 0.5) * 2));
            el.style.setProperty('--oy', String(((e.clientY - r.top) / r.height - 0.5) * 2));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        el.addEventListener('pointermove', onMove);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            el.removeEventListener('pointermove', onMove);
        };
    }, []);

    return (
        <section id="hero" ref={root} className="hero section">
            <div className="hero-inner">
                <div className="eyebrow">
                    <i /> {d.badge}
                </div>
                <p className="kicker">TRABZON / 2025</p>

                <h1 aria-label="CODEWAVE 2025">
                    <SplitText text="CODE" mode="chars" as="span" inView={false} delay={150} step={70} className="h1-code" />
                    <SplitText text="WAVE" mode="chars" as="span" inView={false} delay={450} step={70} className="h1-wave" />
                    <b className="h1-year" aria-hidden="true">
                        <SplitText text="2025" mode="chars" as="span" inView={false} delay={900} step={90} />
                    </b>
                </h1>

                <SplitText text={d.title} mode="words" as="p" inView={false} delay={1100} step={38} className="hero-copy" />

                <div className="actions">
                    <Magnetic>
                        <button className="btn btn-primary" onClick={() => nav(1)}>
                            <span>{d.explore}</span>
                            <ArrowDown size={16} />
                        </button>
                    </Magnetic>
                    <Magnetic>
                        <a className="btn btn-ghost" href="/">
                            <span>{d.nextEdition}</span>
                            <ArrowUpRight size={16} />
                        </a>
                    </Magnetic>
                </div>

                <div className="hero-stats">
                    {HERO_STATS.map((v, i) => (
                        <div key={i} style={{ '--i': i } as CSSProperties}>
                            <strong>
                                <Counter value={v} suffix={i === 0 ? '+' : ''} duration={2200} />
                            </strong>
                            <span>{d.heroStats[i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sağ taraf: dalga küresi */}
            <div className="orb" aria-hidden="true">
                <div className="orb-glow" />
                <i className="orb-ring r1" />
                <i className="orb-ring r2" />
                <i className="orb-ring r3" />
                <div className="orb-core">
                    <svg className="orb-wave w1" viewBox="0 0 1200 200" preserveAspectRatio="none">
                        <path d="M0 100 Q150 20 300 100 T600 100 T900 100 T1200 100" />
                    </svg>
                    <svg className="orb-wave w2" viewBox="0 0 1200 200" preserveAspectRatio="none">
                        <path d="M0 100 Q150 170 300 100 T600 100 T900 100 T1200 100" />
                    </svg>
                    <svg className="orb-wave w3" viewBox="0 0 1200 200" preserveAspectRatio="none">
                        <path d="M0 100 Q100 40 200 100 T400 100 T600 100 T800 100 T1000 100 T1200 100" />
                    </svg>
                    <span className="orb-year">2025</span>
                </div>
                <span className="orb-chip c1">FIRST WAVE</span>
                <span className="orb-chip c2">180+ {d.heroStats[0]}</span>
                <span className="orb-chip c3">4 {d.heroStats[1]}</span>
            </div>

            <div className="scrollmark">
                <span className="scroll-line" />
                {d.scrollDiscover}
            </div>
        </section>
    );
}
