// Bilet formu doğrulaması: tarayıcıdaki form ve sunucudaki ödeme rotası aynı kuralları kullanır.
import type { Dict } from '@/editions/2026/i18n';

export const ATTENDEE_TYPES = ['student', 'professional', 'other'] as const;
export type AttendeeType = (typeof ATTENDEE_TYPES)[number];

export type Registration = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    attendee: AttendeeType | '';
    consent: boolean;
    // Açık rıza (TEOL ile paylaşım, ticari iletişim): zorunlu değil, seçim backend'e kaydedilir.
    openConsent: boolean;
    // Aydınlatma metni onayı: zorunlu.
    privacy: boolean;
};

export type Field = keyof Registration;
export type ErrorCode = keyof Dict['errors'];
export type FieldErrors = Partial<Record<Field, ErrorCode>>;

export const FIELD_ORDER: Field[] = ['firstName', 'lastName', 'email', 'phone', 'city', 'attendee', 'consent', 'privacy'];

export const EMPTY_REGISTRATION: Registration = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    attendee: '',
    consent: false,
    openConsent: false,
    privacy: false,
};

const NAME_RE = /^[\p{L}][\p{L}\p{M}' .-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const clean = (v: string) => v.normalize('NFC').replace(/\s+/g, ' ').trim();

// Türkiye numaraları 0XXXXXXXXXX biçimine, yurt dışı numaralar +<rakamlar> biçimine getirilir.
export function normalizePhone(raw: string): string | null {
    const trimmed = raw.trim();
    const digits = trimmed.replace(/\D/g, '');
    if (trimmed.startsWith('+') && !trimmed.startsWith('+90')) {
        return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
    }
    let national = digits;
    if (national.startsWith('90') && national.length === 12) national = national.slice(2);
    if (national.startsWith('0')) national = national.slice(1);
    return /^[2-5]\d{9}$/.test(national) ? `0${national}` : null;
}

export function validateField(field: Field, values: Registration): ErrorCode | undefined {
    switch (field) {
        case 'firstName':
        case 'lastName': {
            const v = clean(values[field]);
            if (!v) return field === 'firstName' ? 'firstNameRequired' : 'lastNameRequired';
            return v.length > 50 || !NAME_RE.test(v) ? 'nameInvalid' : undefined;
        }
        case 'email': {
            const v = values.email.trim();
            if (!v) return 'emailRequired';
            return v.length > 120 || !EMAIL_RE.test(v) ? 'emailInvalid' : undefined;
        }
        case 'phone':
            if (!values.phone.trim()) return 'phoneRequired';
            return normalizePhone(values.phone) ? undefined : 'phoneInvalid';
        case 'city': {
            const v = clean(values.city);
            if (!v) return 'cityRequired';
            return v.length > 60 || !NAME_RE.test(v) ? 'nameInvalid' : undefined;
        }
        case 'attendee':
            return ATTENDEE_TYPES.includes(values.attendee as AttendeeType) ? undefined : 'attendeeRequired';
        case 'consent':
            return values.consent ? undefined : 'consentRequired';
        case 'privacy':
            return values.privacy ? undefined : 'privacyRequired';
        case 'openConsent':
            return undefined;
    }
}

export function validateRegistration(values: Registration): FieldErrors {
    const errors: FieldErrors = {};
    for (const field of FIELD_ORDER) {
        const code = validateField(field, values);
        if (code) errors[field] = code;
    }
    return errors;
}

// Sunucuda: bilinmeyen gövdeyi güvenli bir Registration'a çevirir (fazla alanlar yok sayılır).
export function parseRegistration(input: unknown): Registration {
    const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
    const str = (k: string) => (typeof o[k] === 'string' ? (o[k] as string).slice(0, 200) : '');
    const attendee = str('attendee');
    return {
        firstName: clean(str('firstName')),
        lastName: clean(str('lastName')),
        email: str('email').trim().toLowerCase(),
        phone: str('phone'),
        city: clean(str('city')),
        attendee: ATTENDEE_TYPES.includes(attendee as AttendeeType) ? (attendee as AttendeeType) : '',
        consent: o.consent === true,
        openConsent: o.openConsent === true,
        privacy: o.privacy === true,
    };
}
