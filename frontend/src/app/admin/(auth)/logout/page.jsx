'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // TODO: Gerçek servisi bağladığında burayı aç
                // await LogoutAdmin();

                await new Promise(res => setTimeout(res, 800)); 

                router.push('/admin/login');
            } catch (error) {
                console.error('Çıkış işlemi başarısız:', error);
                router.push('/admin/login');
            }
        };

        performLogout();
    }, [router]);

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