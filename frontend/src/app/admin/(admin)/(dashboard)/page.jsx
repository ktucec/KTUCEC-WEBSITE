'use client';

import React, { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [counts, setCounts] = useState({
        announcementCount: 0,
        eventCount: 0,
        adminCount: 1
    });
    const [adminName, setAdminName] = useState("Admin");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // TODO: Gerçek auth servisini bağladığında burayı aç
                // const username = GetAdminUsername() || "Yönetici";
                // setAdminName(username);

                // Mock Username
                setAdminName("Kulüp Başkanı");

                // TODO: Gerçek API fonksiyonlarını bağladığında aşağıdaki Promise.all'u aç
                /*
                const [announcementsData, eventsData, adminsData] = await Promise.all([
                    GetAnnouncementsNumber(),
                    GetEventsNumber(),
                    GetAdminsNumber()
                ]);
                */

                // Mock Data (Geçici)
                const announcementsData = { count: 12 };
                const eventsData = { count: 8 };
                const adminsData = { count: 3 };

                setCounts({
                    announcementCount: announcementsData?.count ?? announcementsData ?? 0,
                    eventCount: eventsData?.count ?? eventsData ?? 0,
                    adminCount: adminsData?.count ?? adminsData ?? 1
                });
            } catch (error) {
                console.error("Dashboard verileri yüklenirken hata oluştu:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
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