"use client";

import { useEffect } from "react";

export default function AnnouncementModal({ isOpen, onClose, announcement }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !announcement) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            onClick={onClose} 
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"></div>
            
            {/* Modal Body */}
            <div 
                className="relative bg-surface text-on-surface w-full max-w-2xl rounded-[32px] p-8 md:p-10 shadow-2xl z-10 h-auto max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] border border-white/20"
                onClick={(e) => e.stopPropagation()} 
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors bg-surface-container hover:bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="mb-6 inline-flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full font-label-md text-[13px]">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {announcement.date}
                </div>
                
                <h2 className="font-headline-md text-2xl md:text-3xl mb-6 pr-12 text-on-surface">
                    {announcement.title}
                </h2>
                
                <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
                    <p>{announcement.content}</p>
                    
                    <p className="opacity-80 text-[15px] pt-4 border-t border-outline-variant/20">
                        Detaylı bilgi ve kayıt formu yakında KTUCEC resmi sosyal medya hesapları üzerinden paylaşılacaktır. Lütfen takipte kalın.
                    </p>
                </div>

                <div className="mt-10 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-label-md uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        Anladım
                    </button>
                </div>
            </div>
        </div>
    );
}