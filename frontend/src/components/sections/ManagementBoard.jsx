"use client";

import { useEffect, useRef, useState } from "react";
import { getAllManagers } from "@/services/auth";
import ManagementBoardSkeleton from "@/components/ui/Skeletons/ManagementBoardSkeleton";
import PresidentCard from "@/components/ui/PresidentCard";
import VicePresidentCard from "@/components/ui/VicePresidentCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const ROLE_LABELS = {
    3: "Yönetim Kurulu Üyesi",
};

const FALLBACK_GRADIENTS = [
    "from-primary/30 to-primary-container/40",
    "from-primary-container/40 to-primary/20",
    "from-primary/20 to-surface-container-highest",
    "from-primary-container/30 to-primary/30",
];

function getInitials(name) {
    if (!name) return "";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function getFullImageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ManagementBoard() {
    const sectionRef = useRef(null);
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    const tickerRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const scrollStartLeft = useRef(0);
    const resumeTimeout = useRef(null);
    const rafId = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    const exactScroll = useRef(0);

    const SPEED = 0.3; 
    const RESUME_DELAY = 600;

    const boardMembers = managers.filter((m) => m.managerRole == 3 || m.managerRole === "BoardMember");

    useEffect(() => {
        const track = tickerRef.current;
        if (!track || isLoading || boardMembers.length === 0) return;

        function tick() {
            if (!isDragging.current && !isPaused && track) {
                const half = track.scrollWidth / 2;

                exactScroll.current += SPEED;

                let next = exactScroll.current;
                next = ((next % half) + half) % half;

                track.scrollLeft = next;
                exactScroll.current = next; 
            }
            rafId.current = requestAnimationFrame(tick);
        }
        rafId.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(rafId.current);
    }, [isPaused, isLoading, boardMembers.length]);

    const pauseAndScheduleResume = () => {
        setIsPaused(true);
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        resumeTimeout.current = setTimeout(() => setIsPaused(false), RESUME_DELAY);
    };

    const handlePointerDown = (e) => {
        isDragging.current = true;
        setIsPaused(true);
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        dragStartX.current = e.clientX;

        scrollStartLeft.current = exactScroll.current;

        tickerRef.current.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current || !tickerRef.current) return;
        const track = tickerRef.current;
        const half = track.scrollWidth / 2;
        const dx = e.clientX - dragStartX.current;

        let next = scrollStartLeft.current - dx;
        next = ((next % half) + half) % half;

        track.scrollLeft = next;
        exactScroll.current = next; 
    };

    const handlePointerUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        pauseAndScheduleResume();
    };

    useEffect(() => {
        return () => {
            if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        };
    }, []);

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

    const president = managers.find((m) => m.managerRole == 1 || m.managerRole === "President" || m.managerRole === "Admin");
    const vicePresidents = managers.filter((m) => m.managerRole == 2 || m.managerRole === "VicePresident");

    if (isLoading) {
        return <ManagementBoardSkeleton />;
    }

    if (managers.length === 0) {
        return null;
    }

    return (
        <section className="pt-16 md:pt-24 relative" id="yonetim" ref={sectionRef}>
            <style>{`
                @keyframes mb-pulse-glow {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.15); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
                @keyframes mb-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes mb-draw-line {
                    from { stroke-dashoffset: 300; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes mb-fade-slide-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .mb-pulse-bg {
                    animation: mb-pulse-glow 4s ease-in-out infinite;
                }
                .mb-float {
                    animation: mb-float 5s ease-in-out infinite;
                }
                .mb-line {
                    stroke-dasharray: 300;
                    stroke-dashoffset: 300;
                }
                .mb-line.mb-line-visible {
                    animation: mb-draw-line 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .mb-animated-card {
                    opacity: 0;
                }
                .mb-animated-card.mb-visible {
                    animation: mb-fade-slide-up 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
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

                <div className="bg-surface-container-lowest/50 backdrop-blur-md rounded-[32px] md:rounded-[40px] pt-10 pb-16 sm:pt-16 sm:pb-20 relative border border-outline-variant/30 shadow-2xl shadow-black/5 overflow-hidden">

                    <div className="relative z-10 px-6 sm:px-10 md:px-16">
                        {vicePresidents.length === 1 ? (
                            <div className="relative flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 w-full">
                                <PresidentCard manager={president} isVisible={isVisible} />

                                {president && (
                                    <div className="hidden md:block absolute top-[40%] left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 z-0"></div>
                                )}

                                <VicePresidentCard manager={vicePresidents[0]} isVisible={isVisible} index={0} delayBase={300} />
                            </div>
                        ) : (
                            <div className="relative flex flex-col items-center">
                                <PresidentCard manager={president} isVisible={isVisible} />

                                {vicePresidents.length > 0 && (
                                    <div className="relative w-full max-w-2xl h-16 md:h-24 -mt-4 mb-2 z-10 pointer-events-none">
                                        <svg className="w-full h-full" viewBox="0 0 600 100" preserveAspectRatio="none" fill="none">
                                            <defs>
                                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.1" />
                                                </linearGradient>
                                            </defs>
                                            {vicePresidents.map((_, i) => {
                                                const targetX = 100 + i * (400 / (vicePresidents.length - 1));
                                                return (
                                                    <path
                                                        key={i}
                                                        d={`M300,0 L300,20 C300,60 ${targetX},40 ${targetX},80 L${targetX},100`}
                                                        stroke="url(#lineGrad)"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        className={`mb-line ${isVisible ? "mb-line-visible" : ""}`}
                                                        style={{ animationDelay: `${300 + i * 150}ms` }}
                                                    />
                                                );
                                            })}
                                        </svg>
                                    </div>
                                )}

                                {vicePresidents.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 relative z-20">
                                        {vicePresidents.map((manager, i) => (
                                            <VicePresidentCard key={manager.id} manager={manager} isVisible={isVisible} index={i} delayBase={600} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {boardMembers.length > 0 && (
                        <div className="mt-20 md:mt-28 relative w-full">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-md h-[1px] bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent"></div>

                            <div className="text-center mb-10 pt-8">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-[11px] md:text-xs text-on-surface-variant font-label-md uppercase tracking-[0.2em] border border-outline-variant/30 shadow-sm">
                                    Yönetim Kurulu Üyeleri
                                </span>
                            </div>

                            <div className="relative w-full md:w-[75%] lg:w-[60%] mx-auto">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[80%] bg-primary/60 hidden md:block z-20 rounded-full"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-[80%] bg-primary/60 hidden md:block z-20 rounded-full"></div>

                                <div className="absolute top-0 left-0 h-full w-8 sm:w-16 bg-gradient-to-r from-surface-container-lowest/90 to-transparent z-10 pointer-events-none"></div>

                                <div
                                    ref={tickerRef}
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={handlePointerUp}
                                    className="flex overflow-x-auto select-none cursor-grab active:cursor-grabbing hide-scrollbar"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {[...Array(4)].map((_, setIndex) => (
                                        <div
                                            key={setIndex}
                                            aria-hidden={setIndex !== 0}
                                            className="flex shrink-0 items-center gap-6 md:gap-8 pr-6 md:pr-8 py-6"
                                        >
                                            {boardMembers.map((manager, i) => (
                                                <div
                                                    key={`${manager.id}-${setIndex}`}
                                                    className="w-[140px] md:w-[185px] shrink-0 group relative p-[1px] rounded-[20px] bg-gradient-to-b from-outline-variant/40 to-transparent hover:from-primary/40 transition-colors duration-500 select-none"
                                                >
                                                    <div className="h-full bg-surface-container-lowest/90 backdrop-blur-md rounded-[19px] overflow-hidden flex flex-col shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10 pointer-events-none">

                                                        <div className="p-2 pb-0">
                                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container">
                                                                {manager.profileUrl ? (
                                                                    <img
                                                                        src={getFullImageUrl(manager.profileUrl)}
                                                                        alt={manager.nameSurname}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                                                                        draggable={false}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]} group-hover:scale-105 transition-transform duration-700 ease-out`}
                                                                    >
                                                                        <span className="font-headline-sm text-2xl md:text-3xl text-on-surface/60 font-bold mix-blend-overlay">
                                                                            {getInitials(manager.nameSurname)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                            </div>
                                                        </div>

                                                        <div className="p-3 md:p-4 text-center flex-1 flex flex-col justify-center bg-gradient-to-b from-transparent to-surface-container-lowest">
                                                            <p className="font-body-md text-sm text-on-surface font-semibold leading-tight group-hover:text-primary transition-colors">
                                                                {manager.nameSurname}
                                                            </p>
                                                            <p className="mt-1.5 text-[9px] md:text-[10px] text-on-surface-variant font-label-md uppercase tracking-[0.15em]">
                                                                {ROLE_LABELS[3]}
                                                            </p>
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div className="absolute top-0 right-0 h-full w-8 sm:w-16 bg-gradient-to-l from-surface-container-lowest/90 to-transparent z-10 pointer-events-none"></div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}