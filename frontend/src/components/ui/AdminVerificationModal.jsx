'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/admin/ui';

export default function AdminVerificationModal({ isOpen, onClose, onSuccess, onSubmit, email }) {
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCode('');
            setError('');
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            const onKey = (e) => e.key === 'Escape' && onClose();
            window.addEventListener('keydown', onKey);
            return () => {
                clearTimeout(t);
                window.removeEventListener('keydown', onKey);
                document.body.style.overflow = 'unset';
            };
        }
        document.body.style.overflow = 'unset';
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const submit = async (value) => {
        setError('');
        if (value.length !== 6) {
            setError('Lütfen 6 haneli kodu eksiksiz giriniz.');
            return;
        }
        setIsVerifying(true);
        try {
            await onSubmit(value);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Doğrulama sırasında sunucu kaynaklı bir hata oluştu.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submit(code);
    };

    return (
        <div className="ad-dlg-wrap" style={{ zIndex: 150 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="ad-dlg" role="dialog" aria-modal="true" aria-labelledby="otp-title" style={{ width: 'min(400px, 100%)', textAlign: 'center' }}>
                <div className="ic brand" style={{ margin: '0 auto 14px', width: 56, height: 56, borderRadius: 18 }}>
                    <Icon name="mark_email_read" />
                </div>
                <h3 id="otp-title">Güvenlik doğrulaması</h3>
                <p>
                    <strong style={{ color: 'var(--ad-ink)', overflowWrap: 'anywhere' }}>{email}</strong> adresine gönderilen 6 haneli kodu girin.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
                    {error && (
                        <div className="ad-err" role="alert" style={{ textAlign: 'left', fontSize: 13 }}>
                            <Icon name="error" className="ad-ico-sm" fill />
                            <span>{error}</span>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        className="ad-input"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={code}
                        onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, '');
                            setCode(v);
                            if (v.length === 6 && !isVerifying) submit(v);
                        }}
                        aria-label="Doğrulama kodu"
                        placeholder="••••••"
                        style={{ minHeight: 56, textAlign: 'center', fontSize: 26, fontWeight: 800, letterSpacing: '0.5em', paddingLeft: '0.5em', fontFamily: 'var(--font-mono)' }}
                        required
                    />

                    <button disabled={isVerifying || code.length !== 6} type="submit" className="ad-btn ad-btn-primary ad-btn-block" style={{ minHeight: 48 }}>
                        {isVerifying ? <Icon name="progress_activity" className="ad-ico-sm ad-spin" /> : <Icon name="verified_user" className="ad-ico-sm" />}
                        {isVerifying ? 'Doğrulanıyor…' : 'Doğrula ve devam et'}
                    </button>
                    <button type="button" className="ad-btn ad-btn-ghost ad-btn-block" onClick={onClose}>Vazgeç</button>
                </form>
            </div>
        </div>
    );
}
