'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminVerificationModal from '@/components/ui/AdminVerificationModal';
import { loginAdmin, verifyCode } from '@/services/auth';
import { Icon } from '@/components/admin/ui';
import { ThemeButton } from '@/components/admin/theme';

export default function AdminLoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [caps, setCaps] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.email.trim() || !formData.password) {
            setError('E-posta adresi ve şifre alanları boş bırakılamaz.');
            return;
        }

        if (formData.password.length < 8 || formData.password.length > 32) {
            setError('Şifreler en az 8, en fazla 32 karakter uzunluğunda olmalıdır.');
            return;
        }

        setIsLoading(true);

        try {
            await loginAdmin(formData.email, formData.password);
            setIsVerificationModalOpen(true);
        } catch (err) {
            setError(err.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (code) => {
        await verifyCode(formData.email, code);
    };

    const handleVerificationSuccess = async () => {
        router.push('/admin/');
    };

    return (
        <div className="ad-auth">
            <div className="ad-auth-top">
                <ThemeButton />
            </div>

            <main style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: 22, position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="ad-logo" style={{ width: 54, height: 54, borderRadius: 16, margin: '0 auto 14px', fontSize: 19 }}>KC</div>
                    <h1 className="ad-h1" style={{ fontSize: 'clamp(24px, 6vw, 30px)' }}>Yönetim Paneli</h1>
                    <p className="ad-sub" style={{ margin: '6px auto 0' }}>KTÜCEC hesabınızla giriş yapın</p>
                </div>

                <div className="ad-auth-card">
                    <div className="ad-auth-in">
                        <form onSubmit={handleInitialSubmit} noValidate style={{ display: 'grid', gap: 18 }}>
                            {error && (
                                <div className="ad-err" role="alert">
                                    <Icon name="error" className="ad-ico-sm" fill />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="ad-label" htmlFor="email">E-posta adresi</label>
                                <div className="ad-search">
                                    <Icon name="mail" />
                                    <input
                                        className="ad-input"
                                        style={{ minHeight: 48 }}
                                        type="email"
                                        id="email"
                                        name="email"
                                        autoComplete="username"
                                        inputMode="email"
                                        autoCapitalize="none"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="admin@ktucec.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="ad-label" htmlFor="password">Şifre</label>
                                <div className="ad-search">
                                    <Icon name="lock" />
                                    <input
                                        className="ad-input"
                                        style={{ minHeight: 48, paddingRight: 48 }}
                                        type={showPw ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="ad-ib clear"
                                        style={{ right: 4 }}
                                        onClick={() => setShowPw((v) => !v)}
                                        aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                    >
                                        <Icon name={showPw ? 'visibility_off' : 'visibility'} className="ad-ico-sm" />
                                    </button>
                                </div>
                                {caps && (
                                    <p style={{ margin: '8px 2px 0', fontSize: 12.5, fontWeight: 600, color: 'var(--ad-warn)', display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <Icon name="keyboard_capslock" className="ad-ico-xs" /> Caps Lock açık
                                    </p>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading} className="ad-btn ad-btn-primary ad-btn-block" style={{ minHeight: 48, fontSize: 15 }}>
                                {isLoading ? (
                                    <>
                                        <Icon name="progress_activity" className="ad-ico-sm ad-spin" />
                                        Giriş yapılıyor…
                                    </>
                                ) : (
                                    <>
                                        Giriş yap
                                        <Icon name="arrow_forward" className="ad-ico-sm" />
                                    </>
                                )}
                            </button>

                            <p className="ad-muted" style={{ margin: 0, fontSize: 12.5, textAlign: 'center', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name="shield_lock" className="ad-ico-xs" />
                                Girişten sonra e-postanıza 6 haneli doğrulama kodu gönderilir.
                            </p>
                        </form>
                    </div>
                </div>

                <Link href="/" className="ad-btn ad-btn-ghost">
                    <Icon name="west" className="ad-ico-sm" />
                    Ana sayfaya dön
                </Link>
            </main>

            <AdminVerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => setIsVerificationModalOpen(false)}
                onSuccess={handleVerificationSuccess}
                onSubmit={handleVerifySubmit}
                email={formData.email}
            />
        </div>
    );
}
