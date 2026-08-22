'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getFormApplications, deleteFormApplication } from '@/services/forms';
import { formatDate } from '@/lib/formatDate';
import { ApiError } from '@/lib/api';

export default function FormApplicationsPage() {
    const params = useParams();
    const formId = params.id;

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchApplications = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getFormApplications(formId);

                if (!isCancelled) {
                    const responseData = response?.data || response;
                    setData(responseData);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError('Yanıtlar yüklenirken bir hata oluştu.');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        if (formId) {
            fetchApplications();
        }

        return () => {
            isCancelled = true;
        };
    }, [formId]);

    const handleDelete = async (applicationId) => {
        const confirmed = window.confirm('Bu başvuruyu silmek istediğinize emin misiniz?');
        if (!confirmed) return;

        setDeletingId(applicationId);
        try {
            await deleteFormApplication(applicationId);

            setData(prev => ({
                ...prev,
                rows: prev.rows.filter(row => row.applicationId !== applicationId)
            }));
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'Başvuru silinirken bir hata oluştu.';
            alert(msg);
        } finally {
            setDeletingId(null);
        }
    };

    const exportToCSV = () => {
        if (!data || !data.rows || data.rows.length === 0) {
            alert('Dışa aktarılacak veri bulunamadı.');
            return;
        }

        const baseHeaders = ['ID', 'Ad Soyad', 'E-posta'];
        const dynamicHeaders = data.headers;
        const endHeaders = ['Tarih'];
        const allHeaders = [...baseHeaders, ...dynamicHeaders, ...endHeaders];

        const escapeCSV = (str) => {
            if (str == null) return '""';
            const stringVal = String(str);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return `"${stringVal}"`;
        };

        const csvRows = [];
        csvRows.push(allHeaders.map(escapeCSV).join(','));

        data.rows.forEach(row => {
            const rowData = [
                row.applicationId,
                row.userNameSurname || 'Misafir',
                row.userEmail || '-',
                ...row.values,
                formatDate(row.submittedAt)
            ];
            csvRows.push(rowData.map(escapeCSV).join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const safeTitle = (data.formTitle || 'Form_Yanitlari').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const dateStr = new Date().toISOString().slice(0, 10);

        link.setAttribute('href', url);
        link.setAttribute('download', `${safeTitle}_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-hidden bg-surface md:p-4">
            <div className="w-full max-w-full min-w-0 mx-auto">

                <div className="mb-6">
                    <Link
                        href="/admin/forms"
                        className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors font-label-md mb-4"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Formlara Dön
                    </Link>

                    {isLoading ? (
                        <div className="h-10 w-1/3 bg-surface-container-high rounded animate-pulse"></div>
                    ) : (
                        <div>
                            <h1 className="font-headline-md text-2xl md:text-3xl text-on-surface flex items-center gap-3">
                                {data?.formTitle || 'Form Yanıtları'}
                                <span className="text-sm font-label-md bg-primary-container text-white px-3 py-1 rounded-full">
                                    {data?.rows?.length || 0} Yanıt
                                </span>
                            </h1>
                            <p className="font-body-md text-on-surface-variant mt-2 max-w-3xl">
                                Bu forma yapılan tüm başvuruları, kullanıcı bilgilerini ve verdikleri yanıtları aşağıdan inceleyebilirsiniz.
                                Tablo formdaki soru sayısına göre dinamik olarak genişlemektedir. Uzun yanıtları kendi kutucukları içinde kaydırarak (scroll) okuyabilirsiniz.
                            </p>
                        </div>
                    )}
                </div>

                {/* Horizontal scroll lives ONLY here, no sticky columns, so it never depends on parent layout being min-w-0 correct */}
                <div className="w-full max-w-full min-w-0 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm mb-6 relative">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <span className="material-symbols-outlined text-primary text-5xl animate-spin">
                                progress_activity
                            </span>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-error font-medium">
                            {error}
                        </div>
                    ) : !data || !data.rows || data.rows.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-5xl mb-3 opacity-50">
                                inboxes
                            </span>
                            <p className="font-medium text-lg">Henüz yanıt yok.</p>
                            <p className="text-sm mt-1">Bu form için henüz bir başvuru yapılmamış.</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-full overflow-x-scroll [-webkit-overflow-scrolling:touch]" style={{ maxWidth: '100%' }}>
                            <table className="border-collapse whitespace-nowrap" style={{ minWidth: 'max-content' }}>
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                        <th className="px-5 py-4 font-label-md text-secondary uppercase tracking-wider sticky top-0 z-10 bg-surface-container-low align-top w-[80px]">
                                            ID
                                        </th>
                                        <th className="px-5 py-4 font-label-md text-secondary uppercase tracking-wider sticky top-0 z-10 bg-surface-container-low align-top min-w-[200px]">
                                            Kullanıcı
                                        </th>

                                        {data.headers.map((headerText, index) => (
                                            <th key={index} className="px-5 py-4 font-label-md text-secondary uppercase tracking-wider sticky top-0 z-10 bg-surface-container-low min-w-[200px] max-w-[300px] whitespace-normal break-words align-top">
                                                {headerText}
                                            </th>
                                        ))}

                                        <th className="px-5 py-4 font-label-md text-secondary uppercase tracking-wider sticky top-0 z-10 bg-surface-container-low align-top">Tarih</th>

                                        <th className="px-5 py-4 font-label-md text-secondary uppercase tracking-wider text-right sticky top-0 z-10 bg-surface-container-low align-top">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map((row) => (
                                        <tr
                                            key={row.applicationId}
                                            className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low transition-colors"
                                        >
                                            <td className="px-5 py-4 font-label-md text-on-surface-variant align-top w-[80px]">
                                                #{row.applicationId}
                                            </td>
                                            <td className="px-5 py-4 align-top min-w-[200px]">
                                                {row.userId ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-body-md text-on-surface font-semibold">{row.userNameSurname}</span>
                                                        <span className="font-body-md text-xs text-on-surface-variant">{row.userEmail}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md text-xs font-semibold text-secondary">
                                                        <span className="material-symbols-outlined text-[14px]">person_off</span>
                                                        Misafir
                                                    </span>
                                                )}
                                            </td>

                                            {row.values.map((val, index) => (
                                                <td key={index} className="px-5 py-4 align-top">
                                                    <div className="max-h-[120px] min-w-[200px] max-w-[300px] overflow-y-auto whitespace-pre-wrap break-words pr-2 font-body-md text-on-surface-variant text-sm md:text-base leading-relaxed [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-outline-variant/60 hover:[&::-webkit-scrollbar-thumb]:bg-outline-variant/90 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
                                                        {val || '-'}
                                                    </div>
                                                </td>
                                            ))}

                                            <td className="px-5 py-4 font-body-md text-sm text-on-surface-variant align-top">
                                                {formatDate(row.submittedAt)}
                                            </td>
                                            <td className="px-5 py-4 text-right align-top">
                                                <button
                                                    disabled={deletingId === row.applicationId}
                                                    onClick={() => handleDelete(row.applicationId)}
                                                    className="text-error hover:text-on-error-container transition-colors bg-transparent border-0 p-2 rounded-lg hover:bg-error-container/30 cursor-pointer inline-flex items-center disabled:opacity-50"
                                                    title="Başvuruyu Sil"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        {deletingId === row.applicationId ? 'progress_activity' : 'delete'}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!isLoading && !error && data?.rows?.length > 0 && (
                    <div className="flex justify-end pb-8">
                        <button
                            onClick={exportToCSV}
                            className="bg-primary hover:bg-primary-container text-white font-label-md px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Tabloyu Dışa Aktar (CSV)
                        </button>
                    </div>
                )}

            </div>
        </main>
    );
}