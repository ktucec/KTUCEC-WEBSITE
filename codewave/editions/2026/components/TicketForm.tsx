'use client';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import type { Dict } from '@/editions/2026/i18n';
import {
    ATTENDEE_TYPES,
    EMPTY_REGISTRATION,
    FIELD_ORDER,
    validateField,
    validateRegistration,
    type Field,
    type FieldErrors,
    type Registration,
} from '@/editions/2026/lib/registration';
import { useLang } from './i18n/LanguageProvider';
import Price from './Price';

const DRAFT_KEY = 'cw26-ticket-draft';
type ServerError = keyof Dict['serverErrors'];

const fieldId = (f: Field) => `ticket-${f}`;

// Shopier'in döndürdüğü imzalı alanlarla gizli bir form kurulur ve ödeme sayfasına POST edilir.
export function postToShopier(action: string, fields: Record<string, string>) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.acceptCharset = 'UTF-8';
    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
}

// Bilet formu. Doğrulama tarayıcıda ve sunucuda aynı kurallarla yapılır; tutar sunucuda hesaplanır.
// Başarılı yanıtta imzalı alanlar onReady ile üst bileşene verilir (holografik geçiş, ardından Shopier).
export default function TicketForm({ onReady }: { onReady: (action: string, fields: Record<string, string>) => void }) {
    const { d, lang } = useLang();
    const summary = useRef<HTMLDivElement>(null);
    const [values, setValues] = useState<Registration>(EMPTY_REGISTRATION);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [showSummary, setShowSummary] = useState(false);
    const [busy, setBusy] = useState(false);
    const [serverError, setServerError] = useState<ServerError | null>(null);

    // Taslak bu sekmede saklanır: pencere kapanıp açılsa ya da Shopier'den geri dönülse de yazılanlar kalır.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(DRAFT_KEY);
            if (raw) setValues({ ...EMPTY_REGISTRATION, ...JSON.parse(raw), consent: false });
        } catch {
            // Bozuk ya da erişilemeyen taslak yok sayılır.
        }
        const onShow = (e: PageTransitionEvent) => {
            if (e.persisted) setBusy(false);
        };
        window.addEventListener('pageshow', onShow);
        return () => window.removeEventListener('pageshow', onShow);
    }, []);

    useEffect(() => {
        try {
            // Onay kutusu bilerek saklanmaz: her ödeme denemesinde yeniden işaretlenir.
            sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...values, consent: undefined }));
        } catch {
            // Depolama yoksa taslak tutulmaz; form yine çalışır.
        }
    }, [values]);

    const update = (field: Field, value: string | boolean) => {
        const next = { ...values, [field]: value } as Registration;
        setValues(next);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, next) }));
        if (serverError === 'invalid') setServerError(null);
    };
    const onText = (field: Field) => (e: ChangeEvent<HTMLInputElement>) => update(field, e.target.value);
    const onBlur = (field: Field) => () => {
        if (values[field] === '' && !errors[field]) return; // boş geçilen alan, gönderene kadar uyarılmaz
        setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (busy) return;
        const found = validateRegistration(values);
        setErrors(found);
        setServerError(null);
        if (Object.keys(found).length > 0) {
            setShowSummary(true);
            requestAnimationFrame(() => summary.current?.focus());
            return;
        }
        setShowSummary(false);
        setBusy(true);
        try {
            const res = await fetch('/api/shopier/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, lang }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.action && data.fields) {
                onReady(data.action, data.fields);
                return;
            }
            if (data.fields) {
                setErrors(data.fields);
                setShowSummary(true);
                requestAnimationFrame(() => summary.current?.focus());
            }
            const code = data.error as ServerError | undefined;
            setServerError(code && code in d.serverErrors ? code : 'unknown');
        } catch {
            setServerError('network');
        }
        setBusy(false);
    };

    const errorList = FIELD_ORDER.filter((f) => errors[f]);
    const describe = (f: Field, hint?: boolean) =>
        [hint ? `${fieldId(f)}-hint` : '', errors[f] ? `${fieldId(f)}-error` : ''].filter(Boolean).join(' ') || undefined;

    const text = (f: Field, label: string, props: InputHTMLAttributes<HTMLInputElement>, hint?: string, wide?: boolean) => (
        <div className={`field${errors[f] ? ' has-error' : ''}${wide ? ' sm:col-span-2' : ''}`}>
            <label htmlFor={fieldId(f)}>{label}</label>
            <input
                id={fieldId(f)}
                name={f}
                value={values[f] as string}
                onChange={onText(f)}
                onBlur={onBlur(f)}
                aria-invalid={errors[f] ? true : undefined}
                aria-describedby={describe(f, Boolean(hint))}
                required
                {...props}
            />
            {hint && (
                <p className="hint" id={`${fieldId(f)}-hint`}>
                    {hint}
                </p>
            )}
            {errors[f] && (
                <p className="err" id={`${fieldId(f)}-error`}>
                    {d.errors[errors[f]!]}
                </p>
            )}
        </div>
    );

    return (
        <form className="grid gap-5" onSubmit={onSubmit} noValidate aria-describedby="ticket-form-lead">
            <p id="ticket-form-lead" className="text-[0.9375rem] text-mute">
                {d.stubLead}
            </p>

            {showSummary && errorList.length > 0 && (
                <div className="error-summary" ref={summary} tabIndex={-1} role="alert">
                    <p className="font-medium">{d.errorSummary(errorList.length)}</p>
                    <ul className="mt-2 grid gap-1 text-[0.9375rem]">
                        {errorList.map((f) => (
                            <li key={f}>
                                <a href={`#${fieldId(f)}`} className="underline">
                                    {d.errors[errors[f]!]}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {text('firstName', d.firstName, { autoComplete: 'given-name', autoCapitalize: 'words', enterKeyHint: 'next' })}
                {text('lastName', d.lastName, { autoComplete: 'family-name', autoCapitalize: 'words', enterKeyHint: 'next' })}
                {text('email', d.email, { type: 'email', inputMode: 'email', autoComplete: 'email', autoCapitalize: 'off', spellCheck: false, enterKeyHint: 'next' }, d.emailHint, true)}
                {text('phone', d.phone, { type: 'tel', inputMode: 'tel', autoComplete: 'tel', enterKeyHint: 'next' }, d.phoneHint)}
                {text('city', d.city, { autoComplete: 'address-level2', autoCapitalize: 'words', enterKeyHint: 'done' }, d.cityHint)}
            </div>

            <fieldset className={`field border-0 p-0${errors.attendee ? ' has-error' : ''}`} id={fieldId('attendee')} tabIndex={-1} aria-describedby={describe('attendee')}>
                <legend className="mb-2">{d.attendee}</legend>
                <div className="grid grid-cols-3 gap-2">
                    {ATTENDEE_TYPES.map((type) => (
                        <label key={type} className="choice-option">
                            <input type="radio" name="attendee" value={type} checked={values.attendee === type} onChange={() => update('attendee', type)} required />
                            <span>{d.attendeeOptions[type]}</span>
                        </label>
                    ))}
                </div>
                {errors.attendee && (
                    <p className="err" id={`${fieldId('attendee')}-error`}>
                        {d.errors[errors.attendee]}
                    </p>
                )}
            </fieldset>

            <div className={`grid grid-cols-[22px_1fr] items-start gap-3${errors.consent ? ' has-error' : ''}`}>
                <input
                    type="checkbox"
                    id={fieldId('consent')}
                    name="consent"
                    className="mt-0.5 h-[22px] w-[22px]"
                    checked={values.consent}
                    onChange={(e) => update('consent', e.target.checked)}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={describe('consent')}
                    required
                />
                <label htmlFor={fieldId('consent')} className="text-[0.9375rem] leading-snug text-mute">
                    {d.consent}
                </label>
                {errors.consent && (
                    <p className="err col-start-2 text-[0.8125rem] font-medium text-danger" id={`${fieldId('consent')}-error`}>
                        {d.errors[errors.consent]}
                    </p>
                )}
            </div>

            {serverError && (
                <p className="rounded-[14px] border border-[var(--line-hi)] bg-white/[0.03] px-4 py-3 text-[0.9375rem]" role="alert">
                    {d.serverErrors[serverError]}
                </p>
            )}

            <div className="grid gap-2">
                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy} aria-describedby="ticket-note" data-cursor={d.pay}>
                    {busy ? (
                        <>
                            <LoaderCircle className="spin" size={20} aria-hidden="true" />
                            <span>{d.paying}</span>
                        </>
                    ) : (
                        <>
                            <span>{d.pay}</span>
                            <span className="price">
                                <Price />
                            </span>
                            <ArrowRight className="arrow ml-auto" size={20} aria-hidden="true" />
                        </>
                    )}
                </button>
                <p id="ticket-note" className="mono text-center text-[0.6875rem] tracking-[0.14em] text-faint uppercase" aria-live="polite">
                    {busy ? d.paying : d.secureNote}
                </p>
            </div>
        </form>
    );
}
