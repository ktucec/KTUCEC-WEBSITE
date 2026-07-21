"use client";

import { useState, useEffect } from "react";
import { getCurrentEvents } from "@/services/events";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
import EventCardSkeleton from "@/components/ui/Skeletons/EventCardSkeleton";

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
                console.log(response)
                if (!isCancelled) {
                    const rawData = response?.data || response || [];

                    const sortedEvents = [...rawData].sort(
                        (a, b) => new Date(a.date) - new Date(b.date)
                    );

                    setEvents(sortedEvents);
                }
            } catch (err) {
                if (!isCancelled) {
                    const msg = err instanceof ApiError ? err.message : "Etkinlikler yüklenirken bir hata oluştu.";
                    setError(msg);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchUpcomingEvents();

        return () => {
            isCancelled = true;
        };
    }, []);

    const formatEventDate = (dateString) => {
        const formatted = formatDate(dateString);
        if (!formatted) return { day: "", month: "" };

        const [day, month] = formatted.split(" ");
        return { day, month };
    };

    const getCardSpanClass = (index, total) => {
        if (total === 1) return "md:col-span-4 md:row-span-2 min-h-[360px]";
        if (total === 2) return "md:col-span-2 md:row-span-2 min-h-[320px]";

        if (total === 3) {
            if (index === 0) return "md:col-span-2 md:row-span-2 min-h-[320px]";
            return "md:col-span-2 md:row-span-1 min-h-[220px]";
        }

        // 4 veya daha fazla etkinlik durumu
        if (index === 0) return "md:col-span-2 md:row-span-2 min-h-[320px]";
        if (index === 1) return "md:col-span-2 md:row-span-1 min-h-[220px]";
        return "md:col-span-1 md:row-span-1 min-h-[220px]";
    };

    return (
        <section className="pt-12 md:pt-20" id="etkinlikler">
            {/* Section Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 fade-up">
                <span
                    className="material-symbols-outlined text-primary text-3xl md:text-4xl shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    event
                </span>
                <h2 className="font-headline-md text-2xl md:text-headline-md text-on-surface">
                    Yaklaşan Etkinlikler
                </h2>
            </div>

            {/* Error State */}
            {error ? (
                <div className="text-center py-12">
                    <p className="text-error font-body-lg">{error}</p>
                </div>
            ) : isLoading ? (
                /* Skeleton Loader: 4 Tane Bento Düzeninde Skeleton */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <EventCardSkeleton key={index} index={index} total={4} />
                    ))}
                </div>
            ) : events.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center text-center py-16 opacity-60 fade-up">
                    <span className="material-symbols-outlined text-5xl mb-3 text-on-surface-variant">
                        event_busy
                    </span>
                    <p className="font-body-lg text-on-surface-variant">
                        Şu anda planlanmış aktif bir etkinlik bulunmuyor.
                    </p>
                </div>
            ) : (
                /* Bento Grid */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
                    {events.map((event, index) => {
                        const { day, month } = formatEventDate(event.date);
                        const spanClass = getCardSpanClass(index, events.length);
                        const isFeatured = index === 0 && events.length > 1;

                        return (
                            <div
                                key={event.id || index}
                                className={`${spanClass} glass-panel-dark rounded-[20px] md:rounded-[24px] p-5 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group fade-up transition-all duration-300 hover:border-primary/50`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Arkaplan Katmanları */}
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/95 via-surface-container-highest/50 to-transparent z-10 pointer-events-none"></div>

                                {event.imageUrl ? (
                                    /* Görsel Varsa */
                                    <div
                                        className="absolute inset-0 bg-cover bg-center z-0 opacity-30 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                                        style={{ backgroundImage: `url('${event.imageUrl}')` }}
                                    ></div>
                                ) : (
                                    /* Görsel Yoksa Varsayılan Desen */
                                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-surface-container/20 to-transparent opacity-50 flex items-center justify-center pointer-events-none">
                                        <span className="material-symbols-outlined text-9xl text-primary/5 group-hover:scale-110 transition-transform duration-700 select-none">
                                            calendar_today
                                        </span>
                                    </div>
                                )}

                                {/* Üst Bilgi (Rozet ve Tarih) */}
                                <div className="relative z-20 flex justify-between items-start gap-4 mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-md text-[11px] md:text-[12px] uppercase backdrop-blur-md border border-primary/20">
                                            {event.location || "Etkinlik"}
                                        </span>
                                    </div>

                                    {/* Tarih Kutusu */}
                                    <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-surface-container/80 backdrop-blur-md rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-primary shadow-inner border border-white/10">
                                        <span className="font-headline-sm text-base md:text-lg leading-none font-bold">
                                            {day}
                                        </span>
                                        <span className="font-label-md text-[10px] md:text-xs uppercase">
                                            {month}
                                        </span>
                                    </div>
                                </div>

                                {/* İçerik Bilgisi */}
                                <div className="relative z-20">
                                    <h3
                                        className={`font-headline-md text-on-surface mb-2 leading-snug ${isFeatured ? "text-xl sm:text-2xl md:text-headline-md" : "text-base sm:text-lg md:text-headline-sm font-bold"
                                            }`}
                                    >
                                        {event.title}
                                    </h3>

                                    {event.description && (
                                        <p className="font-body-md text-xs sm:text-sm md:text-body-md text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                                            {event.description}
                                        </p>
                                    )}

                                    {isFeatured && (
                                        <button className="bg-surface/50 border border-primary text-primary px-5 py-1.5 md:px-6 md:py-2 rounded-xl font-label-md text-xs md:text-label-md hover:bg-primary hover:text-white transition-colors cursor-pointer mt-2">
                                            Detaylar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}