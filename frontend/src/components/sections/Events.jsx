"use client";

import { useState, useEffect } from "react";
import { getCurrentEvents } from "@/services/events";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ApiError } from "@/lib/api";
import EventCardSkeleton from "@/components/ui/Skeletons/EventCardSkeleton";
import SectionHeading from "@/components/ui/SectionHeading";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function resolveImage(url) {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function daysUntil(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(`${dateString}T00:00:00`);
    return Math.round((d - today) / 86400000);
}

function EventCard({ event, index, featured }) {
    const image = resolveImage(event.imageUrl);
    const d = new Date(`${event.date}T00:00:00`);
    const day = d.toLocaleDateString("tr-TR", { day: "2-digit" });
    const month = d.toLocaleDateString("tr-TR", { month: "short" });
    const left = daysUntil(event.date);
    const leftLabel = left <= 0 ? "Bugün" : left === 1 ? "Yarın" : `${left} gün kaldı`;

    return (
        <Link
            href={`/etkinlikler/${event.slug}`}
            className={`fade-up spot group relative block overflow-hidden rounded-[28px] bg-ink text-white ${featured ? "min-h-[420px] md:min-h-[520px] md:row-span-2" : "min-h-[240px]"}`}
            style={{ transitionDelay: `${index * 110}ms` }}
        >
            {/* Görsel ya da görsel yoksa büyük tarih numarasıyla grafik arka plan */}
            {image ? (
                <div className="zoom-img absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} aria-hidden="true" />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-deep to-[#070d18]" aria-hidden="true">
                    <span
                        className="zoom-img absolute -right-4 -bottom-10 font-display font-extrabold leading-none tracking-[-0.06em] text-white/10 select-none"
                        style={{ fontSize: featured ? "22rem" : "13rem", fontStretch: "75%" }}
                    >
                        {day}
                    </span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070d18]/95 via-[#070d18]/45 to-[#070d18]/10" aria-hidden="true" />

            <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[13px] font-semibold">
                        <span className="ping-dot !w-1.5 !h-1.5" aria-hidden="true" />
                        {leftLabel}
                    </span>
                    <div className="text-right leading-none transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
                        <span className="block font-display text-4xl md:text-5xl font-extrabold tracking-[-0.05em]" style={{ fontStretch: "80%" }}>{day}</span>
                        <span className="block mt-1 text-sm text-white/75 capitalize">{month}</span>
                    </div>
                </div>

                <div className="mt-10">
                    <p className="flex items-center gap-1.5 text-sm text-white/70">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">location_on</span>
                        {event.location}
                    </p>
                    <h3 className={`mt-2 font-display font-extrabold tracking-[-0.035em] leading-[1.02] ${featured ? "text-3xl md:text-[3.2rem]" : "text-2xl md:text-[1.75rem]"}`}>
                        {event.title}
                    </h3>
                    {featured && event.description && (
                        <p className="mt-3 text-white/75 max-w-lg line-clamp-2">{event.description}</p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-2 font-semibold text-sm">
                        <span className="relative">
                            Detaylar
                            <span className="absolute left-0 -bottom-0.5 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
                        </span>
                        <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function Events() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useScrollAnimation([isLoading, events]);

    useEffect(() => {
        let isCancelled = false;

        async function fetchUpcomingEvents() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getCurrentEvents();
                if (!isCancelled) {
                    const rawData = response?.data || response || [];
                    setEvents([...rawData].sort((a, b) => new Date(a.date) - new Date(b.date)));
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err instanceof ApiError ? err.message : "Etkinlikler yüklenirken bir hata oluştu.");
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        }

        fetchUpcomingEvents();
        return () => { isCancelled = true; };
    }, []);

    const visible = events.slice(0, 3);

    return (
        <section id="etkinlikler">
            <SectionHeading
                title="Yaklaşan etkinlikler"
                action={{ href: "/etkinlikler", label: "Etkinlik akışı" }}
                className="mb-10 md:mb-14"
            />

            {error ? (
                <p className="text-brand">{error}</p>
            ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <EventCardSkeleton key={index} index={index} total={3} />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="surface-card rounded-[28px] py-14 px-6 text-center fade-up">
                    <p className="font-display text-2xl font-bold text-ink">Takvim şu an boş</p>
                    <p className="mt-2 text-muted">Yeni etkinlikler planlanıyor. Geçmiş etkinliklere göz atabilirsin.</p>
                    <Link href="/etkinlikler" className="btn btn-ghost mt-6">Etkinlik akışı</Link>
                </div>
            ) : (
                <div className={`grid grid-cols-1 gap-5 md:gap-6 ${visible.length > 1 ? "md:grid-cols-[1.35fr_1fr]" : ""}`}>
                    {visible.map((event, index) => (
                        <EventCard key={event.id || index} event={event} index={index} featured={index === 0 && visible.length > 1} />
                    ))}
                </div>
            )}
        </section>
    );
}
