'use client';
import { ArrowRight, CalendarPlus } from 'lucide-react';
import { CONTACT, EVENT } from '@/editions/2026/event';
import { useLang } from './i18n/LanguageProvider';

export type ResultState = 'success' | 'failed' | 'invalid';

// Google Takvim bağlantısı: başlangıç event.ts'den; bitiş saati açıklanmadığı için gün sonu kullanılır.
function calendarUrl() {
    const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const q = new URLSearchParams({
        action: 'TEMPLATE',
        text: EVENT.name,
        dates: `${fmt(EVENT.startsAt)}/${fmt(EVENT.dayEndsAt)}`,
        location: `${EVENT.venue.name}, ${EVENT.venue.city}`,
        details: EVENT.siteUrl,
    });
    return `https://calendar.google.com/calendar/render?${q}`;
}

export default function PaymentResult({ state, orderId, paymentId }: { state: ResultState; orderId?: string; paymentId?: string }) {
    const { d } = useLang();
    const title = state === 'success' ? d.resultSuccessTitle : state === 'failed' ? d.resultFailTitle : d.resultInvalidTitle;
    const text = state === 'success' ? d.resultSuccessText : state === 'failed' ? d.resultFailText : d.resultInvalidText;

    return (
        <section className="relative min-h-[100svh] overflow-hidden px-[var(--m)] pt-36 pb-24" aria-labelledby="result-title">
            <div className="pointer-events-none absolute top-0 left-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(46_126_190/0.25),transparent_62%)]" aria-hidden="true" />
            <div className="pass glass glass-edge relative mx-auto max-w-[680px] p-6 sm:p-10" style={{ borderRadius: 30 }}>
                {state === 'success' && <span className="pass-holo" aria-hidden="true" />}
                <div className="relative z-10">
                    <p className="kicker">CODEWAVE 2026</p>
                    <h1 className="mt-4 text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95] font-extralight tracking-[-0.055em]" id="result-title">
                        <span className={state === 'success' ? 'grad-text' : undefined}>{title}</span>
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-mute">{text}</p>

                    {orderId && (
                        <dl className="mt-8 grid gap-px overflow-hidden rounded-[18px] border border-[var(--line)] sm:grid-cols-2">
                            <div className="pass-field bg-white/[0.02] p-4">
                                <dt>{d.resultOrder}</dt>
                                <dd className="break-all">{orderId}</dd>
                            </div>
                            {paymentId && (
                                <div className="pass-field bg-white/[0.02] p-4">
                                    <dt>{d.resultPayment}</dt>
                                    <dd className="break-all">{paymentId}</dd>
                                </div>
                            )}
                        </dl>
                    )}

                    {state === 'success' && <p className="mt-6 text-ink">{d.resultSeeYou}</p>}

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {state === 'success' && (
                            <a className="btn btn-primary" href={calendarUrl()} target="_blank" rel="noopener noreferrer">
                                <CalendarPlus size={18} aria-hidden="true" />
                                <span>{d.resultCalendar}</span>
                            </a>
                        )}
                        {state === 'failed' && (
                            <a className="btn btn-primary" href="/#bilet">
                                <span>{d.resultRetry}</span>
                                <ArrowRight className="arrow" size={18} aria-hidden="true" />
                            </a>
                        )}
                        <a className="btn btn-ghost" href="/">
                            {d.resultHome}
                        </a>
                    </div>
                    <p className="mt-6 text-sm text-mute">
                        <a className="underline decoration-green/60" href={`mailto:${CONTACT.email}${orderId ? `?subject=CODEWAVE%202026%20${orderId}` : ''}`}>
                            {CONTACT.email}
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
