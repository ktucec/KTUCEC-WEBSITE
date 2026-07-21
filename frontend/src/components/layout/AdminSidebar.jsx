'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => {
        if (pathname.startsWith('/admin/announcements') || pathname.startsWith('/admin/events')) {
            setIsPanelOpen(true);
        }
    }, [pathname]);

    const getLinkClass = (path, level = 1) => {
        const isActive = path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);

        if (level === 2) {
            return `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${isActive ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant hover:bg-surface-container'}`;
        }

        return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group font-medium ${isActive ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container text-on-surface-variant'}`;
    };

    const isPanelActive = pathname.startsWith('/admin/announcements') || pathname.startsWith('/admin/events');

    return (
        <>
            <button
                onClick={() => setIsMobileOpen(true)}
                className={`fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-primary shadow-sm hover:bg-surface-container transition-colors ${isMobileOpen ? 'hidden' : 'flex'}`}
            >
                <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                />
            )}

            <aside className={`fixed left-0 top-0 z-40 w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-screen flex-shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                <div className="flex-1 flex flex-col overflow-y-auto">

                    <div className="flex items-center gap-3 p-4 border-b border-outline-variant/30 shrink-0">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                        </div>
                        <span className="font-display-lg text-xl tracking-tight text-on-surface">
                            KTUCEC<span className="text-primary font-bold">Admin</span>
                        </span>
                    </div>

                    <nav className="p-4 space-y-1">
                        <p className="font-label-md text-[11px] text-secondary uppercase tracking-wider mb-3 px-2">
                            Ana Menü
                        </p>

                        <Link
                            href="/admin"
                            className={getLinkClass('/admin', 1)}
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <span className="material-symbols-outlined">space_dashboard</span>
                            <span>Dashboard</span>
                        </Link>

                        <div className="pt-1">
                            <button
                                onClick={() => setIsPanelOpen(!isPanelOpen)}
                                className={`w-full cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group font-medium ${isPanelActive ? 'bg-primary/5 text-primary font-bold' : isPanelOpen ? 'bg-surface-container text-on-surface' : 'hover:bg-surface-container text-on-surface-variant'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined">layers</span>
                                    <span>Panel</span>
                                </div>
                                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isPanelOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>

                            {isPanelOpen && (
                                <div className="pl-4 pr-1 py-2 space-y-1 bg-surface-container-low border-l-2 border-outline-variant/30 mt-1 rounded-r-lg">
                                    <Link
                                        href="/admin/announcements"
                                        className={getLinkClass('/admin/announcements', 2)}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        <span className="material-symbols-outlined text-base">campaign</span>
                                        <span>Duyurular</span>
                                    </Link>

                                    <Link
                                        href="/admin/events"
                                        className={getLinkClass('/admin/events', 2)}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        <span className="material-symbols-outlined text-base">event</span>
                                        <span>Etkinlikler</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="pt-1 border-t border-outline-variant/30 mt-2">
                            <Link
                                href="/admin/managers"
                                className={getLinkClass('/admin/managers', 1)}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <span className="material-symbols-outlined">manage_accounts</span>
                                <span>Managers</span>
                            </Link>
                        </div>

                        <div className="pt-2 border-t border-outline-variant/30 mt-2">
                            <Link
                                href="/admin/settings"
                                className={getLinkClass('/admin/settings', 1)}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <span className="material-symbols-outlined">settings</span>
                                <span>Settings</span>
                            </Link>
                        </div>
                    </nav>
                </div>

                <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest shrink-0">
                    <Link
                        href="/admin/logout"
                        className="flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 text-error hover:text-[var(--color-on-error-container)] hover:bg-error-container/30 rounded-lg transition-colors font-medium w-full group"
                    >
                        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span>
                        <span>Çıkış Yap</span>
                    </Link>
                </div>

            </aside>
        </>
    );
}