'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { EVENT } from '@/editions/2026/event';
import { useLang } from './i18n/LanguageProvider';
import Countdown from './Countdown';
import Price from './Price';
import Magnetic from './fx/Magnetic';
import WaveField from './fx/WaveField';
import { onIntroDone } from './fx/Intro';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export default function Hero({ salesOpen }: { salesOpen: boolean }) {
    const { d } = useLang();
    const root = useRef<HTMLElement>(null);

    useGSAP(
        (_ctx, contextSafe) => {
            const mm = gsap.matchMedia();

            mm.add(
                {
                    motion: '(prefers-reduced-motion: no-preference)',
                    fine: '(hover: hover) and (pointer: fine)',
                    desktop: '(min-width: 1024px)',
                },
                (ctx) => {
                    const { motion, fine, desktop } = ctx.conditions as { motion: boolean; fine: boolean; desktop: boolean };
                    if (!motion || !contextSafe) return;

                    // Harfler ayrı ayrı: girişte yükselir, sonra "code wave" adına uygun sürekli bir dalga taşır.
                    const code = SplitText.create('.t-code', { type: 'chars', charsClass: 't-char' });
                    const wave = SplitText.create('.t-wave', { type: 'chars', charsClass: 't-char' });
                    wave.chars.forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(i)));
                    const chars = [...code.chars, ...wave.chars] as HTMLElement[];
                    const title = root.current?.querySelector('.hero-title');
                    title?.classList.add('is-split'); // gradyan artık kelimede değil, her harfte

                    const tl = gsap.timeline({ paused: true });
                    tl.set('[data-hero-split]', { visibility: 'visible' })
                        .from(chars, {
                            yPercent: 90,
                            rotateX: -70,
                            opacity: 0,
                            transformOrigin: '50% 100%',
                            duration: 1.3,
                            stagger: 0.055,
                            ease: 'expo.out',
                        })
                        .from('.hero-glass', { y: 60, opacity: 0, clipPath: 'inset(100% 0 0 0 round 28px)', duration: 1.2, ease: 'expo.out' }, 0.5)
                        .from('[data-hero-fade]', { opacity: 0, y: 14, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, 0.6);

                    // Sürekli dalga: her harf sırayla hafifçe yükselip iner; dalga soldan sağa akar.
                    const loop = gsap.to(chars, {
                        yPercent: -6,
                        duration: 1.6,
                        ease: 'sine.inOut',
                        stagger: { each: 0.14, repeat: -1, yoyo: true },
                        paused: true,
                    });
                    tl.eventCallback('onComplete', () => loop.play());
                    const off = onIntroDone(() => tl.play());

                    // Kahraman görünmüyorsa dalga durur (pil ve işlemci için).
                    ScrollTrigger.create({
                        trigger: root.current,
                        start: 'top top',
                        end: 'bottom top',
                        onLeave: () => loop.pause(),
                        onEnterBack: () => tl.progress() === 1 && loop.play(),
                    });

                    // Kaydırırken başlık geri çekilir, harfler birbirinden uzaklaşır; cam pano öne doğru kayar.
                    const center = (chars.length - 1) / 2;
                    gsap.to(chars, {
                        x: (i) => (i - center) * (desktop ? 14 : 8),
                        ease: 'none',
                        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
                    });
                    gsap.to('.hero-title', { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
                    gsap.to('.hero-glass-wrap', { y: desktop ? -90 : -40, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });

                    // Fare: katmanlar zıt yönlere süzülür, imlece yakın harfler kalkar (yalnızca hassas işaretçi).
                    let onMove: ((e: PointerEvent) => void) | null = null;
                    if (fine) {
                        const titleX = gsap.quickTo('.hero-title', 'x', { duration: 1.2, ease: 'power3.out' });
                        const glassX = gsap.quickTo('.hero-glass', 'x', { duration: 1.2, ease: 'power3.out' });
                        const glassY = gsap.quickTo('.hero-glass', 'y', { duration: 1.2, ease: 'power3.out' });
                        const lifts = chars.map((c) => gsap.quickTo(c, 'y', { duration: 0.7, ease: 'power3.out' }));
                        onMove = contextSafe((e: PointerEvent) => {
                            const nx = e.clientX / window.innerWidth - 0.5;
                            const ny = e.clientY / window.innerHeight - 0.5;
                            titleX(nx * -16);
                            glassX(nx * 24);
                            glassY(ny * 16);
                            chars.forEach((c, i) => {
                                const r = c.getBoundingClientRect();
                                const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
                                lifts[i](-Math.max(0, 1 - dist / 320) * r.height * 0.12);
                            });
                        });
                        window.addEventListener('pointermove', onMove, { passive: true });
                    }

                    return () => {
                        off();
                        if (onMove) window.removeEventListener('pointermove', onMove);
                        code.revert();
                        wave.revert();
                        title?.classList.remove('is-split');
                    };
                },
            );
        },
        { scope: root },
    );

    return (
        <section ref={root} id="top" className="relative isolate overflow-hidden" aria-labelledby="hero-title">
            <div className="hero-mesh" aria-hidden="true">
                <i />
                <i />
                <i />
            </div>
            <WaveField />
            <div className="hero-vignette" aria-hidden="true" />

            <div className="hero-inner relative z-10 flex min-h-[100svh] flex-col px-[var(--m)]">
                <div className="flex items-center justify-between gap-4" data-hero-fade>
                    <p className="kicker hero-kicker">{d.heroTag}</p>
                    <p className="mono hidden text-xs tracking-[0.2em] text-faint uppercase sm:block">{d.coords}</p>
                </div>

                <div className="hero-stage relative flex flex-1 flex-col">
                    <h1 id="hero-title" className="hero-title">
                        <span className="sr-only">CODEWAVE 2026</span>
                        <span aria-hidden="true" className="t-line t-code" data-hero-split>
                            CODE
                        </span>
                        <span aria-hidden="true" className="t-line t-wave" data-hero-split>
                            WAVE
                        </span>
                    </h1>

                    <div className="hero-glass-wrap relative z-10">
                        <div className="hero-glass glass glass-edge">
                            <div className="flex items-center justify-between gap-3">
                                <span className="mono shrink-0 rounded-full border border-[var(--line-hi)] px-3 py-1 text-[0.6875rem] tracking-[0.2em] text-green">2026</span>
                                <span className="hero-when mono text-mute">{d.heroWhen}</span>
                            </div>
                            <div className="mt-4 sm:mt-5">
                                <Countdown />
                            </div>
                            <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-4 sm:mt-5">
                                <span className="mono shrink-0 text-[0.6875rem] tracking-[0.18em] text-faint uppercase">{d.fieldVenue}</span>
                                <span className="text-right text-[0.9375rem] leading-snug text-ink">
                                    {EVENT.venue.short}, {EVENT.venue.city}
                                </span>
                            </p>
                            <Magnetic className="mt-4 w-full sm:mt-5">
                                <a className="btn btn-primary btn-lg btn-block" href="#bilet" data-cursor={salesOpen ? d.buy : d.buySoon}>
                                    <span>{salesOpen ? d.buy : d.buySoon}</span>
                                    <span className="price">
                                        <Price />
                                    </span>
                                    <ArrowRight className="arrow ml-auto" size={20} aria-hidden="true" />
                                </a>
                            </Magnetic>
                        </div>
                    </div>
                </div>

                <div className="hero-foot flex items-end justify-between gap-6" data-hero-fade>
                    <p className="max-w-[26rem] text-[0.9375rem] leading-relaxed text-mute lg:max-w-[22rem]">{d.heroLead}</p>
                    <span className="scroll-cue hidden shrink-0 sm:inline-flex" aria-hidden="true">
                        {d.scroll}
                        <i />
                    </span>
                </div>
            </div>
        </section>
    );
}
