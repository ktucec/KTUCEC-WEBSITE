"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getAllManagers } from "@/services/auth";
import ManagementBoardSkeleton from "@/components/ui/Skeletons/ManagementBoardSkeleton";
import SectionHeading from "@/components/ui/SectionHeading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const AUTOPLAY_INTERVAL_MS = 3000;

export function getRoleInfo(manager) {
    const role = manager.managerRole;
    if (role == 1 || role === "President" || role === "Admin") {
        return { label: "Başkan", tier: "president" };
    }
    if (role == 2 || role === "VicePresident") {
        return { label: "Başkan Yardımcısı", tier: "vp" };
    }
    return { label: "Yönetim Kurulu Üyesi", tier: "member" };
}

function getInitials(name) {
    if (!name) return "";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function getFullImageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function FrameCard({ manager, index, isVisible, delayMs }) {
    const { label } = getRoleInfo(manager);
    const photoUrl = getFullImageUrl(manager.profileUrl);

    return (
        <div
            className={`frame-card ${isVisible ? "frame-visible" : ""}`}
            style={{ animationDelay: `${delayMs}ms` }}
        >
            <div className="frame-sprockets" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} />
                ))}
            </div>

            <div className="frame-photo">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt=""
                        className="frame-img"
                        draggable={false}
                    />
                ) : (
                    <div className="frame-fallback">
                        <span>{getInitials(manager.nameSurname)}</span>
                    </div>
                )}
                <span className="frame-index">{String(index + 1).padStart(2, "0")}</span>
            </div>

            <div className="frame-sprockets" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} />
                ))}
            </div>

            <div className="frame-caption">
                <p className="frame-name">{manager.nameSurname}</p>
                <span className="frame-role">{label}</span>
            </div>
        </div>
    );
}

export default function ManagementBoard() {
    const sectionRef = useRef(null);
    const scrollRef = useRef(null);
    const directionRef = useRef(1);
    const lastActionTimeRef = useRef(0);
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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
                if (!isCancelled) setIsLoading(false);
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
                    lastActionTimeRef.current = performance.now();
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [isLoading]);

    const getStep = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return 260;
        const card = el.querySelector(".frame-card");
        return card ? card.offsetWidth + 20 : 260;
    }, []);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }, []);

    useEffect(() => {
        if (isLoading || managers.length === 0) return;
        updateScrollState();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
        return () => {
            el.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [isLoading, managers.length, updateScrollState]);

    const stepScroll = useCallback((dir) => {
        const el = scrollRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        let next = el.scrollLeft + dir * getStep();

        if (next >= maxScroll - 4) {
            next = maxScroll;
            directionRef.current = -1;
        } else if (next <= 4) {
            next = 0;
            directionRef.current = 1;
        }

        el.scrollTo({ left: next, behavior: "smooth" });
    }, [getStep]);

    useEffect(() => {
        if (isLoading || managers.length === 0 || !isVisible) return;
        const el = scrollRef.current;
        if (!el) return;

        let rafId;

        const tick = (timestamp) => {
            if (lastActionTimeRef.current === 0) lastActionTimeRef.current = timestamp;

            if (timestamp - lastActionTimeRef.current >= AUTOPLAY_INTERVAL_MS) {
                lastActionTimeRef.current = timestamp;

                const maxScroll = el.scrollWidth - el.clientWidth;
                if (maxScroll > 0) {
                    if (el.scrollLeft >= maxScroll - 4) directionRef.current = -1;
                    else if (el.scrollLeft <= 4) directionRef.current = 1;

                    stepScroll(directionRef.current);
                }
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [isLoading, managers.length, isVisible, stepScroll]);

    useEffect(() => {
        if (isLoading || managers.length === 0) return;
        const el = scrollRef.current;
        if (!el) return;

        const markInteraction = () => {
            lastActionTimeRef.current = performance.now();
        };

        el.addEventListener("touchstart", markInteraction, { passive: true });
        el.addEventListener("pointerdown", markInteraction);

        return () => {
            el.removeEventListener("touchstart", markInteraction);
            el.removeEventListener("pointerdown", markInteraction);
        };
    }, [isLoading, managers.length]);

    const handleNavClick = (dir) => {
        directionRef.current = dir;
        lastActionTimeRef.current = performance.now();
        stepScroll(dir);
    };

    const orderedManagers = useMemo(() => {
        const presidents = [];
        const vps = [];
        const members = [];

        for (const manager of managers) {
            const tier = getRoleInfo(manager).tier;
            if (tier === "president") {
                presidents.push(manager);
            } else if (tier === "vp") {
                vps.push(manager);
            } else {
                members.push(manager);
            }
        }

        return [...presidents, ...shuffleArray(vps), ...shuffleArray(members)];
    }, [managers]);

    if (isLoading) return <ManagementBoardSkeleton />;
    if (managers.length === 0) return null;

    return (
        <section className="pt-16 md:pt-24 relative" id="yonetim" ref={sectionRef}>
            <div className="max-w-7xl mx-auto relative">
                <div className="mb-8 md:mb-12 px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        icon="diversity_3"
                        title="Yönetim Kadromuz"
                        subtitle="Kulübümüzü geleceğe taşıyan lider takım."
                    />
                </div>

                <div className="relative">
                    <div
                        className="frame-edge-fade left-0 bg-gradient-to-r from-surface to-transparent"
                        style={{ opacity: canScrollLeft ? 1 : 0 }}
                    />
                    <div
                        className="frame-edge-fade right-0 bg-gradient-to-l from-surface to-transparent"
                        style={{ opacity: canScrollRight ? 1 : 0 }}
                    />

                    <button
                        type="button"
                        aria-label="Önceki"
                        onClick={() => handleNavClick(-1)}
                        className={`frame-nav-btn left-0 md:-left-5 ${canScrollLeft ? "" : "frame-nav-hidden"}`}
                    >
                        <span className="material-symbols-outlined text-on-surface">chevron_left</span>
                    </button>

                    <div ref={scrollRef} className="frame-scroll px-4 sm:px-6 lg:px-8">
                        {orderedManagers.map((manager, i) => (
                            <FrameCard
                                key={manager.id}
                                manager={manager}
                                index={i}
                                isVisible={isVisible}
                                delayMs={Math.min(i, 14) * 45}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        aria-label="Sonraki"
                        onClick={() => handleNavClick(1)}
                        className={`frame-nav-btn right-0 md:-right-5 ${canScrollRight ? "" : "frame-nav-hidden"}`}
                    >
                        <span className="material-symbols-outlined text-on-surface">chevron_right</span>
                    </button>
                </div>
            </div>
        </section>
    );
}