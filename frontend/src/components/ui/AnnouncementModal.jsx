"use client";

import { useEffect } from "react";
import Link from 'next/link';
import { formatDate } from "@/lib/formatDate";

// Duyuru detayı: arka plan bulanıklaşır, kart aşağıdan yaylanarak gelir.
export default function AnnouncementModal({ isOpen, onClose, announcement, isLoading }) {
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const hasLink = !!announcement?.link;
    const dateText = announcement ? formatDate(announcement.createdAt || announcement.date) : "";

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
        >
            <div className="absolute inset-0 bg-[#070d18]/70 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" />

            <div
                className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-[30px] bg-card text-ink border border-line shadow-2xl animate-[modal-pop_0.55s_cubic-bezier(0.34,1.56,0.64,1)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-2 bg-gradient-to-r from-brand via-brand to-sea" aria-hidden="true" />

                <div className="p-7 md:p-10">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-5 grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-ink/5 hover:rotate-90 transition-all duration-300 cursor-pointer"
                        aria-label="Kapat"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>

                    {isLoading || !announcement ? (
                        <div className="animate-pulse py-4">
                            <div className="h-4 w-32 rounded bg-line" />
                            <div className="mt-6 h-8 w-4/5 rounded bg-line" />
                            <div className="mt-6 space-y-2.5">
                                <div className="h-4 w-full rounded bg-line/70" />
                                <div className="h-4 w-full rounded bg-line/70" />
                                <div className="h-4 w-2/3 rounded bg-line/70" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {dateText && <p className="text-sm font-semibold text-brand">{dateText}</p>}
                            <h2 id="announcement-title" className="mt-3 pr-10 font-display text-3xl md:text-4xl font-extrabold tracking-[-0.035em] leading-[1.05]">
                                {announcement.title}
                            </h2>

                            <p className="mt-6 text-lg leading-relaxed text-muted whitespace-pre-line">{announcement.content}</p>

                            <p className="mt-8 pt-6 border-t border-line text-[15px] text-muted">
                                Sorun mu var?{" "}
                                <Link href="/iletisim" className="font-semibold text-brand underline-offset-4 hover:underline">
                                    İletişim sayfasından
                                </Link>{" "}
                                bize yazabilirsin.
                            </p>

                            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button onClick={onClose} className="btn btn-ghost">Kapat</button>
                                {hasLink && (
                                    <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        Bağlantıyı aç
                                        <span className="material-symbols-outlined btn-icon text-[20px]" aria-hidden="true">arrow_outward</span>
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
