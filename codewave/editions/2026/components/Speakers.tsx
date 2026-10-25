'use client';
import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { SPEAKERS, SPEAKER_SEATS, type Speaker } from '@/editions/2026/event';
import { useLang } from './i18n/LanguageProvider';
import SplitHeading from './fx/SplitHeading';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

const initials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toLocaleUpperCase('tr-TR');

// Kare fotoğraf. Örnek (sentetik) görsellerin alternatif metni boştur; gerçek fotoğraf gelince kişinin adı okunur.
function Photo({ speaker, sizes }: { speaker: Speaker; sizes: string }) {
    if (!speaker.photo) {
        return (
            <span className="sp-mono" aria-hidden="true">
                {initials(speaker.name)}
            </span>
        );
    }
    return (
        <Image
            src={speaker.photo}
            alt={speaker.sample ? '' : `${speaker.name}, ${speaker.title}`}
            fill
            sizes={sizes}
            style={{ objectFit: 'cover', objectPosition: speaker.photoPosition ?? 'center 30%' }}
        />
    );
}

// Bir öğenin sahneye göre düzen konumu (transform'lardan etkilenmez; uçuş hedefleri bununla ölçülür).
function offsetIn(el: HTMLElement, stage: HTMLElement) {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== stage) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// Uçuş: `from` öğesini `to` öğesinin kutusuna tam oturtacak x/y/scale (transform-origin: 0 0).
function flight(from: HTMLElement, to: HTMLElement, stage: HTMLElement) {
    const a = offsetIn(from, stage);
    const b = offsetIn(to, stage);
    return { x: b.x - a.x, y: b.y - a.y, scale: b.w / a.w };
}

// Yarık: çift sıradakiler yatay bir ışık yarığından, tek sıradakiler dikey bir perdeden açılır.
const SLIT_H = 'inset(50% 0% 50% 0%)';
const SLIT_V = 'inset(0% 50% 0% 50%)';
const OPEN = 'inset(0% 0% 0% 0%)';

