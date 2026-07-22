'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminVerificationModal from '@/components/ui/AdminVerificationModal';
import { loginAdmin, verifyCode } from '@/services/auth';

export default function AdminLoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
        <div className="bg-surface min-h-screen flex items-center justify-center p-4 w-full relative overflow-hidden">
            <main className="w-full max-w-md relative z-10">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 shadow-lg shadow-primary/5">
                        <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                    </div>
                    <h1 className="font-headline-md text-3xl text-on-surface">KTUCEC Admin</h1>
                    <p className="font-body-md text-on-surface-variant mt-2">Yönetim paneline giriş yapın</p>
                </div>

                <div className="bg-surface-container-lowest rounded-[24px] shadow-xl border border-outline-variant/30 overflow-hidden relative z-10">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-primary"></div>

                    <div className="p-8 sm:p-10">
                        <form onSubmit={handleInitialSubmit} className="space-y-6">

                            {error && (
                                <div className="p-4 text-sm text-error bg-error-container/30 border border-error/20 rounded-xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-xl">error</span>
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block font-label-md text-secondary mb-2 ml-1" htmlFor="email">
                                    E-posta Adresi
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="admin@ktucec.com"
                                        className="block w-full pl-11 pr-4 py-3.5 border border-outline-variant/50 rounded-xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-surface transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-label-md text-secondary mb-2 ml-1" htmlFor="password">
                                    Şifre
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="block w-full pl-11 pr-4 py-3.5 border border-outline-variant/50 rounded-xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-surface transition-all duration-200 font-mono tracking-widest"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent font-label-md rounded-xl text-white bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                            Giriş Yapılıyor...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Giriş Yap
                                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-label-md text-secondary hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-base mr-2">west</span>
                        Ana Sayfaya Dön
                    </Link>
                </div>

                <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-[10%] -left-[5%] w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[100px]"></div>
                </div>

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