'use client';

import { useEffect } from 'react';
import { logoutAdmin } from '@/services/auth';

export default function AdminLogoutPage() {
    useEffect(() => {
        const performLogout = async () => {
            try {
                await logoutAdmin();
            } catch (error) {
                console.error('Çıkış işlemi sırasında bir hata oluştu:', error);
            } finally {
                window.location.href = '/admin/login';
            }
        };

        performLogout();
    }, []);

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">
                progress_activity
            </span>
            <h2 className="font-headline-sm text-xl text-on-surface">Çıkış Yapılıyor...</h2>
            <p className="font-body-md text-on-surface-variant mt-2">
                Güvenli bir şekilde oturumunuz kapatılıyor.
            </p>
        </div>
    );
}