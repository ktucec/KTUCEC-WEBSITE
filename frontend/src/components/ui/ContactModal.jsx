"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

// Mesaj gönderildi onayı: tik işareti çizilir, etrafa konfeti saçılır.
export default function ContactModal({ isOpen, onClose }) {
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

    const confetti = Array.from({ length: 18 });

    // Modal doğrudan <body>'ye çizilir; böylece sayfadaki hiçbir animasyon/transform konumunu bozamaz
    return createPortal(
        <>
            <style>{`
                @keyframes check-draw { to { stroke-dashoffset: 0; } }
                @keyframes ring-pop { 0% { transform: scale(0); } 70% { transform: scale(1.12); } 100% { transform: scale(1); } }
                @keyframes confetti-burst {
                    0% { transform: translate(-50%, -50%) rotate(0); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--r)); opacity: 0; }
                }
            `}</style>

            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contact-ok-title">
                <div className="absolute inset-0 bg-[#070d18]/70 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" />

                <div
                    className="relative w-full max-w-sm rounded-[30px] bg-card text-ink border border-line p-8 md:p-10 text-center shadow-2xl animate-[modal-pop_0.55s_cubic-bezier(0.34,1.56,0.64,1)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative mx-auto w-24 h-24">
                        {confetti.map((_, i) => {
                            const a = (Math.PI * 2 * i) / confetti.length;
                            const d = 70 + (i % 3) * 18;
                            return (
                                <span
                                    key={i}
                                    className="absolute left-1/2 top-1/2 w-2 h-3 rounded-sm motion-reduce:hidden"
                                    style={{
                                        background: i % 3 === 0 ? "var(--sea)" : i % 3 === 1 ? "var(--brand)" : "#f5b700",
                                        "--dx": `${Math.cos(a) * d}px`,
                                        "--dy": `${Math.sin(a) * d}px`,
                                        "--r": `${i * 47}deg`,
                                        animation: `confetti-burst 0.9s cubic-bezier(0.16,1,0.3,1) ${0.25 + (i % 4) * 0.03}s both`,
                                    }}
                                    aria-hidden="true"
                                />
                            );
                        })}
                        <div className="w-24 h-24 rounded-full bg-brand grid place-items-center animate-[ring-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: "check-draw 0.45s ease-out 0.35s forwards" }} />
                            </svg>
                        </div>
                    </div>

                    <h2 id="contact-ok-title" className="mt-7 font-display text-3xl font-extrabold tracking-[-0.035em]">Mesajın ulaştı!</h2>
                    <p className="mt-3 text-muted leading-relaxed">En kısa sürede yazdığın e-posta adresinden sana dönüş yapacağız.</p>

                    <button onClick={onClose} className="btn btn-primary w-full mt-8">Tamam</button>
                </div>
            </div>
        </>,
        document.body
    );
}
