'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AnnouncementCard from '@/components/ui/AnnouncementCard';
import AnnouncementModal from '@/components/ui/AnnouncementModal';
import AnnouncementCardSkeleton from '@/components/ui/Skeletons/AnnouncementCardSkeleton';
import { getAnnouncements } from '@/services/announcements';
import { formatDate } from '@/lib/formatDate';

function AnnouncementsContent() {
    useScrollAnimation();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    useScrollAnimation([isLoading, filteredAnnouncements, currentPage]);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 768 ? 4 : 6);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isCancelled = false;

        async function fetchAllAnnouncements() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getAnnouncements();
                if (!isCancelled) {
                    setAnnouncements(result.data || []);
                    setFilteredAnnouncements(result.data || []);
                    setCurrentPage(1);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError("Duyurular sunucudan çekilirken bir hata oluştu.");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchAllAnnouncements();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam && announcements.length > 0) {
            const found = announcements.find(a => a.id === Number(idParam));
            if (found) {
                setSelectedAnnouncement(found);
                setIsModalOpen(true);
            }
        }
    }, [searchParams, announcements]);

    const handleFilter = () => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert("Başlangıç tarihi, bitiş tarihinden sonraki bir tarih olamaz.");
            return;
        }

        const filtered = announcements.filter(item => {
            if (!item.createdAt) return false;

            const itemTime = new Date(item.createdAt).getTime();
            if (isNaN(itemTime)) return false;

            let isValid = true;

            if (startDate) {
                const startObj = new Date(startDate);
                startObj.setHours(0, 0, 0, 0);
                if (itemTime < startObj.getTime()) isValid = false;
            }

            if (endDate) {
                const endObj = new Date(endDate);
                endObj.setHours(23, 59, 59, 999);
                if (itemTime > endObj.getTime()) isValid = false;
            }

            return isValid;
        });

        setFilteredAnnouncements(filtered);
        setCurrentPage(1);
    };

    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        setFilteredAnnouncements(announcements);
        setCurrentPage(1);
    };

    const handleOpenModal = async (announcement) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        router.replace(`/duyurular?id=${announcement.id}`, { scroll: false });

        await new Promise(resolve => setTimeout(resolve, 500));

        setSelectedAnnouncement(announcement);
        setIsModalLoading(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedAnnouncement(null);
            setIsModalLoading(false);
        }, 300);
        router.replace('/duyurular', { scroll: false });
    };

    const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAnnouncements.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const listElement = document.getElementById('announcements-list');
            if (listElement) {
                window.scrollTo({ top: listElement.offsetTop - 100, behavior: 'smooth' });
            }
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 3;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= 2) {
                pageNumbers.push(1, 2, 3);
            } else if (currentPage >= totalPages - 1) {
                pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
            }
        }
        return pageNumbers;
    };

    return (
        <>
            <main className="px-5 sm:px-gutter max-w-container-max mx-auto relative z-10 pb-28">
                <PageHeader
                    crumb="Duyurular"
                    lines={["Duyurular"]}
                    ghost="Yeni!"
                    description="Kulüpten haberler, etkinlik kayıtları ve kaçırmaman gereken fırsatlar."
                />

                {/* Tarih filtresi */}
                <section className="fade-up mb-10 md:mb-14">
                    <div className="surface-glass rounded-[26px] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-end gap-3 md:gap-4">
                        <label className="flex-1 block">
                            <span className="block text-sm font-semibold text-muted mb-2 ml-1">Başlangıç tarihi</span>
                            <input
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="field"
                                type="date"
                            />
                        </label>
                        <label className="flex-1 block">
                            <span className="block text-sm font-semibold text-muted mb-2 ml-1">Bitiş tarihi</span>
                            <input
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="field"
                                type="date"
                            />
                        </label>
                        <div className="flex gap-2">
                            <button onClick={handleFilter} className="btn btn-primary flex-1 md:flex-none">
                                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">filter_list</span>
                                Filtrele
                            </button>
                            {(startDate || endDate) && (
                                <button onClick={handleClearFilter} className="btn btn-ghost" aria-label="Filtreyi temizle">
                                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
                                    <span className="hidden sm:inline">Temizle</span>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {error ? (
                    <div className="surface-card rounded-[26px] py-14 px-6 text-center">
                        <p className="font-display text-2xl font-bold text-ink">Duyurular yüklenemedi</p>
                        <p className="mt-2 text-muted">{error} Sayfayı yenileyip tekrar dene.</p>
                    </div>
                ) : (
                    <div id="announcements-list" className="scroll-mt-32">
                        {isLoading ? (
                            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                                {Array.from({ length: itemsPerPage }).map((_, index) => (
                                    <AnnouncementCardSkeleton key={index} index={index} />
                                ))}
                            </section>
                        ) : filteredAnnouncements.length === 0 ? (
                            <div className="surface-card rounded-[26px] py-16 px-6 text-center">
                                <p className="font-display text-2xl font-bold text-ink">Bu aralıkta duyuru yok</p>
                                <p className="mt-2 text-muted">Tarih aralığını genişletmeyi ya da filtreyi temizlemeyi dene.</p>
                                {(startDate || endDate) && (
                                    <button onClick={handleClearFilter} className="btn btn-ghost mt-6">Filtreyi temizle</button>
                                )}
                            </div>
                        ) : (
                            <>
                                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                                    {currentItems.map((item, index) => (
                                        <AnnouncementCard
                                            key={item.id}
                                            title={item.title}
                                            description={item.content}
                                            date={formatDate(item.createdAt)}
                                            rawDate={item.createdAt}
                                            hasLink={!!item.link}
                                            index={index}
                                            onClick={() => handleOpenModal(item)}
                                        />
                                    ))}
                                </section>

                                {totalPages > 1 && (
                                    <nav className="mt-14 md:mt-20 flex justify-center items-center gap-2 fade-up" aria-label="Sayfalar">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            aria-label="Önceki sayfa"
                                            className="grid place-items-center w-12 h-12 rounded-full border border-line text-ink hover:border-brand hover:text-brand transition-all disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                                        </button>

                                        {getPageNumbers().map(num => (
                                            <button
                                                key={num}
                                                onClick={() => paginate(num)}
                                                aria-current={currentPage === num ? 'page' : undefined}
                                                className={`grid place-items-center w-12 h-12 rounded-full font-display font-bold text-lg transition-all duration-300 cursor-pointer ${currentPage === num
                                                    ? 'bg-brand text-white scale-110 shadow-[0_10px_24px_-8px_rgba(215,20,26,0.6)]'
                                                    : 'text-ink hover:bg-ink/5'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}

                                        {totalPages > 3 && currentPage < totalPages - 1 && (
                                            <span className="px-1 text-muted select-none">…</span>
                                        )}

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            aria-label="Sonraki sayfa"
                                            className="grid place-items-center w-12 h-12 rounded-full border border-line text-ink hover:border-brand hover:text-brand transition-all disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                                        </button>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>

            <AnnouncementModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                announcement={selectedAnnouncement}
                isLoading={isModalLoading}
            />
        </>
    );
}

export default function AnnouncementsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AnnouncementsContent />
        </Suspense>
    );
}