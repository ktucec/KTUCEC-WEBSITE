"use client";

import { useEffect } from "react";

export default function ContactModal({ isOpen, onClose }) {
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

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                @keyframes checkScaleBounce {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-check-bounce {
                    animation: checkScaleBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>

            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"></div>

                <div
                    className="relative bg-neutral-900 text-white w-full max-w-sm rounded-[32px] p-8 md:p-10 shadow-2xl z-10 text-center animate-[slideUp_0.3s_ease-out] border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-check-bounce">
                        <span className="material-symbols-outlined text-[64px] text-green-400">check</span>
                    </div>

                    <h2 className="font-headline-md text-2xl md:text-3xl font-bold mb-4">
                        Mesajınızı aldık!
                    </h2>

                    <p className="font-body-md text-white/60 leading-relaxed mb-8">
                        En kısa sürede iletişim bilgileriniz üzerinden size geri dönüş yapacağız.
                    </p>

                    <button
                        onClick={onClose}
                        className="bg-primary text-white px-8 py-3 w-full rounded-xl font-label-md uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </>
    );
}