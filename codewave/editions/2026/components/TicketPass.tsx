'use client';
import { CalendarDays, MapPin } from 'lucide-react';
import { EVENT } from '@/editions/2026/event';
import { ticketQrSrc } from '@/editions/2026/lib/ticket';
import { useLang } from './i18n/LanguageProvider';

export type TicketPassState = 'valid' | 'refunded' | 'invalid' | 'unavailable';

type PassTicket = { maskedName: string; attendeeType: string; reference: string };

// QR bilet sayfasının içeriği. Giriş kapısında personel QR'ı yönetim panelinden okutur; bu sayfa yalnızca
// biletin geçerli olup olmadığını (maskeli adla) ve QR'ın kendisini gösterir.
export default function TicketPass({ state, code, ticket }: { state: TicketPassState; code?: string; ticket?: PassTicket }) {
    const { d } = useLang();
    const key = (ticket?.attendeeType ?? '').toLowerCase() as keyof typeof d.attendeeOptions;
    const attendee = d.attendeeOptions[key] ?? ticket?.attendeeType;

    const title =
        state === 'valid' ? d.ticketValidTitle : state === 'refunded' ? d.ticketRefundedTitle : state === 'unavailable' ? d.ticketUnavailableTitle : d.ticketInvalidTitle;
    const text =
        state === 'valid' ? d.ticketValidText : state === 'refunded' ? d.ticketRefundedText : state === 'unavailable' ? d.ticketUnavailableText : d.ticketInvalidText;

    return (
        <section className="relative min-h-[100svh] overflow-hidden px-[var(--m)] pt-36 pb-24" aria-labelledby="ticket-title">
            <div className="pointer-events-none absolute top-0 left-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(46_126_190/0.25),transparent_62%)]" aria-hidden="true" />
            <div className="pass glass glass-edge relative mx-auto max-w-[520px] p-6 sm:p-10" style={{ borderRadius: 30 }}>
                {state === 'valid' && <span className="pass-holo" aria-hidden="true" />}
                <div className="relative z-10">
                    <p className="kicker">CODEWAVE 2026</p>
                    <h1 className="mt-4 text-[clamp(2rem,7vw,3.25rem)] leading-[0.98] font-extralight tracking-[-0.055em]" id="ticket-title">
                        <span className={state === 'valid' ? 'grad-text' : undefined}>{title}</span>
                    </h1>
                    <p className="mt-4 leading-relaxed text-mute">{text}</p>

                    {state === 'valid' && code && ticket && (
                        <>
                            <div className="ticket-qr mx-auto mt-8">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ticketQrSrc(code)} width={280} height={280} alt={d.ticketQrAlt} />
                            </div>
                            <p className="mt-3 text-center text-sm text-mute">{d.ticketShowAtDoor}</p>

                            <dl className="mt-8 grid gap-px overflow-hidden rounded-[18px] border border-[var(--line)]">
                                <div className="pass-field bg-white/[0.02] p-4">
                                    <dt>{d.ticketName}</dt>
                                    <dd>{ticket.maskedName}</dd>
                                </div>
                                <div className="pass-field bg-white/[0.02] p-4">
                                    <dt>{d.attendee}</dt>
                                    <dd>{attendee}</dd>
                                </div>
                                <div className="pass-field bg-white/[0.02] p-4">
                                    <dt>{d.ticketReference}</dt>
                                    <dd>{ticket.reference}</dd>
                                </div>
                            </dl>

                            <ul className="mt-6 grid gap-2 text-sm text-mute" role="list">
                                <li className="flex items-start gap-2">
                                    <CalendarDays className="mt-0.5 shrink-0 text-green" size={16} aria-hidden="true" />
                                    <span>{d.ticketWhen}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 shrink-0 text-green" size={16} aria-hidden="true" />
                                    <span>
                                        {EVENT.venue.name}, {EVENT.venue.city}
                                    </span>
                                </li>
                            </ul>
                        </>
                    )}

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {(state === 'invalid' || state === 'refunded') && (
                            <a className="btn btn-primary" href="/biletim">
                                <span>{d.ticketFindLink}</span>
                            </a>
                        )}
                        <a className="btn btn-ghost" href="/">
                            {d.resultHome}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
