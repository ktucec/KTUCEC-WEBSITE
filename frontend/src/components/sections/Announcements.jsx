"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AnnouncementCard from "../ui/AnnouncementCard";
import AnnouncementCardSkeleton from "@/components/ui/Skeletons/AnnouncementCardSkeleton";
import { getLatestAnnouncements } from "@/services/announcements";
import { ApiError } from "@/lib/api";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { formatDate } from "@/lib/formatDate";

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useScrollAnimation([isLoading, announcements]);

    useEffect(() => {
        let isCancelled = false;

        async function fetchAnnouncements() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getLatestAnnouncements(3);
                if (!isCancelled) {
                    setAnnouncements(result.data);
                }
            } catch (err) {
                if (!isCancelled) {
                    const msg = err instanceof ApiError ? err.message : "Duyurular yüklenirken bir hata oluştu.";
                    setError(msg);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchAnnouncements();

        return () => {
            isCancelled = true;
        };
    }, []);

    const isEmpty = !isLoading && !error && announcements.length === 0;

    return (
        <section className="pt-12 md:pt-20" id="duyurular">
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 fade-up">
                <span
                    className="material-symbols-outlined text-primary text-3xl md:text-4xl shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    campaign
                </span>
                <h2 className="font-headline-md text-2xl md:text-headline-md text-(--color-on-surface)">
                    Son Duyurular
                </h2>
            </div>

            {error ? (
                <p className="text-red-500 font-body-md">{error}</p>
            ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-12 md:py-16 opacity-60 fade-up">
                    <span className="material-symbols-outlined text-4xl md:text-5xl mb-3 text-on-surface-variant">
                        campaign
                    </span>
                    <p className="font-body-md text-on-surface-variant">
                        Henüz duyuru bulunmuyor.
                    </p>
                </div>
            ) : (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <AnnouncementCardSkeleton key={index} index={index} />
                        ))
                        : announcements.map((item, index) => (
                            <Link key={item.id} href={`/duyurular?id=${item.id}`} className="block h-full">
                                <AnnouncementCard
                                    id={item.id}
                                    title={item.title}
                                    description={item.content}
                                    date={formatDate(item.createdAt)}
                                    index={index}
                                />
                            </Link>
                        ))}
                </section>
            )}
        </section>
    );
}