export default function Speakers() {
    const { d } = useLang();
    const root = useRef<HTMLElement>(null);
    // Raydaki bir koltuğa tıklanınca çağrılır; sahne kurulduğunda (hareket serbestken) doldurulur.
    const jump = useRef<((seat: number) => void) | null>(null);
    const pendingSeats = Math.max(SPEAKER_SEATS - SPEAKERS.length, 0);
    const seats = [...SPEAKERS.map((s) => ({ speaker: s })), ...Array.from({ length: pendingSeats }, () => ({ speaker: null as Speaker | null }))];

    useGSAP(
        () => {
            // Telefonda adres çubuğu gizlenip açılırken (yalnızca yükseklik değişir) tetik noktaları yeniden
            // hesaplanmaz; sabitlenmiş sahne kaydırma sırasında zıplamaz.
            ScrollTrigger.config({ ignoreMobileResize: true });
            const mm = gsap.matchMedia();

            // Masaüstü ve telefon aynı sahneyi oynatır; yalnızca yerleşim (CSS) ve kaydırma uzunluğu değişir.
            // Uçuş hedefleri o anki düzenden ölçüldüğü için aynı zaman çizelgesi iki geometride de doğru çalışır.
            mm.add(
                {
                    motion: '(prefers-reduced-motion: no-preference)',
                    desktop: '(min-width: 1024px)',
                    fine: '(hover: hover) and (pointer: fine)',
                },
                (ctx) => {
                    const { motion, desktop, fine } = ctx.conditions as { motion: boolean; desktop: boolean; fine: boolean };
                    if (!motion) return;
                    const stage = root.current?.querySelector<HTMLElement>('.st');
                    if (!stage) return;
                    const q = gsap.utils.selector(stage);
                    const portraits = q('.st-portrait') as HTMLElement[];
                    const thumbs = q('.st-thumb') as HTMLElement[];
                    const cells = q('.st-cell-photo') as HTMLElement[];
                    const n = portraits.length;
                    const beat = 2; // her konuşmacı: giriş 0.8, bekleme 0.5, oturma 0.7
                    const intro = 0.9; // açılış yazısının çekilmesi için ayrılan süre; sonraki her şey bu kadar kayar
                    const p = 1 + intro + n * beat + 0.2; // doruğun başladığı an
                    const railIn = 0.5 + intro;
                    const rail = stage.querySelector<HTMLElement>('.st-rail');
                    const slots = q('.st-slot') as HTMLElement[];
                    // Kaydırma yolu (ekran yüksekliği cinsinden): konuşmacı başına + açılış/doruk payı. Değerler küçüldükçe
                    // sahne daha az kaydırmayla biter; animasyonun kendisi değişmez, yalnızca daha hızlı oynar.
                    // Telefonda biraz daha kısa: başparmakla birkaç savuruşta bir varış.
                    const perSpeaker = desktop ? 0.75 : 0.65;
                    const tail = desktop ? 1.9 : 1.7;

                    const tl = gsap.timeline({
                        defaults: { ease: 'none' },
                        scrollTrigger: {
                            trigger: stage,
                            start: 'top top',
                            end: () => `+=${window.innerHeight * (n * perSpeaker + tail + 0.6)}`,
                            pin: true,
                            anticipatePin: 1,
                            scrub: desktop ? 0.8 : 0.45,
                            invalidateOnRefresh: true,
                            // Ray yalnızca görünürken tıklanır; o an sahnedeki konuşmacının koltuğu işaretlenir.
                            onUpdate: (self) => {
                                const time = self.progress * tl.duration();
                                rail?.classList.toggle('is-live', time > railIn + 0.3 && time < p + 0.3);
                                const current = Math.floor((time - 1 - intro) / beat);
                                slots.forEach((slot, i) => slot.classList.toggle('is-current', i === current && time < p));
                            },
                        },
                    });

                    // Perde 0 · Davet: yazı sahne ekrana girerken aşağıdan süzülerek gelir (zamana bağlı), ilk
                    // kaydırmalarla yukarı çekilip silinir (kaydırmaya bağlı). İkisi ayrı öğelere yazar.
                    gsap.fromTo(
                        '.st-intro-inner',
                        { opacity: 0, y: 48, filter: 'blur(10px)' },
                        {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            duration: 1.1,
                            ease: 'expo.out',
                            scrollTrigger: { trigger: stage, start: 'top 45%', toggleActions: 'play none none reverse' },
                        },
                    );
                    tl.to('.st-intro', { opacity: 0, yPercent: -60, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in' }, 0.15);

                    // Perde 1 · Soru: başlık sahneye yerleşir, sonra küçülüp yukarı çekilir.
                    tl.fromTo('.st-beam', { opacity: 0.25 }, { opacity: 0.7, duration: 0.5 }, 0)
                        .to('.st-head', { yPercent: desktop ? -10 : -18, scale: desktop ? 0.62 : 0.66, transformOrigin: '0% 0%', duration: 0.8, ease: 'power2.inOut' }, 0.35 + intro)
                        .fromTo('.st-rail', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, railIn);

                    // Perde 2-3 · Varışlar ve oturma (imza hareketi).
                    portraits.forEach((portrait, i) => {
                        const t = 1 + intro + i * beat;
                        // Konuşmacının tam göründüğü an: portre açılmış, künye yerinde, henüz koltuğa uçmamış.
                        tl.addLabel(`speaker-${i}`, t + 1.05);
                        const dir = i % 2 === 0 ? 1 : -1;
                        const name = q(`.st-name-${i}`);
                        const plate = q(`.st-plate-${i}`);
                        tl.fromTo(portrait, { clipPath: i % 2 ? SLIT_V : SLIT_H, opacity: 1 }, { clipPath: OPEN, duration: 0.8, ease: 'power3.out' }, t)
                            .fromTo(portrait.firstElementChild, { scale: 1.2 }, { scale: 1, duration: 1.3, ease: 'power2.out' }, t)
                            .fromTo(name, { opacity: 0, xPercent: dir * 14 }, { opacity: 1, xPercent: 0, duration: 0.8, ease: 'power2.out' }, t)
                            .fromTo(plate, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, t + 0.25)
                            .to('.st-beam', { x: () => offsetIn(portrait, stage).x + offsetIn(portrait, stage).w / 2 - stage.offsetWidth / 2, duration: 0.8, ease: 'power2.inOut' }, t - 0.2)
                            // bekleme: arka plandaki dev ad yavaşça süzülmeye devam eder
                            .to(name, { xPercent: -dir * 6, duration: 1.2 }, t + 0.8)
                            // oturma: portrenin kendisi koltuk rayındaki yerine uçar
                            .to(name, { opacity: 0, duration: 0.5 }, t + 1.3)
                            .to(plate, { opacity: 0, y: -30, duration: 0.4 }, t + 1.3)
                            .to(
                                portrait,
                                {
                                    x: () => flight(portrait, thumbs[i], stage).x,
                                    y: () => flight(portrait, thumbs[i], stage).y,
                                    scale: () => flight(portrait, thumbs[i], stage).scale,
                                    duration: 0.7,
                                    ease: 'power3.inOut',
                                },
                                t + 1.3,
                            )
                            .set(thumbs[i], { opacity: 1 }, t + 2)
                            .set(portrait, { opacity: 0 }, t + 2);
                    });

                    // Perde 4 · Doruk: rayda oturan beş portre büyük kadroya uçar, altıncı koltuk boş parlar.
                    tl.to('.st-beam', { x: 0, opacity: 0.45, scaleX: 2.6, duration: 1 }, p);
                    thumbs.forEach((thumb, i) => {
                        tl.to(
                            thumb,
                            {
                                x: () => flight(thumb, cells[i], stage).x,
                                y: () => flight(thumb, cells[i], stage).y,
                                scale: () => flight(thumb, cells[i], stage).scale,
                                duration: 1.2,
                                ease: 'power3.inOut',
                            },
                            p + i * 0.08,
                        )
                            .set(cells[i], { opacity: 1 }, p + 1.2 + i * 0.08)
                            .set(thumb, { opacity: 0 }, p + 1.2 + i * 0.08);
                    });
                    tl.to('.st-slot', { opacity: 0, duration: 0.4 }, p + 0.3)
                        .fromTo('.st-cell-pending', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, p + 1.1)
                        .fromTo('.st-cell-meta', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, p + 1.3)
                        .fromTo('.st-closing', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, p + 1.6)
                        // bırakış: son kare bir süre tutulur
                        .addLabel('lineup', p + 2.2)
                        .to({}, { duration: 0.8 });

                    // Koltuğa tıklama: aradaki uçuşları hızla oynatmak yerine doğrudan o konuşmacının karesine geçilir.
                    // Kaydırma anında yapılır, sonra scrub'ın yetişme gecikmesi bitirilir; böylece ara kareler görünmez.
                    jump.current = (seat) => {
                        const st = tl.scrollTrigger;
                        if (!st) return;
                        const label = seat < n ? `speaker-${seat}` : 'lineup';
                        const y = st.start + (tl.labels[label] / tl.duration()) * (st.end - st.start);
                        gsap.set(window, { scrollTo: { y, autoKill: false } });
                        ScrollTrigger.update();
                        st.getTween()?.progress(1);
                    };

                    // Fareyle dev adlar hafifçe karşı yöne süzülür (yalnızca hassas işaretçi).
                    let onMove: ((e: PointerEvent) => void) | null = null;
                    if (fine) {
                        const nx = gsap.quickTo('.st-names', 'x', { duration: 1.4, ease: 'power3.out' });
                        onMove = (e: PointerEvent) => nx((e.clientX / window.innerWidth - 0.5) * -40);
                        window.addEventListener('pointermove', onMove, { passive: true });
                    }
                    document.fonts.ready.then(() => ScrollTrigger.refresh());
                    return () => {
                        jump.current = null;
                        rail?.classList.remove('is-live');
                        if (onMove) window.removeEventListener('pointermove', onMove);
                    };
                },
            );
        },
        { scope: root },
    );

    return (
        <section ref={root} id="konusmacilar" className="sp relative" aria-labelledby="speakers-title">
            {/* Başlık ve anlamsal liste: hareket serbestken ekran okuyucular içindir (görsel sahne aşağıda);
                hareket azaltıldığında ya da JS yokken sade bir kadro ızgarası olarak görünür. */}
            <div className="sp-head px-[var(--m)]">
                <p className="kicker">{d.navSpeakers}</p>
                <SplitHeading as="h2" id="speakers-title" className="h2 mt-4" text={d.speakersTitle} />
                <p className="mt-5 max-w-md text-mute">{d.speakersLead}</p>
            </div>

            <ol className="sp-list" role="list">
                {SPEAKERS.map((s) => (
                    <li key={s.name} className="sp-item">
                        <span className="sp-photo">
                            <Photo speaker={s} sizes="(min-width: 1024px) 30vw, 82vw" />
                        </span>
                        <span className="sp-plate">
                            <span className="kicker">{s.company ?? d.speakerKicker}</span>
                            <span className="sp-name">{s.name}</span>
                            <span className="sp-title mono">{s.title}</span>
                        </span>
                    </li>
                ))}
                {Array.from({ length: pendingSeats }, (_, i) => (
                    <li key={`pending-${i}`} className="sp-item sp-item-pending">
                        <span className="sp-photo sp-photo-pending" aria-hidden="true">
                            ?
                        </span>
                        <span className="sp-plate">
                            <span className="sp-name">{d.seatPending}</span>
                            <span className="sp-title mono">{d.seatPendingNote}</span>
                        </span>
                    </li>
                ))}
            </ol>

            {/* Sahne: tamamen görsel katmanlar (aria-hidden); içerik yukarıdaki listededir. */}
            <div className="st" aria-hidden="true">
                <div className="st-beam" />
                <div className="st-intro">
                    <div className="st-intro-inner grid justify-items-center gap-[22px]">
                        <p className="st-intro-text">{d.speakersIntro}</p>
                        <span className="st-intro-cue" />
                    </div>
                </div>
                <div className="st-head">
                    <p className="kicker">{d.navSpeakers}</p>
                    <p className="h2 mt-4">{d.speakersTitle}</p>
                </div>

                <div className="st-names">
                    {SPEAKERS.map((s, i) => (
                        <span key={s.name} className={`st-name st-name-${i}`}>
                            {s.name}
                        </span>
                    ))}
                </div>

                {SPEAKERS.map((s, i) => (
                    <div key={s.name} className={`st-portrait st-portrait-${i % 2 ? 'r' : 'l'}`}>
                        <span className="st-inner">
                            <Photo speaker={s} sizes="(min-width: 1024px) 34vw, 72vw" />
                        </span>
                    </div>
                ))}

                {SPEAKERS.map((s, i) => (
                    <div key={s.name} className={`st-plate st-plate-${i} st-plate-${i % 2 ? 'r' : 'l'}`}>
                        <p className="kicker">{s.company ?? d.speakerKicker}</p>
                        <p className="st-plate-name">{s.name}</p>
                        <p className="mono st-plate-title">{s.title}</p>
                    </div>
                ))}

                <div className="st-rail">
                    {seats.map((seat, i) => (
                        <span
                            key={i}
                            className={`st-slot${seat.speaker ? '' : ' st-slot-pending'}`}
                            onClick={() => jump.current?.(i)}
                            data-cursor={seat.speaker ? seat.speaker.name.split(' ')[0] : d.seatPending}
                            title={seat.speaker ? d.speakerJump(seat.speaker.name) : undefined}
                        >
                            {seat.speaker ? (
                                <span className="st-thumb">
                                    <Photo speaker={seat.speaker} sizes="(min-width: 1024px) 16vw, 30vw" />
                                </span>
                            ) : (
                                '?'
                            )}
                        </span>
                    ))}
                </div>

                <div className="st-lineup">
                    {seats.map((seat, i) => (
                        <div key={i} className="st-cell">
                            {seat.speaker ? (
                                <span className="st-cell-photo">
                                    <Photo speaker={seat.speaker} sizes="(min-width: 1024px) 16vw, 30vw" />
                                </span>
                            ) : (
                                <span className="st-cell-photo st-cell-pending">?</span>
                            )}
                            <span className="st-cell-meta">
                                <span className="st-cell-name">{seat.speaker ? seat.speaker.name : d.seatPending}</span>
                                <span className="mono st-cell-sub">{seat.speaker ? (seat.speaker.company ?? seat.speaker.title) : d.seatPendingNote}</span>
                            </span>
                        </div>
                    ))}
                </div>
                <p className="st-closing">{d.speakersLead}</p>
            </div>
        </section>
    );
}
