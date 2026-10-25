'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ArrowUpRight, Check, X } from 'lucide-react';
import { EVENT, SOCIALS, SPEAKERS, SPEAKER_SEATS, TICKET, startsAtMs } from '@/editions/2026/event';
import { formatAmount } from '@/editions/2026/i18n';
import { useLang } from './i18n/LanguageProvider';
import Price from './Price';
import Magnetic from './fx/Magnetic';
import SplitHeading from './fx/SplitHeading';
import TicketForm, { postToShopier } from './TicketForm';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PASS_ID = 'cw26-pass';
const DRAFT_KEY = 'cw26-ticket-draft';
const INSTAGRAM = SOCIALS.find((s) => s.label === 'Instagram')?.href ?? 'https://www.instagram.com/ktucec';
const RADIUS = { borderRadius: 30 };

// Biletteki ad, formun ad/soyad alanlarına bölünür: son kelime soyad, öncekiler ad.
// "Barış Demir" → Barış / Demir · "Ali Can Yılmaz" → Ali Can / Yılmaz · tek kelime → yalnızca ad.
function splitName(full: string) {
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return { firstName: parts[0] ?? '', lastName: '' };
    return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

// Dönen holografik mühür: çember üzerinde akan yazı.
function Seal() {
    return (
        <svg viewBox="0 0 100 100" className="seal h-14 w-14 sm:h-20 sm:w-20" aria-hidden="true">
            <defs>
                <path id="seal-path" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
            </defs>
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgb(150 180 225 / 0.25)" strokeWidth="0.6" />
            <text fill="rgb(234 242 255 / 0.65)" fontSize="8.4" letterSpacing="2.4" fontFamily="var(--font-mono)">
                <textPath href="#seal-path">CODEWAVE · 2026 · TRABZON · KTÜCEC ·</textPath>
            </text>
            <circle cx="50" cy="50" r="5" fill="#88df8a" />
        </svg>
    );
}

// Bilet yüzü. Ziyaretçinin yazdığı ad "bilet sahibi" satırında canlı belirir.
function PassFace({ holder }: { holder: string }) {
    const { d } = useLang();
    return (
        <div className="relative z-10 flex flex-col gap-5 p-5 sm:gap-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="mono text-[0.6875rem] tracking-[0.3em] text-mute">CODEWAVE</p>
                    <p className="grad-text mt-1 text-[clamp(3.75rem,17vw,7rem)] leading-[0.85] font-extralight tracking-[-0.07em]">2026</p>
                    <p className="kicker mt-3">{d.passAdmit}</p>
                </div>
                <Seal />
            </div>
            <div className="pass-holder-row">
                <p className="mono text-[0.6875rem] tracking-[0.18em] text-faint uppercase">{d.passHolder}</p>
                <p key={holder ? 'set' : 'empty'} className={`pass-holder${holder ? ' is-set' : ''}`}>
                    {holder || d.holderEmpty}
                </p>
            </div>
            <dl className="grid grid-cols-3 gap-x-4 gap-y-4">
                <div className="pass-field">
                    <dt>{d.fieldDate}</dt>
                    <dd>08.12.26</dd>
                </div>
                <div className="pass-field">
                    <dt>{d.passTime}</dt>
                    <dd>10:00</dd>
                </div>
                <div className="pass-field">
                    <dt>{d.passPrice}</dt>
                    <dd>
                        <Price />
                    </dd>
                </div>
                <div className="pass-field col-span-3">
                    <dt>{d.fieldVenue}</dt>
                    <dd>{EVENT.venue.name}</dd>
                </div>
            </dl>
        </div>
    );
}

// Sayfadaki 3B cam bilet. Framer Motion yalnızca dıştaki kabuğu (paylaşılan düzen) yönetir, GSAP eğimi
// içteki karta yazar. İkisi aynı öğenin transform'una dokunmadığı için birbirini ezmez; önceden ikisi
// aynı öğedeydi ve telefonda kart, sabitlenmiş konuşmacı sahnesinin yüksekliği kadar yukarıda kalıyordu.
function GlassPass({ onOpen, holder }: { onOpen: () => void; holder: string }) {
    const stage = useRef<HTMLDivElement>(null);

    useGSAP(
        (_ctx, contextSafe) => {
            const el = stage.current;
            const card = el?.querySelector<HTMLElement>('.pass');
            if (!el || !card || !contextSafe) return;
            const mm = gsap.matchMedia();
            mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
                const rx = gsap.quickTo(card, 'rotationX', { duration: 0.9, ease: 'power3.out' });
                const ry = gsap.quickTo(card, 'rotationY', { duration: 0.9, ease: 'power3.out' });
                const move = contextSafe((e: PointerEvent) => {
                    const r = card.getBoundingClientRect();
                    const x = (e.clientX - r.left) / r.width;
                    const y = (e.clientY - r.top) / r.height;
                    ry((x - 0.5) * 16);
                    rx((0.5 - y) * 12);
                    card.style.setProperty('--px', `${x * 100}%`);
                    card.style.setProperty('--py', `${y * 100}%`);
                });
                const leave = contextSafe(() => {
                    rx(0);
                    ry(0);
                });
                el.addEventListener('pointermove', move);
                el.addEventListener('pointerleave', leave);
                return () => {
                    el.removeEventListener('pointermove', move);
                    el.removeEventListener('pointerleave', leave);
                };
            });
            // Dokunmatik cihazda kart kendiliğinden hafifçe süzülür, folyo ışığı yüzeyde gezinir.
            mm.add('(hover: none) and (prefers-reduced-motion: no-preference)', () => {
                gsap.to(card, { rotationY: 7, rotationX: -4, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
                const light = { x: 18, y: 26 };
                gsap.to(light, {
                    x: 82,
                    y: 74,
                    duration: 4.2,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                    onUpdate: () => {
                        card.style.setProperty('--px', `${light.x}%`);
                        card.style.setProperty('--py', `${light.y}%`);
                    },
                });
            });
        },
        { scope: stage },
    );

    return (
        <div ref={stage} className="pass-stage relative w-full max-w-[500px]">
            <span className="pass-halo" aria-hidden="true" />
            <span className="sparks" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                    <i key={i} style={{ '--k': i } as React.CSSProperties} />
                ))}
            </span>
            {/* Kart bir görsel; aynı işi gören erişilebilir düğme hemen altındaki "Hemen satın al". */}
            <motion.div layoutId={PASS_ID} layoutDependency={0} style={RADIUS} className="pass-shell relative" onClick={onOpen}>
                <div className="pass glass glass-edge" aria-hidden="true">
                    <span className="pass-holo" />
                    <span className="pass-shine" />
                    <PassFace holder={holder} />
                    <span className="perf block" />
                    <span className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
                        <span className="mono text-[0.6875rem] tracking-[0.2em] text-faint uppercase">No. CW26 · ——————</span>
                        <span className="mono text-[0.6875rem] tracking-[0.2em] text-green uppercase">{EVENT.venue.city}</span>
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

