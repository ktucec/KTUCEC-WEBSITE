'use client';

import { useEffect } from 'react';
import { formatDate } from '@/lib/formatDate'; 

export default function ViewContactMessageModal({ isOpen, onClose, contactData }) {
    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !contactData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0">
            {/* Background overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-slide-up">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
                    <h3 className="font-headline-sm text-xl text-on-surface font-semibold">
                        Mesaj Detayları
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-error-container/20 cursor-pointer flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">

                    {/* Sender Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/20">
                        <div>
                            <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider block mb-1">Gönderen</span>
                            <p className="font-body-lg text-on-surface font-medium">{contactData.nameSurname}</p>
                        </div>
                        <div>
                            <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider block mb-1">Gönderim Tarihi</span>
                            <p className="font-body-lg text-on-surface">{formatDate(contactData.createdAt)}</p>
                        </div>
                        {contactData.email && (
                            <div className="md:col-span-2">
                                <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider block mb-1">E-Posta Adresi</span>
                                <a href={`mailto:${contactData.email}`} className="font-body-lg text-primary hover:underline">
                                    {contactData.email}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Message Content */}
                    <div>
                        <span className="font-label-md text-[11px] text-secondary uppercase tracking-wider block mb-2">Konu: {contactData.subject}</span>
                        <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-4 md:p-5 text-on-surface whitespace-pre-wrap font-body-md leading-relaxed">
                            {contactData.message}
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-outline-variant/30 flex justify-end bg-surface-container-lowest rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                        Kapat
                    </button>
                </div>

            </div>
        </div>
    );
}