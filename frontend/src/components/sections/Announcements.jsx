"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AnnouncementCard from "../ui/AnnouncementCard";
import AnnouncementCardSkeleton from "@/components/ui/Skeletons/AnnouncementCardSkeleton";
import { getLatestAnnouncements } from "@/services/announcements";
import { ApiError } from "@/lib/api";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { formatDate } from "@/lib/formatDate";
import SectionHeading from "@/components/ui/SectionHeading";

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
                if (!isCancelled) setAnnouncements(result.data);
            } catch (err) {
                if (!isCancelled) {
                    const msg = err instanceof ApiError ? err.message : "Duyurular yüklenirken bir hata oluştu.";
                    setError(msg);
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        }

        fetchAnnouncements();
        return () => { isCancelled = true; };
    }, []);

    const isEmpty = !isLoading && !error && announcements.length === 0;

    return (
        <section id="duyurular">
            <SectionHeading
                title="Son duyurular"
                action={{ href: "/duyurular", label: "Tüm duyurular" }}
                className="mb-10 md:mb-14"
            />

            {error ? (
                <p className="text-brand">{error}</p>
            ) : isEmpty ? (
                <div className="surface-card rounded-[26px] py-14 px-6 text-center fade-up">
                    <p className="font-display text-2xl font-bold text-ink">Şimdilik sessiz</p>
                    <p className="mt-2 text-muted">Yeni bir duyuru yayınlandığında burada göreceksin.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <AnnouncementCardSkeleton key={index} index={index} />
                        ))
                        : announcements.map((item, index) => (
                            <Link key={item.id} href={`/duyurular?id=${item.id}`} className="block h-full rounded-[26px]">
                                <AnnouncementCard
                                    title={item.title}
                                    description={item.content}
                                    date={formatDate(item.createdAt)}
                                    rawDate={item.createdAt}
                                    hasLink={!!item.link}
                                    index={index}
                                />
                            </Link>
                        ))}
                </div>
            )}

            <Link href="/duyurular" className="sm:hidden mt-6 inline-flex items-center gap-1.5 font-semibold text-ink">
                Tüm duyurular
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_outward</span>
            </Link>
        </section>
    );
}
