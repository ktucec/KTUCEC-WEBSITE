'use client';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, LoaderCircle, X } from 'lucide-react';
import { formatAmount, formatDiscount, type Dict } from '@/editions/2026/i18n';
import { OTP_RE, STUDENT_NO_RE, isEduTrEmail, normalizeEmail, quote } from '@/editions/2026/lib/discount';
import { claimDiscount, lookupDiscount, verifyDiscount, type ApiFail, type DiscountStatus } from '@/editions/2026/lib/discountApi';
import { useLang } from '../i18n/LanguageProvider';
import { useDiscount } from './DiscountProvider';

type Tab = 'claim' | 'lookup';
type ErrorCode = keyof Dict['discountErrors'];
type Step =
    | { kind: 'form' }
    | { kind: 'otp'; mode: Tab; email: string }
    | { kind: 'done'; email: string; code: string; status: DiscountStatus };

const TABS: Tab[] = ['claim', 'lookup'];
const SHAKE_MS = 560;

// "edu.tr mailini onayla" penceresi. İki sekme:
//  - İndirim kazan: e-posta + öğrenci no → e-postaya kod → doğrulama → indirim kodu.
//    Adres zaten kullanılmışsa pencere titrer ve "İndirim sorgula" sekmesine geçer.
//  - İndirim sorgula: e-posta → e-postaya kod → doğrulama → mevcut kod ve durumu.
// Kazanılan indirim DiscountProvider'a yazılır; fiyatlar ve bilet formu buna göre güncellenir.
export default function DiscountDialog({ onClose, onContinue }: { onClose: () => void; onContinue: () => void }) {
    const { d, lang } = useLang();
    const { apply } = useDiscount();
    const reduce = useReducedMotion();
    const panel = useRef<HTMLDivElement>(null);
    const title = useRef<HTMLHeadingElement>(null);
    const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ claim: null, lookup: null });
    const emailInput = useRef<HTMLInputElement>(null);
    const otpInput = useRef<HTMLInputElement>(null);

    const [tab, setTab] = useState<Tab>('claim');
    const [step, setStep] = useState<Step>({ kind: 'form' });
    const [email, setEmail] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [otp, setOtp] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<{ code: ErrorCode; attemptsLeft?: number; field?: 'email' | 'studentNo' | 'otp' } | null>(null);
    const [note, setNote] = useState<string | null>(null);
    const [shaking, setShaking] = useState(false);
    const [resendAt, setResendAt] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    // Kaydırmayı kilitle, odağı başlığa al, Escape ile kapat, Tab ile odağı pencerede tut.
    useEffect(() => {
        const html = document.documentElement;
        const prev = html.style.overflow;
        html.style.overflow = 'hidden';
        const t = window.setTimeout(() => title.current?.focus(), 60);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Tab' && panel.current) {
                const items = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
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

    // Tekrar gönderme sayacı
    useEffect(() => {
        if (step.kind !== 'otp' || resendAt <= Date.now()) return;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [step.kind, resendAt]);

    useEffect(() => {
        if (step.kind === 'otp') otpInput.current?.focus();
    }, [step]);

    const resendLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

    const fail = (r: ApiFail, field?: 'email' | 'studentNo' | 'otp') => {
        const code = (r.code in d.discountErrors ? r.code : 'unknown') as ErrorCode;
        setError({ code, attemptsLeft: r.attemptsLeft, field });
        if (r.retryAfter && (r.code === 'otp_cooldown' || r.code === 'otp_limit')) {
            setNow(Date.now());
            setResendAt(Date.now() + r.retryAfter * 1000);
        }
    };

    const switchTab = (next: Tab, focus = false) => {
        setTab(next);
        setStep({ kind: 'form' });
        setError(null);
        setNote(null);
        setOtp('');
        if (focus) requestAnimationFrame(() => tabRefs.current[next]?.focus());
    };

    const onTabKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        switchTab(tab === 'claim' ? 'lookup' : 'claim', true);
    };

    // Adres zaten indirim almış: pencere titrer, ardından "İndirim sorgula" sekmesi aynı adresle açılır.
    const bounceToLookup = () => {
        setShaking(true);
        window.setTimeout(
            () => {
                setShaking(false);
                switchTab('lookup');
                setNote(d.alreadyClaimed);
                requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus());
            },
            reduce ? 0 : SHAKE_MS,
        );
    };

    const startOtp = (mode: Tab, sentTo: string, resendIn: number) => {
        setOtp('');
        setNote(null);
        setNow(Date.now());
        setResendAt(Date.now() + resendIn * 1000);
        setStep({ kind: 'otp', mode, email: sentTo });
    };

    const requestCode = async (mode: Tab) => {
        const cleanEmail = normalizeEmail(email);
        if (!isEduTrEmail(cleanEmail)) {
            setError({ code: 'email_invalid', field: 'email' });
            emailInput.current?.focus();
            return;
        }
        if (mode === 'claim' && !STUDENT_NO_RE.test(studentNo)) {
            setError({ code: 'student_number_invalid', field: 'studentNo' });
            return;
        }
        setBusy(true);
        setError(null);
        const r = mode === 'claim' ? await claimDiscount(cleanEmail, studentNo) : await lookupDiscount(cleanEmail);
        setBusy(false);
        if (r.ok) return startOtp(mode, r.data.email, r.data.resendInSeconds);
        if (mode === 'claim' && r.code === 'already_claimed') return bounceToLookup();
        fail(r, r.code === 'email_invalid' || r.code === 'not_found' ? 'email' : r.code === 'student_number_invalid' ? 'studentNo' : undefined);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        if (!busy) void requestCode(tab);
    };

    const submitOtp = async (value: string) => {
        if (step.kind !== 'otp' || busy) return;
        if (!OTP_RE.test(value)) {
            setError({ code: 'code_format', field: 'otp' });
            return;
        }
        setBusy(true);
        setError(null);
        const r = await verifyDiscount(step.email, value);
        setBusy(false);
        if (r.ok) {
            if (r.data.status !== 'redeemed') apply({ email: r.data.email, code: r.data.discountCode });
            setStep({ kind: 'done', email: r.data.email, code: r.data.discountCode, status: r.data.status });
            requestAnimationFrame(() => title.current?.focus());
            return;
        }
        if (r.code === 'code_expired' || r.code === 'too_many_attempts') setOtp('');
        fail(r, 'otp');
    };

    const onOtpChange = (raw: string) => {
        const digits = raw.replace(/\D/g, '').slice(0, 6);
        setOtp(digits);
        if (error?.field === 'otp') setError(null);
        // Altıncı hane yazılınca (ya da kod yapıştırılınca) kendiliğinden doğrulanır.
        if (digits.length === 6 && digits !== otp) void submitOtp(digits);
    };

    const resend = async () => {
        if (step.kind !== 'otp' || busy || resendLeft > 0) return;
        setBusy(true);
        setError(null);
        const r = step.mode === 'claim' ? await claimDiscount(step.email, studentNo) : await lookupDiscount(step.email);
        setBusy(false);
        if (r.ok) return startOtp(step.mode, r.data.email, r.data.resendInSeconds);
        fail(r);
    };

    const label = formatDiscount(lang);
    const discounted = formatAmount(lang, quote(true).total);
    const errorText = error ? d.discountErrors[error.code] : null;
    const errorId = 'discount-error';

    return (
        <>
            <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={onClose} />
            <div className="dialog-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <motion.div
                    className="my-6 w-full max-w-[560px]"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 26 } }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.2 } }}
                >
                    <div
                        ref={panel}
                        className={`discount-panel glass glass-edge${shaking ? ' is-shaking' : ''}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="discount-title"
                        aria-describedby="discount-lead"
                    >
                        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
                            <div>
                                <p className="kicker">CODEWAVE 2026 · {label}</p>
                                <h2 id="discount-title" ref={title} tabIndex={-1} className="mt-3 text-[clamp(1.75rem,5vw,2.5rem)] leading-none font-extralight tracking-[-0.05em] outline-none">
                                    {step.kind === 'done' && step.status !== 'redeemed' ? d.successTitle : d.discountTitle}
                                </h2>
                            </div>
                            <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--line-hi)] text-mute transition-colors hover:text-ink" aria-label={d.dialogClose}>
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <p id="discount-lead" className="px-6 pt-4 text-[0.9375rem] leading-relaxed text-mute sm:px-8">
                            {step.kind === 'done' ? (step.status === 'redeemed' ? d.statusRedeemed : d.successLead(discounted)) : d.discountLead(label)}
                        </p>

                        {step.kind !== 'done' && (
                            <div className="discount-tabs mx-6 mt-6 sm:mx-8" role="tablist" aria-label={d.discountTabs}>
                                {TABS.map((t) => (
                                    <button
                                        key={t}
                                        ref={(el) => {
                                            tabRefs.current[t] = el;
                                        }}
                                        type="button"
                                        role="tab"
                                        id={`discount-tab-${t}`}
                                        aria-selected={tab === t}
                                        aria-controls="discount-tabpanel"
                                        tabIndex={tab === t ? 0 : -1}
                                        onClick={() => tab !== t && switchTab(t)}
                                        onKeyDown={onTabKey}
                                        disabled={busy}
                                    >
                                        {t === 'claim' ? d.tabClaim : d.tabLookup}
                                    </button>
                                ))}
                                <span className="discount-tabs-thumb" data-tab={tab} aria-hidden="true" />
                            </div>
                        )}

                        <div className="perf mt-6" aria-hidden="true" />

                        <div className="p-6 sm:p-8" id="discount-tabpanel" role={step.kind === 'done' ? undefined : 'tabpanel'} aria-labelledby={step.kind === 'done' ? undefined : `discount-tab-${tab}`}>
                            {step.kind === 'form' && (
                                <form className="grid gap-4" onSubmit={onSubmitForm} noValidate>
                                    {note && (
                                        <p className="discount-note" role="status">
                                            {note}
                                        </p>
                                    )}
                                    {tab === 'lookup' && !note && <p className="text-[0.9375rem] leading-relaxed text-mute">{d.lookupLead}</p>}

                                    <div className={`field${error?.field === 'email' ? ' has-error' : ''}`}>
                                        <label htmlFor="discount-email">{d.eduEmail}</label>
                                        <input
                                            ref={emailInput}
                                            id="discount-email"
                                            type="email"
                                            inputMode="email"
                                            autoComplete="email"
                                            autoCapitalize="off"
                                            spellCheck={false}
                                            enterKeyHint={tab === 'claim' ? 'next' : 'send'}
                                            maxLength={254}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (error?.field === 'email') setError(null);
                                            }}
                                            aria-invalid={error?.field === 'email' ? true : undefined}
                                            aria-describedby={error?.field === 'email' ? `discount-email-hint ${errorId}` : 'discount-email-hint'}
                                            required
                                        />
                                        <p className="hint" id="discount-email-hint">
                                            {d.eduEmailHint}
                                        </p>
                                    </div>

                                    {tab === 'claim' && (
                                        <div className={`field${error?.field === 'studentNo' ? ' has-error' : ''}`}>
                                            <label htmlFor="discount-student-no">{d.studentNo}</label>
                                            <input
                                                id="discount-student-no"
                                                inputMode="numeric"
                                                autoComplete="off"
                                                enterKeyHint="send"
                                                maxLength={15}
                                                value={studentNo}
                                                onChange={(e) => {
                                                    setStudentNo(e.target.value.replace(/\D/g, '').slice(0, 15));
                                                    if (error?.field === 'studentNo') setError(null);
                                                }}
                                                aria-invalid={error?.field === 'studentNo' ? true : undefined}
                                                aria-describedby={error?.field === 'studentNo' ? `discount-student-hint ${errorId}` : 'discount-student-hint'}
                                                required
                                            />
                                            <p className="hint" id="discount-student-hint">
                                                {d.studentNoHint}
                                            </p>
                                        </div>
                                    )}

                                    {errorText && (
                                        <p className="discount-error" id={errorId} role="alert">
                                            {errorText}
                                        </p>
                                    )}

                                    <button type="submit" className="btn btn-primary btn-lg btn-block mt-1" disabled={busy}>
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
                                    className="grid gap-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void submitOtp(otp);
                                    }}
                                    noValidate
                                >
                                    <p className="text-[0.9375rem] leading-relaxed text-mute" role="status">
                                        {d.otpLead(step.email)}
                                    </p>
                                    <div className={`field${error?.field === 'otp' ? ' has-error' : ''}`}>
                                        <label htmlFor="discount-otp">{d.otpLabel}</label>
                                        <input
                                            ref={otpInput}
                                            id="discount-otp"
                                            className="otp-input"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            enterKeyHint="done"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => onOtpChange(e.target.value)}
                                            aria-invalid={error?.field === 'otp' ? true : undefined}
                                            aria-describedby={errorText ? errorId : undefined}
                                            disabled={busy}
                                            placeholder="••••••"
                                        />
                                    </div>

                                    {errorText && (
                                        <p className="discount-error" id={errorId} role="alert">
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

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <button type="button" className="discount-link" onClick={() => switchTab(step.mode)} disabled={busy}>
                                            {d.changeEmail}
                                        </button>
                                        <button type="button" className="discount-link" onClick={resend} disabled={busy || resendLeft > 0} aria-live="polite">
                                            {resendLeft > 0 ? d.resendIn(resendLeft) : d.resend}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step.kind === 'done' && (
                                <div className="grid gap-5">
                                    <div className="discount-code-card">
                                        <span className="mono text-[0.6875rem] tracking-[0.18em] text-faint uppercase">{d.yourCode}</span>
                                        <strong className={`mono discount-code${step.status === 'redeemed' ? ' is-used' : ''}`}>{step.code}</strong>
                                        <span className="text-[0.875rem] text-mute">{step.email}</span>
                                    </div>
                                    {step.status === 'redeemed' ? (
                                        <button type="button" className="btn btn-ghost btn-lg btn-block" onClick={onClose}>
                                            <span>{d.dialogClose}</span>
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onContinue}>
                                            <span>{d.continueToTicket}</span>
                                            <span className="price">{discounted}</span>
                                            <ArrowRight className="arrow ml-auto" size={20} aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
