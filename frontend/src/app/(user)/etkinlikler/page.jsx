"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getAllEvents } from '@/services/events';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/formatDate';
import TimelineEventCard from '@/components/ui/TimelineEventCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function buildCircuitPath(count, height) {
    if (count === 0 || height === 0) return '';
    const segH = height / count;
    let d = `M50,0 `;
    for (let i = 0; i < count; i++) {
        const sideX = i % 2 === 0 ? 78 : 22;
        const yMid = segH * i + segH * 0.5;
        const yEnd = segH * (i + 1);
        d += `C50,${yMid - segH * 0.28} ${sideX},${yMid - segH * 0.12} ${sideX},${yMid} `;
        d += `C${sideX},${yMid + segH * 0.12} 50,${yEnd - segH * 0.28} 50,${yEnd} `;
    }
    return d;
}

export default function EventsPage() {
    const pathRef = useRef(null);
    const containerRef = useRef(null);
    const nodesRef = useRef([]);

    const [containerHeight, setContainerHeight] = useState(0);
    const [pathLength, setPathLength] = useState(0);

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        async function fetchEvents() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getAllEvents();
                if (!isCancelled) {
                    const rawData = response?.data || response || [];
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const mappedEvents = rawData.map((event, index) => {
                        const dateObj = new Date(event.date);

                        let fullImageUrl = null;
                        if (event.imageUrl) {
                            fullImageUrl = event.imageUrl.startsWith("http")
                                ? event.imageUrl
                                : `${API_URL}${event.imageUrl.startsWith("/") ? "" : "/"}${event.imageUrl}`;
                        }

                        return {
                            ...event,
                            imageUrl: fullImageUrl,
                            dateObj,
                            displayDate: formatDate(event.date),
                            align: index % 2 === 0 ? 'right' : 'left',
                            status: dateObj < today ? 'past' : 'active',
                            tag: dateObj < today ? 'Arşiv' : 'Etkinlik',
                            buttonText: dateObj < today ? null : "Detayları Keşfet",
                            buttonIcon: dateObj < today ? null : "arrow_forward",
                        };
                    });

                    setEvents(mappedEvents);
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

        fetchEvents();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.offsetHeight);
            }
        };
        measure();

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            resizeObserver = new ResizeObserver(measure);
            resizeObserver.observe(containerRef.current);
        }
        window.addEventListener('resize', measure);

        return () => {
            window.removeEventListener('resize', measure);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [events.length, isLoading]);

    useEffect(() => {
        if (pathRef.current) {
            const length = pathRef.current.getTotalLength();
            setPathLength(length);
            pathRef.current.style.strokeDasharray = length;
            pathRef.current.style.strokeDashoffset = length;
        }
    }, [containerHeight, events.length, isLoading]);

    useEffect(() => {
        const updateTimeline = () => {
            if (pathRef.current && containerRef.current && pathLength > 0) {
                const rect = containerRef.current.getBoundingClientRect();
                const total = rect.height - window.innerHeight;
                let percent = total > 0 ? (-rect.top) / total : 1;
                percent = Math.max(0, Math.min(1, percent));

                pathRef.current.style.strokeDashoffset = pathLength * (1 - percent);
            }

            nodesRef.current.forEach(node => {
                if (node) {
                    const rect = node.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.8) {
                        node.classList.add('active');
                    }
                }
            });
        };

        window.addEventListener('scroll', updateTimeline, { passive: true });
        const t = setTimeout(updateTimeline, 100);

        return () => {
            window.removeEventListener('scroll', updateTimeline);
            clearTimeout(t);
        };
    }, [pathLength]);

    const pathD = buildCircuitPath(events.length, containerHeight);

    return (
        <main className="pt-40 pb-7 overflow-x-hidden px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
            <section className="mb-32 text-center relative z-10">
                <nav className="flex items-center justify-center flex-wrap gap-1.5 md:gap-2 text-on-surface-variant/60 font-label-md text-xs md:text-label-md mb-3 md:mb-4 uppercase tracking-widest">
                    <Link href="/" className="hover:text-primary transition-colors">
                        Ana Sayfa
                    </Link>
                    <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">
                        chevron_right
                    </span>
                    <span className="text-primary font-bold">
                        Etkinlikler
                    </span>
                </nav>
                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">
                    Etkinlik Akışı
                </h1>
                <p className="font-size-10 font-body-lg md:text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                    Topluluğumuzun yolculuğuna eşlik edin. Geçmişin tecrübesiyle geleceği kodluyoruz.
                </p>
            </section>

            {error && (
                <div className="text-center py-12">
                    <p className="text-error font-body-lg">{error}</p>
                </div>
            )}

            {isLoading && !error && (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">
                        progress_activity
                    </span>
                    <p className="text-on-surface-variant font-body-lg animate-pulse">Etkinlikler yükleniyor...</p>
                </div>
            )}

            {!isLoading && !error && events.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[400px] opacity-60">
                    <span className="material-symbols-outlined text-5xl mb-3 text-on-surface-variant">
                        event_busy
                    </span>
                    <p className="font-body-lg text-on-surface-variant">Henüz kayıtlı etkinlik bulunmuyor.</p>
                </div>
            )}

            {!isLoading && !error && events.length > 0 && (
                <div ref={containerRef} className="relative overflow-x-hidden w-full min-h-[1500px]">
                    <svg
                        id="timeline-svg"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0"
                        preserveAspectRatio="none"
                        viewBox={`0 0 100 ${containerHeight || 1}`}
                    >
                        <path
                            ref={pathRef}
                            id="circuit-path"
                            className="fill-none stroke-primary stroke-[2px] opacity-30"
                            d={pathD}
                        />
                    </svg>

                    {events.map((event, index) => (
                        <TimelineEventCard
                            key={event.id}
                            event={event}
                            index={index}
                            ref={el => nodesRef.current[index] = el}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}