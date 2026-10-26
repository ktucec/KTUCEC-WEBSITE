'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
import type { Dict } from '@/editions/2026/i18n';
import { OTP_RE, normalizeEmail } from '@/editions/2026/lib/discount';
import { isDiscountApiConfigured, type ApiFail } from '@/editions/2026/lib/discountApi';
import { ticketQrSrc } from '@/editions/2026/lib/ticket';
import { requestTicketCode, verifyTicketCode, type LookupTicket } from '@/editions/2026/lib/ticketApi';
import { useLang } from './i18n/LanguageProvider';

type ErrorCode = keyof Dict['ticketErrors'];
type Step = { kind: 'email' } | { kind: 'otp'; email: string } | { kind: 'done'; email: string; tickets: LookupTicket[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// "Biletimi bul": bilet alırken yazılan e-postaya kod gider; doğrulanınca o adresin biletleri QR koduyla gösterilir.
export default function TicketLookup() {
    const { d } = useLang();
    const emailInput = useRef<HTMLInputElement>(null);
    const otpInput = useRef<HTMLInputElement>(null);
    const title = useRef<HTMLHeadingElement>(null);

    const [step, setStep] = useState<Step>({ kind: 'email' });
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<{ code: ErrorCode; attemptsLeft?: number; field: 'email' | 'otp' } | null>(null);
    const [resendAt, setResendAt] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (step.kind !== 'otp' || resendAt <= Date.now()) return;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [step.kind, resendAt]);

    useEffect(() => {
        if (step.kind === 'otp') otpInput.current?.focus();
        if (step.kind === 'done') title.current?.focus();
    }, [step]);

    const resendLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));
    const errorText = error ? d.ticketErrors[error.code] : null;

    const fail = (r: ApiFail, field: 'email' | 'otp') => {
        const code = (r.code in d.ticketErrors ? r.code : 'unknown') as ErrorCode;
        setError({ code, attemptsLeft: r.attemptsLeft, field });
        if (r.retryAfter && (r.code === 'otp_cooldown' || r.code === 'otp_limit')) {
            setNow(Date.now());
            setResendAt(Date.now() + r.retryAfter * 1000);
        }
    };

    const sendCode = async (target: string, fromOtpStep: boolean) => {
        if (busy) return;
        if (!EMAIL_RE.test(target)) {
            setError({ code: 'email_invalid', field: 'email' });
            emailInput.current?.focus();
            return;
        }
        setBusy(true);
        setError(null);
        const r = await requestTicketCode(target);
        setBusy(false);
        if (r.ok) {
            setOtp('');
            setNow(Date.now());
            setResendAt(Date.now() + r.data.resendInSeconds * 1000);
            setStep({ kind: 'otp', email: r.data.email });
            return;
        }
        fail(r, fromOtpStep ? 'otp' : 'email');
    };

    const submitOtp = async (value: string) => {
        if (step.kind !== 'otp' || busy) return;
        if (!OTP_RE.test(value)) {
            setError({ code: 'code_format', field: 'otp' });
            return;
        }
        setBusy(true);
        setError(null);
        const r = await verifyTicketCode(step.email, value);
        setBusy(false);
        if (r.ok) {
            setStep({ kind: 'done', email: r.data.email, tickets: r.data.tickets });
            return;
        }
        if (r.code === 'code_expired' || r.code === 'too_many_attempts') setOtp('');
        fail(r, 'otp');
    };

    const onOtpChange = (raw: string) => {
        const digits = raw.replace(/\D/g, '').slice(0, 6);
        setOtp(digits);
        if (error?.field === 'otp') setError(null);
        if (digits.length === 6 && digits !== otp) void submitOtp(digits);
    };

    const onSubmitEmail = (e: FormEvent) => {
        e.preventDefault();
        void sendCode(normalizeEmail(email), false);
    };

    return (
        <section className="relative min-h-[100svh] overflow-hidden px-[var(--m)] pt-36 pb-24" aria-labelledby="lookup-title">
            <div className="pointer-events-none absolute top-0 left-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(46_126_190/0.25),transparent_62%)]" aria-hidden="true" />
            <div className="pass glass glass-edge relative mx-auto max-w-[560px] p-6 sm:p-10" style={{ borderRadius: 30 }}>
                <div className="relative z-10">
                    <p className="kicker">CODEWAVE 2026</p>
                    <h1 id="lookup-title" ref={title} tabIndex={-1} className="mt-4 text-[clamp(2rem,7vw,3.25rem)] leading-[0.98] font-extralight tracking-[-0.055em] outline-none">
                        {step.kind === 'done' ? d.ticketYours : d.ticketFindTitle}
                    </h1>

                    {!isDiscountApiConfigured() && <p className="discount-error mt-6">{d.ticketErrors.unknown}</p>}

                    {step.kind === 'email' && (
                        <form className="mt-5 grid gap-4" onSubmit={onSubmitEmail} noValidate>
                            <p className="leading-relaxed text-mute">{d.ticketFindLead}</p>
                            <div className={`field${error?.field === 'email' ? ' has-error' : ''}`}>
                                <label htmlFor="lookup-email">{d.ticketEmailLabel}</label>
                                <input
                                    ref={emailInput}
                                    id="lookup-email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    enterKeyHint="send"
                                    maxLength={254}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error?.field === 'email') setError(null);
                                    }}
                                    aria-invalid={error?.field === 'email' ? true : undefined}
                                    aria-describedby="lookup-email-hint lookup-error"
                                    required
                                />
                                <p className="hint" id="lookup-email-hint">
                                    {d.ticketEmailHint}
                                </p>
                            </div>
                            {errorText && error?.field === 'email' && (
                                <p className="discount-error" id="lookup-error" role="alert">
                                    {errorText}
                                </p>
                            )}
                            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy || !isDiscountApiConfigured()}>
                                {busy ? (
                                    <>
                                        <LoaderCircle className="spin" size={20} aria-hidden="true" />
                                        <span>{d.sendingCode}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{d.sendCode}</span>
                                        <ArrowRight className="arrow ml-auto" size={20} aria-hidden="true" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step.kind === 'otp' && (
                        <form
                            className="mt-5 grid gap-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                void submitOtp(otp);
                            }}
                            noValidate
                        >
                            <p className="leading-relaxed text-mute" role="status">
                                {d.ticketOtpLead(step.email)}
                            </p>
                            <div className={`field${error?.field === 'otp' ? ' has-error' : ''}`}>
                                <label htmlFor="lookup-otp">{d.otpLabel}</label>
                                <input
                                    ref={otpInput}
                                    id="lookup-otp"
                                    className="otp-input"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    enterKeyHint="done"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => onOtpChange(e.target.value)}
                                    aria-invalid={error?.field === 'otp' ? true : undefined}
                                    aria-describedby={errorText ? 'lookup-error' : undefined}
                                    disabled={busy}
                                    placeholder="••••••"
                                />
                            </div>
                            {errorText && (
                                <p className="discount-error" id="lookup-error" role="alert">
                                    {errorText}
                                    {error?.attemptsLeft ? ` ${d.attemptsLeft(error.attemptsLeft)}` : ''}
                                </p>
                            )}
                            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy || otp.length !== 6}>
                                {busy ? (
                                    <>
                                        <LoaderCircle className="spin" size={20} aria-hidden="true" />
                                        <span>{d.verifying}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{d.verify}</span>
                                        <Check className="ml-auto" size={20} aria-hidden="true" />
                                    </>
                                )}
                            </button>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <button type="button" className="discount-link" onClick={() => void sendCode(step.email, true)} disabled={busy || resendLeft > 0}>
                                    {resendLeft > 0 ? d.resendIn(resendLeft) : d.resend}
                                </button>
                                <button
                                    type="button"
                                    className="discount-link"
                                    onClick={() => {
                                        setStep({ kind: 'email' });
                                        setError(null);
                                        setOtp('');
                                    }}
                                    disabled={busy}
                                >
                                    {d.changeEmail}
                                </button>
                            </div>
                        </form>
                    )}

                    {step.kind === 'done' && (
                        <div className="mt-5 grid gap-6">
                            {step.tickets.length === 0 ? (
                                <p className="leading-relaxed text-mute">{d.ticketNone}</p>
                            ) : (
                                <>
                                    <p className="leading-relaxed text-mute">{d.ticketShowAtDoor}</p>
                                    {step.tickets.map((t) => (
                                        <article key={t.ticketCode} className="grid justify-items-center gap-3 rounded-[22px] border border-[var(--line)] bg-white/[0.02] p-5">
                                            <div className="ticket-qr">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={ticketQrSrc(t.ticketCode)} width={280} height={280} alt={d.ticketQrAlt} />
                                            </div>
                                            <p className="text-lg text-ink">{t.fullName}</p>
                                            <p className="mono text-sm text-mute">
                                                {t.reference} · {d.attendeeOptions[t.attendeeType.toLowerCase() as keyof typeof d.attendeeOptions] ?? t.attendeeType}
                                            </p>
                                            <a className="discount-link" href={`/bilet/${t.ticketCode}`}>
                                                {d.ticketOpenPage}
                                            </a>
                                        </article>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    <div className="mt-8">
                        <a className="btn btn-ghost" href="/">
                            {d.resultHome}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
