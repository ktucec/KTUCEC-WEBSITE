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
        <div className="ad-auth">
            <div className="ad-empty" style={{ position: 'relative', zIndex: 1 }} role="status">
                <div className="ico">
                    <span className="material-symbols-outlined ad-spin" aria-hidden="true">progress_activity</span>
                </div>
                <h3>Çıkış yapılıyor…</h3>
                <p>Oturumunuz güvenli bir şekilde kapatılıyor.</p>
            </div>
        </div>
    );
}
