'use client';

import React, { useState, useEffect } from 'react';
import { getAnnouncementsCount } from '@/services/announcements';
import { getEventsCount } from '@/services/events';
import { getManagersCount } from '@/services/auth';
import { useAdmin } from '@/components/layout/AdminProvider';

export default function DashboardPage() {
    const { adminName, isRoleLoading } = useAdmin();

    const [counts, setCounts] = useState({
        announcementCount: 0,
        eventCount: 0,
        adminCount: 1
    });
    const [isLoading, setIsLoading] = useState(true);

    const parseCount = (res) => {
        if (typeof res === 'number') return res;
        if (typeof res?.data === 'number') return res.data;
        if (res?.data?.count !== undefined) return res.data.count;
        if (res?.count !== undefined) return res.count;
        return 0;
    };

    useEffect(() => {
        let isCancelled = false;

        const fetchDashboardData = async () => {
            try {
                const [announcementsRes, eventsRes, adminsRes] = await Promise.all([
                    getAnnouncementsCount(),
                    getEventsCount(),
                    getManagersCount()
                ]);

                if (!isCancelled) {
                    setCounts({
                        announcementCount: parseCount(announcementsRes),
                        eventCount: parseCount(eventsRes),
                        adminCount: parseCount(adminsRes)
                    });
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Dashboard verileri yüklenirken hata oluştu:", error);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchDashboardData();

        return () => {
            isCancelled = true;
        };
    }, []);

    if (isLoading || isRoleLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-on-surface-variant font-body-md font-medium p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 animate-pulse">
                    İstatistikler yükleniyor...
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-surface md:p-4">

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Genel Bakış</p>
                    <h1 className="font-headline-md text-3xl md:text-4xl text-on-surface mb-2">
                        Tekrar hoş geldin, <span className="text-primary">{adminName}</span>
                    </h1>
                    <p className="font-body-md text-on-surface-variant max-w-2xl">
                        KTUCEC web sitesi ve kulüp portföyü durumuna dair bugünün güncel verileri aşağıda listelenmiştir.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

                <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 group cursor-default">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <span className="material-symbols-outlined text-[32px]">campaign</span>
                        </div>
                    </div>
                    <h3 className="text-on-surface-variant font-label-md text-sm uppercase tracking-wider mb-2">Toplam Duyurular</h3>
                    <div className="flex items-baseline mt-1">
                        <p className="font-display-lg text-4xl text-on-surface leading-none">{counts.announcementCount}</p>
                        <p className="ml-2 font-body-md text-sm text-on-surface-variant">Aktif Duyuru</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 group cursor-default">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <span className="material-symbols-outlined text-[32px]">event</span>
                        </div>
                    </div>
                    <h3 className="text-on-surface-variant font-label-md text-sm uppercase tracking-wider mb-2">Toplam Etkinlikler</h3>
                    <div className="flex items-baseline mt-1">
                        <p className="font-display-lg text-4xl text-on-surface leading-none">{counts.eventCount}</p>
                        <p className="ml-2 font-body-md text-sm text-on-surface-variant">Planlanan Etkinlik</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 group cursor-default">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                            <span className="material-symbols-outlined text-[32px]">manage_accounts</span>
                        </div>
                    </div>
                    <h3 className="text-on-surface-variant font-label-md text-sm uppercase tracking-wider mb-2">Yöneticiler</h3>
                    <div className="flex items-baseline mt-1">
                        <p className="font-display-lg text-4xl text-on-surface leading-none">{counts.adminCount}</p>
                        <p className="ml-2 font-body-md text-sm text-on-surface-variant">Yetkili Hesap</p>
                    </div>
                </div>

            </div>
        </main>
    );
}