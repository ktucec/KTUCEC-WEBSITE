'use client';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const WORD = 'CODEWAVE·2026';

// Oturumun ilk açılışında ~1.3 sn'lik perde: harfler belirir, ince bir çizgi dolar, perde yukarı silinir.
// Görüldüyse (sessionStorage) ya da hareket azaltma açıksa hiç gösterilmez. Bitince 'cw:intro' olayı yayınlanır.
export function onIntroDone(cb: () => void) {
    const html = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || html.classList.contains('intro-seen') || html.dataset.intro === 'done') {
        cb();
        return () => {};
    }
    const handler = () => cb();
    window.addEventListener('cw:intro', handler, { once: true });
    const safety = window.setTimeout(cb, 2600); // perde herhangi bir nedenle takılırsa içerik beklemez
    return () => {
        window.removeEventListener('cw:intro', handler);
        window.clearTimeout(safety);
    };
}

export default function Intro() {
    const root = useRef<HTMLDivElement>(null);
    const [gone, setGone] = useState(false);

    useGSAP(
        () => {
            const html = document.documentElement;
            const finish = () => {
                html.dataset.intro = 'done';
                try {
                    sessionStorage.setItem('cw26-intro', '1');
                } catch {
                    // Depolama yoksa perde her açılışta görünür; sorun değil.
                }
                window.dispatchEvent(new Event('cw:intro'));
                setGone(true);
            };
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (html.classList.contains('intro-seen') || reduce) {
                finish();
                return;
            }
            gsap.timeline({ onComplete: finish })
                .from('.intro-word span', { yPercent: 120, opacity: 0, duration: 0.6, stagger: 0.025, ease: 'expo.out' })
                .to('.intro-bar i', { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0.1)
                .to('.intro-word span', { yPercent: -120, opacity: 0, duration: 0.4, stagger: 0.015, ease: 'power3.in' }, 0.75)
                .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut' }, 0.85);
        },
        { scope: root },
    );

    if (gone) return null;
    return (
        <div ref={root} className="intro" aria-hidden="true" style={{ clipPath: 'inset(0 0 0% 0)' }}>
            <p className="intro-word overflow-hidden">
                {WORD.split('').map((ch, i) => (
                    <span key={i} className="inline-block">
                        {ch}
                    </span>
                ))}
            </p>
            <span className="intro-bar">
                <i />
            </span>
        </div>
    );
}