// Açılan bilet penceresi: aynı kart büyüyerek pencereye dönüşür (Framer Motion paylaşılan düzen).
function TicketDialog({ canBuy, started, holder, onClose }: { canBuy: boolean; started: boolean; holder: string; onClose: () => void }) {
    const { d } = useLang();
    const reduce = useReducedMotion();
    const panel = useRef<HTMLDivElement>(null);
    const title = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const html = document.documentElement;
        const prev = html.style.overflow;
        html.style.overflow = 'hidden';
        const t = window.setTimeout(() => title.current?.focus(), 60);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            // Odak pencere içinde döner.
            if (e.key === 'Tab' && panel.current) {
                const items = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
                if (!items.length) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            html.style.overflow = prev;
            window.clearTimeout(t);
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    // Ödeme alanları hazır: holografik parlama, ardından Shopier'in güvenli sayfası.
    const handleReady = (action: string, fields: Record<string, string>) => {
        const card = panel.current;
        if (reduce || !card) return postToShopier(action, fields);
        card.querySelector('.pass-holo')?.classList.add('is-hot');
        gsap.timeline({ onComplete: () => postToShopier(action, fields) })
            .to(card, { scale: 1.02, duration: 0.35, ease: 'power2.out' })
            .to(card.querySelector('.flash'), { opacity: 1, duration: 0.45, ease: 'power2.in' }, 0.15)
            .to(card, { scale: 0.96, opacity: 0.4, filter: 'blur(6px)', duration: 0.4, ease: 'power3.in' }, 0.45);
    };

    const closedTitle = started ? d.salesClosed : d.closedTitle;
    const closedText = started ? d.salesClosedNote : d.closedText;

    return (
        <>
            <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={onClose} />
            <div className="dialog-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <motion.div layoutId={PASS_ID} style={RADIUS} className="pass-shell my-6 w-full max-w-[680px]" transition={{ type: 'spring', stiffness: 170, damping: 24 }}>
                    <div ref={panel} className="pass glass glass-edge" role="dialog" aria-modal="true" aria-labelledby="ticket-dialog-title">
                        <span className="pass-holo pass-holo-soft" aria-hidden="true" />
                        <span className="flash" aria-hidden="true" />
                        <motion.div
                            className="relative z-10"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.35, duration: 0.5 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        >
                            <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
                                <div>
                                    <p className="mono text-xs tracking-[0.3em] text-mute">CODEWAVE 2026 · {d.passAdmit}</p>
                                    <h2 id="ticket-dialog-title" ref={title} tabIndex={-1} className="mt-3 text-[clamp(2rem,5vw,3rem)] leading-none font-extralight tracking-[-0.05em] outline-none">
                                        {canBuy ? d.stubTitle : closedTitle}
                                    </h2>
                                </div>
                                <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--line-hi)] text-mute transition-colors hover:text-ink" aria-label={d.dialogClose}>
                                    <X size={18} aria-hidden="true" />
                                </button>
                            </div>
                            <div className="perf mt-6" aria-hidden="true" />
                            <div className="p-6 sm:p-8">
                                {canBuy ? (
                                    <TicketForm onReady={handleReady} name={splitName(holder)} />
                                ) : (
                                    <div className="grid gap-6" role="status">
                                        <p className="text-lg leading-relaxed text-mute">{closedText}</p>
                                        {!started && (
                                            <a className="btn btn-primary btn-lg btn-block" href={INSTAGRAM} target="_blank" rel="noopener noreferrer" data-cursor="Instagram">
                                                <span>{d.closedFollow}</span>
                                                <ArrowUpRight className="arrow ml-auto" size={20} aria-hidden="true" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

// Büyük fiyat: bölüm ekrana girerken sıfırdan sayarak gerçek değere (TICKET.price) oturur. Sunucuda ve
// hareket azaltmada doğrudan son değer yazılır.
function CountPrice() {
    const { lang } = useLang();
    const ref = useRef<HTMLParagraphElement>(null);
    const [value, setValue] = useState<number>(TICKET.price);

    useGSAP(
        () => {
            const el = ref.current;
            if (!el) return;
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                // Zaten ekrandaysa sayma yapılmaz; görünür bir rakamı geriye almak yanıp sönme olur.
                if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
                const counter = { v: 0 };
                setValue(0);
                gsap.to(counter, {
                    v: TICKET.price,
                    duration: 1.8,
                    delay: 0.25,
                    ease: 'expo.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                    onUpdate: () => setValue(Math.round(counter.v)),
                });
                return () => setValue(TICKET.price);
            });
        },
        { scope: ref },
    );

    return (
        <p ref={ref} className="price-count grad-text" aria-label={formatAmount(lang, TICKET.price)}>
            <span aria-hidden="true">{formatAmount(lang, value)}</span>
        </p>
    );
}

// Etkinliğe kalan gün, gerçek tarihten. Sunucuda boş, istemcide hesaplanır.
function DaysChip() {
    const { d } = useLang();
    const [days, setDays] = useState<number | null>(null);
    useEffect(() => setDays(Math.max(0, Math.ceil((startsAtMs() - Date.now()) / 86_400_000))), []);
    if (!days) return null;
    return (
        <span className="days-chip mono">
            <i aria-hidden="true" />
            {d.daysLeft(days)}
        </span>
    );
}

export default function Tickets({ salesOpen }: { salesOpen: boolean }) {
    const { d, lang } = useLang();
    const [open, setOpen] = useState(false);
    const [started, setStarted] = useState(false);
    const [holder, setHolder] = useState('');
    const [ghost, setGhost] = useState(0);
    const cta = useRef<HTMLButtonElement>(null);
    const slot = useRef<HTMLDivElement>(null);

    // Satış durumu ve daha önce yazılmış ad (form taslağından) istemcide okunur.
    useEffect(() => {
        setStarted(Date.now() >= startsAtMs());
        try {
            const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}');
            const name = [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim();
            if (name) setHolder(name);
        } catch {
            // Taslak okunamazsa ad satırı boş başlar.
        }
    }, []);

    const openDialog = () => {
        setGhost(slot.current?.offsetHeight ?? 0);
        setOpen(true);
    };

    const close = () => {
        setOpen(false);
        // Kapanınca odak, açan düğmeye geri döner.
        window.setTimeout(() => cta.current?.focus({ preventScroll: true }), 450);
    };

    const canBuy = salesOpen && !started;
    const label = canBuy ? d.buyNow : d.notifyMe;
    const perSpeaker = formatAmount(lang, Math.round((TICKET.price / SPEAKERS.length) * 100) / 100);
    const pending = Math.max(SPEAKER_SEATS - SPEAKERS.length, 0);

    return (
        <section id="bilet" className="tickets relative overflow-hidden px-[var(--m)] py-24 lg:py-40" aria-labelledby="tickets-title">
            <div className="tickets-aurora" aria-hidden="true">
                <i />
                <i />
            </div>
            <div className="relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                        <p className="kicker" data-io="clip-x">
                            {d.ticketTitleA}
                        </p>
                        <DaysChip />
                    </div>
                    <SplitHeading as="h2" id="tickets-title" className="h2 mt-5" text={d.ticketsHeading} />
                    <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-mute" data-io="rise">
                        {d.ticketsLead}
                    </p>

                    <div className="price-panel mt-9" data-io="blur">
                        <CountPrice />
                        <div className="grid gap-1.5">
                            <span className="mono text-[0.75rem] tracking-[0.16em] text-green uppercase">{d.perSpeaker(perSpeaker)}</span>
                            <span className="text-[0.9375rem] text-mute">{d.oneDay}</span>
                        </div>
                    </div>

                    <ul className="mt-9 grid gap-3.5" role="list" data-io-group>
                        {d.perks.map((perk) => (
                            <li key={perk} className="perk" data-io="left">
                                <span className="perk-check" aria-hidden="true">
                                    <Check size={14} strokeWidth={2.75} />
                                </span>
                                <span>{perk}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-9 flex items-center gap-4" data-io="rise">
                        <span className="avatar-stack" aria-hidden="true">
                            {SPEAKERS.map((s) => (
                                <span key={s.name} className="avatar">
                                    {s.photo && <Image src={s.photo} alt="" fill sizes="44px" className="object-cover object-[50%_22%]" />}
                                </span>
                            ))}
                            {pending > 0 && <span className="avatar avatar-more">+{pending}</span>}
                        </span>
                        <span className="text-[0.875rem] leading-snug text-mute">{d.lineupNote(SPEAKERS.length, pending)}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 lg:col-span-6 lg:items-end">
                    <div ref={slot} className="flex w-full justify-center lg:justify-end" data-io="tilt">
                        {/* Kart pencereye dönüşürken yerinde aynı boyda boşluk kalır; sayfa zıplamaz. */}
                        {open ? <div className="w-full max-w-[500px]" style={{ height: ghost }} aria-hidden="true" /> : <GlassPass onOpen={openDialog} holder={holder} />}
                    </div>

                    <div className="w-full max-w-[500px]" data-io="rise">
                        <label htmlFor="ticket-holder" className="mono mb-2 block text-[0.6875rem] tracking-[0.18em] text-mute uppercase">
                            {d.nameLabel}
                        </label>
                        <input
                            id="ticket-holder"
                            className="holder-input"
                            value={holder}
                            onChange={(e) => setHolder(e.target.value)}
                            placeholder={d.namePlaceholder}
                            autoComplete="name"
                            autoCapitalize="words"
                            enterKeyHint="done"
                            maxLength={48}
                            spellCheck={false}
                        />
                    </div>

                    <div className="w-full max-w-[500px]" data-io="scale">
                        <Magnetic className="w-full" strength={0.18}>
                            <button ref={cta} type="button" className="btn btn-primary btn-lg btn-block buy-cta" onClick={openDialog} data-cursor={label}>
                                <span className="buy-shine" aria-hidden="true" />
                                <span>{label}</span>
                                {canBuy && (
                                    <span className="price">
                                        <Price />
                                    </span>
                                )}
                                <ArrowRight className="arrow ml-auto" size={20} aria-hidden="true" />
                            </button>
                        </Magnetic>
                        <p className="mono mt-3 text-center text-[0.6875rem] leading-relaxed tracking-[0.12em] text-faint uppercase">{canBuy ? d.buyMicro : d.ticketClosedNote}</p>
                    </div>
                </div>
            </div>
            <AnimatePresence>{open && <TicketDialog canBuy={canBuy} started={started} holder={holder} onClose={close} />}</AnimatePresence>
        </section>
    );
}
