'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { dayEndsAtMs, startsAtMs } from '@/editions/2026/event';
import { useLang } from './i18n/LanguageProvider';

type Phase = { kind: 'before'; parts: [number, number, number, number] } | { kind: 'live' } | { kind: 'done' };

function readPhase(now: number): Phase {
    const diff = startsAtMs() - now;
    if (diff <= 0) return now < dayEndsAtMs() ? { kind: 'live' } : { kind: 'done' };
    const s = Math.floor(diff / 1000);
    return { kind: 'before', parts: [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60] };
}

// Her basamak değiştiğinde yukarıdan aşağı kayarak yenisiyle yer değiştirir (yalnızca o basamak).
function Digits({ value, width }: { value: number | null; width: number }) {
    const reduce = useReducedMotion();
    const text = value === null ? '–'.repeat(width) : String(value).padStart(width, '0');
    return (
        <span className="dash-num tnum">
            {text.split('').map((ch, i) => (
                <span key={i} className="relative inline-block">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                            key={ch}
                            className="inline-block"
                            initial={reduce ? { opacity: 0 } : { y: '-100%', opacity: 0, filter: 'blur(4px)' }}
                            animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                            exit={reduce ? { opacity: 0 } : { y: '100%', opacity: 0, filter: 'blur(4px)' }}
                            transition={{ duration: reduce ? 0.12 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {ch}
                        </motion.span>
                    </AnimatePresence>
                </span>
            ))}
        </span>
    );
}

// Yalnızca bu bileşen her saniye yeniden çizilir. Sunucu çıktısı sabit tire yer tutucularıdır; tarih ve
// saat panelin üstünde düz metin olarak zaten yazılıdır.
export default function Countdown() {
    const { d } = useLang();
    const [phase, setPhase] = useState<Phase | null>(null);

    useEffect(() => {
        let timer = 0;
        const tick = () => {
            const now = Date.now();
            const next = readPhase(now);
            setPhase(next);
            timer = window.setTimeout(tick, next.kind === 'before' ? 1000 - (now % 1000) + 5 : 60_000);
        };
        tick();
        return () => window.clearTimeout(timer);
    }, []);

    if (phase && phase.kind !== 'before') {
        return (
            <p className="rounded-[18px] border border-[var(--line)] px-4 py-5 text-lg font-light" role="status">
                {phase.kind === 'live' ? d.countdownLive : d.countdownDone}
            </p>
        );
    }

    const parts = phase?.parts ?? null;
    return (
        <div role="timer" aria-label={parts ? d.countdownA11y(parts[0], parts[1], parts[2]) : d.countdownLabel}>
            <div className="dash" aria-hidden="true">
                {d.units.map((unit, i) => (
                    <div className="dash-cell" key={unit}>
                        <Digits value={parts ? parts[i] : null} width={i === 0 && parts && parts[0] >= 100 ? 3 : 2} />
                        <span className="dash-label">{unit}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
