'use client';

import { useState, useEffect } from 'react';

export default function AdminVerificationModal({ isOpen, onClose, onSuccess }) {
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCode('');
            setError('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (code.length !== 6) {
            setError('Lütfen 6 haneli kodu eksiksiz giriniz.');
            return;
        }

        setIsVerifying(true);

        try {
            // TODO: Implement actual API fetch here for OTP validation
            // await VerifyOtpCode(code);
            await new Promise(res => setTimeout(res, 1000));

            // Mock Validation (Accepts '123456')
            if (code === '123456') {
                alert('Doğrulama başarılı!');
                onSuccess();
                onClose();
            } else {
                setError('Hatalı kod girdiniz. Lütfen tekrar deneyiniz.');
            }
        } catch (err) {
            setError('Doğrulama sırasında sunucu kaynaklı bir hata oluştu.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
                onClick={onClose}
            ></div>

            <div className="relative bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl z-10 animate-[slideUp_0.3s_ease-out] border border-outline-variant/30 flex flex-col p-8 text-center">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-on-surface hover:text-error transition-colors rounded-lg w-8 h-8 flex items-center justify-center z-20"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                </div>

                <h3 className="font-headline-sm text-xl text-on-surface mb-2">Güvenlik Doğrulaması</h3>
                <p className="font-body-md text-on-surface-variant text-sm mb-6">
                    İşlemi tamamlamak için kayıtlı e-posta adresinize gönderilen 6 haneli güvenlik kodunu giriniz. <br /> <span className="text-xs opacity-60">(Test Kodu: 123456)</span>
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-error-container/50 border border-error-container text-error rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
                        <span className="material-symbols-outlined text-base">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-lg font-bold text-center tracking-[0.5em] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                        placeholder="••••••"
                        required
                    />

                    <button
                        disabled={isVerifying}
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-container text-white font-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                        {isVerifying ? (
                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        ) : (
                            <span>Kodu Doğrula ve Kaydet</span>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}