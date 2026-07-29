"use client";

import { useEffect, useRef, useState } from "react";
import { getAllManagers } from "@/services/auth";
import ManagementBoardSkeleton from "@/components/ui/Skeletons/ManagementBoardSkeleton";
import ManagementCard, { getRoleInfo } from "@/components/ui/ManagementCard";

const TIER_ORDER = { president: 0, vp: 1, member: 2 };

export default function ManagementBoard() {
    const sectionRef = useRef(null);
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const fetchManagers = async () => {
            try {
                const res = await getAllManagers();
                if (!isCancelled) {
                    const data = res?.data || res || [];
                    setManagers(data);
                }
            } catch (err) {
                console.error("Yönetim kadrosu yüklenirken hata oluştu:", err);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchManagers();
        return () => { isCancelled = true; };
    }, []);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el || isLoading) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [isLoading]);

    if (isLoading) {
        return <ManagementBoardSkeleton />;
    }

    if (managers.length === 0) {
        return null;
    }

    const orderedManagers = [...managers].sort(
        (a, b) => TIER_ORDER[getRoleInfo(a).tier] - TIER_ORDER[getRoleInfo(b).tier]
    );

    return (
        <section className="pt-16 md:pt-24 relative" id="yonetim" ref={sectionRef}>
            <style>{`
                @keyframes mb-fade-slide-up {
                    0% { opacity: 0; transform: translateY(24px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .mb-animated-card {
                    opacity: 0;
                }
                .mb-animated-card.mb-visible {
                    animation: mb-fade-slide-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-primary-container/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative">

                <div className="flex items-center gap-3 md:gap-4 mb-10 md:mb-16 px-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner shrink-0">
                        <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            diversity_3
                        </span>
                    </div>
                    <div>
                        <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
                            Yönetim Kadromuz
                        </h2>
                        <p className="font-body-md text-on-surface-variant text-sm mt-1">
                            Kulübümüzü geleceğe taşıyan lider takım.
                        </p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest/50 backdrop-blur-md rounded-[32px] md:rounded-[40px] py-10 md:py-16 relative border border-outline-variant/30 shadow-2xl shadow-black/5 overflow-hidden">

                    <div className="relative z-10 px-6 sm:px-10 md:px-14">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7">
                            {orderedManagers.map((manager, i) => (
                                <ManagementCard
                                    key={manager.id}
                                    manager={manager}
                                    index={i}
                                    isVisible={isVisible}
                                    animationDelayMs={(i % 10) * 80}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}