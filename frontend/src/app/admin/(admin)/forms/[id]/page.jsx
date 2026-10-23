'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFormApplications, deleteFormApplication } from '@/services/forms';
import { ApiError } from '@/lib/api';
import { formatDateTime, parseDate, timeAgo, norm, pluralTr } from '@/lib/adminFormat';
import {
    Avatar,
    Badge,
    Drawer,
    EmptyState,
    ErrorState,
    Highlight,
    Icon,
    Linkified,
    PageHeader,
    SearchBox,
    Segmented,
    SkeletonRows,
    useConfirm,
    useToast,
} from '@/components/admin/ui';

const PAGE_SIZES = [25, 50, 100];

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */

const TR_MAP = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u' };
function slug(s) {
    return (
        String(s || 'form_yanitlari')
            .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TR_MAP[c])
            .replace(/[^a-z0-9]+/gi, '_')
            .replace(/^_+|_+$/g, '')
            .toLowerCase() || 'form_yanitlari'
    );
}

// CSV enjeksiyonuna karşı: formül gibi başlayan hücreleri etkisizleştirir
function csvCell(v) {
    let s = v == null ? '' : String(v);
    if (/^(=|@|[\t\r]|[+\-](?![\d\s.,()]))/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
}

function dayKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function rowValues(row, headers) {
    const v = Array.isArray(row.values) ? row.values : [];
    return headers.map((_, i) => (v[i] == null ? '' : String(v[i])));
}

/* ------------------------------------------------------------------ */
/* Sayfa                                                               */
/* ------------------------------------------------------------------ */

export default function FormApplicationsPage() {
    const params = useParams();
    const formId = params.id;
    const toast = useToast();
    const confirm = useConfirm();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Görünüm durumu
    const [query, setQuery] = useState('');
    const [who, setWho] = useState('all'); // all | member | guest
    const [period, setPeriod] = useState('all'); // all | today | 7d | 30d
    const [sort, setSort] = useState('new'); // new | old | name
    const [view, setView] = useState('table'); // table | cards
    const [dense, setDense] = useState(false);
    const [hiddenCols, setHiddenCols] = useState([]);
    const [colsOpen, setColsOpen] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(1);

    // Seçim / detay
    const [selected, setSelected] = useState(() => new Set());
    const [selectMode, setSelectMode] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [busyIds, setBusyIds] = useState(() => new Set());
    const [bulkBusy, setBulkBusy] = useState(false);

    const colsRef = useRef(null);

    /* ---- tercihleri hatırla ---- */
    useEffect(() => {
        try {
            const v = localStorage.getItem('adm-resp-view');
            if (v === 'cards' || v === 'table') setView(v);
            setDense(localStorage.getItem('adm-resp-dense') === '1');
        } catch {}
    }, []);
    useEffect(() => {
        try {
            const raw = localStorage.getItem(`adm-resp-cols-${formId}`);
            setHiddenCols(raw ? JSON.parse(raw) : []);
        } catch {
            setHiddenCols([]);
        }
    }, [formId]);

    const changeView = (v) => {
        setView(v);
        try {
            localStorage.setItem('adm-resp-view', v);
        } catch {}
    };
    const toggleDense = () => {
        setDense((d) => {
            try {
                localStorage.setItem('adm-resp-dense', d ? '0' : '1');
            } catch {}
            return !d;
        });
    };
    const toggleCol = (i) => {
        setHiddenCols((cur) => {
            const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
            try {
                localStorage.setItem(`adm-resp-cols-${formId}`, JSON.stringify(next));
            } catch {}
            return next;
        });
    };
    const showAllCols = () => {
        setHiddenCols([]);
        try {
            localStorage.removeItem(`adm-resp-cols-${formId}`);
        } catch {}
    };

    useEffect(() => {
        if (!colsOpen) return;
        const onDown = (e) => {
            if (colsRef.current && !colsRef.current.contains(e.target)) setColsOpen(false);
        };
        const onKey = (e) => e.key === 'Escape' && setColsOpen(false);
        document.addEventListener('mousedown', onDown);
        window.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            window.removeEventListener('keydown', onKey);
        };
    }, [colsOpen]);

    /* ---- veri ---- */
    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getFormApplications(formId);
            const d = response?.data || response;
            setData({
                formTitle: d?.formTitle || 'Form Yanıtları',
                headers: Array.isArray(d?.headers) ? d.headers : [],
                rows: Array.isArray(d?.rows) ? d.rows : [],
            });
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Yanıtlar yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, [formId]);

    useEffect(() => {
        if (formId) load();
    }, [formId, load]);

    const headers = data?.headers || [];
    const rows = data?.rows || [];

    /* ---- istatistikler ---- */
    const stats = useMemo(() => {
        const now = new Date();
        const todayKey = dayKey(now);
        const weekAgo = now.getTime() - 7 * 864e5;
        let today = 0;
        let week = 0;
        let members = 0;
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - i));
            return { key: dayKey(d), date: d, n: 0 };
        });
        const idx = new Map(days.map((d, i) => [d.key, i]));
        rows.forEach((r) => {
            const d = parseDate(r.submittedAt);
            if (r.userId) members++;
            if (!d) return;
            if (dayKey(d) === todayKey) today++;
            if (d.getTime() >= weekAgo) week++;
            const i = idx.get(dayKey(d));
            if (i != null) days[i].n++;
        });
        return { total: rows.length, today, week, members, guests: rows.length - members, days };
    }, [rows]);

    /* ---- filtre + sıralama ---- */
    const filtered = useMemo(() => {
        const q = norm(query.trim());
        const now = new Date();
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const cutoff = period === 'today' ? startToday : period === '7d' ? now.getTime() - 7 * 864e5 : period === '30d' ? now.getTime() - 30 * 864e5 : 0;

        let out = rows.filter((r) => {
            if (who === 'member' && !r.userId) return false;
            if (who === 'guest' && r.userId) return false;
            if (cutoff) {
                const d = parseDate(r.submittedAt);
                if (!d || d.getTime() < cutoff) return false;
            }
            if (q) {
                const hay = norm(`${r.userNameSurname || ''} ${r.userEmail || ''} ${r.applicationId} ${(r.values || []).join(' ')}`);
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        const t = (r) => parseDate(r.submittedAt)?.getTime() || 0;
        out = [...out];
        if (sort === 'new') out.sort((a, b) => t(b) - t(a) || b.applicationId - a.applicationId);
        else if (sort === 'old') out.sort((a, b) => t(a) - t(b) || a.applicationId - b.applicationId);
        else out.sort((a, b) => (a.userNameSurname || 'zzz').localeCompare(b.userNameSurname || 'zzz', 'tr'));
        return out;
    }, [rows, query, who, period, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const curPage = Math.min(page, pageCount);
    const pageRows = useMemo(() => filtered.slice((curPage - 1) * pageSize, curPage * pageSize), [filtered, curPage, pageSize]);

    useEffect(() => setPage(1), [query, who, period, sort, pageSize]);

    const filtersActive = query || who !== 'all' || period !== 'all';
    const clearFilters = () => {
        setQuery('');
        setWho('all');
        setPeriod('all');
    };

    const visibleCols = useMemo(() => headers.map((h, i) => ({ h, i })).filter((c) => !hiddenCols.includes(c.i)), [headers, hiddenCols]);

    /* ---- seçim ---- */
    const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.applicationId));
    const someOnPageSelected = pageRows.some((r) => selected.has(r.applicationId));

    const toggleOne = (id) =>
        setSelected((s) => {
            const n = new Set(s);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    const togglePage = () =>
        setSelected((s) => {
            const n = new Set(s);
            if (allOnPageSelected) pageRows.forEach((r) => n.delete(r.applicationId));
            else pageRows.forEach((r) => n.add(r.applicationId));
            return n;
        });
    const selectAllFiltered = () => setSelected(new Set(filtered.map((r) => r.applicationId)));
    const clearSelection = () => {
        setSelected(new Set());
        setSelectMode(false);
    };

    // Veri değişince artık olmayan seçimleri temizle
    useEffect(() => {
        setSelected((s) => {
            if (!s.size) return s;
            const ids = new Set(rows.map((r) => r.applicationId));
            const n = new Set([...s].filter((id) => ids.has(id)));
            return n.size === s.size ? s : n;
        });
    }, [rows]);

    /* ---- silme ---- */
    const removeLocal = (ids) => {
        const set = new Set(ids);
        setData((prev) => (prev ? { ...prev, rows: prev.rows.filter((r) => !set.has(r.applicationId)) } : prev));
    };

    const deleteOne = async (row) => {
        const name = row.userId ? row.userNameSurname : 'Misafir';
        const ok = await confirm({
            title: 'Başvuru silinsin mi?',
            message: `#${row.applicationId} numaralı ${name} başvurusu kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
            confirmText: 'Sil',
        });
        if (!ok) return;

        setBusyIds((s) => new Set(s).add(row.applicationId));
        try {
            await deleteFormApplication(row.applicationId);

            // Çekmece açıksa sıradakine geç
            if (activeId === row.applicationId) {
                const i = filtered.findIndex((r) => r.applicationId === row.applicationId);
                const next = filtered[i + 1] || filtered[i - 1];
                setActiveId(next ? next.applicationId : null);
            }
            removeLocal([row.applicationId]);
            toast.success('Başvuru silindi.');
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : 'Başvuru silinirken bir hata oluştu.');
        } finally {
            setBusyIds((s) => {
                const n = new Set(s);
                n.delete(row.applicationId);
                return n;
            });
        }
    };

    const deleteSelected = async () => {
        const ids = [...selected];
        if (!ids.length) return;
        const ok = await confirm({
            title: `${pluralTr(ids.length, 'başvuru')} silinsin mi?`,
            message: 'Seçili başvurular kalıcı olarak silinecek. Bu işlem geri alınamaz.',
            confirmText: `${ids.length} başvuruyu sil`,
        });
        if (!ok) return;

        setBulkBusy(true);
        const done = [];
        let failed = 0;
        for (const id of ids) {
            try {
                await deleteFormApplication(id);
                done.push(id);
            } catch {
                failed++;
            }
        }
        removeLocal(done);
        setSelected(new Set());
        setSelectMode(false);
        setBulkBusy(false);
        if (done.length) toast.success(`${pluralTr(done.length, 'başvuru')} silindi.`);
        if (failed) toast.error(`${pluralTr(failed, 'başvuru')} silinemedi.`);
    };

    /* ---- CSV ---- */
    const exportCSV = (list) => {
        if (!list.length) {
            toast.error('Dışa aktarılacak veri bulunamadı.');
            return;
        }
        const head = ['ID', 'Ad Soyad', 'E-posta', ...headers, 'Tarih'];
        const lines = [head.map(csvCell).join(',')];
        list.forEach((r) => {
            lines.push(
                [
                    r.applicationId,
                    r.userNameSurname || 'Misafir',
                    r.userEmail || '-',
                    ...rowValues(r, headers),
                    formatDateTime(r.submittedAt),
                ]
                    .map(csvCell)
                    .join(',')
            );
        });
        const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug(data?.formTitle)}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success(`${pluralTr(list.length, 'satır')} dışa aktarıldı.`);
    };

    const exportList = selected.size ? rows.filter((r) => selected.has(r.applicationId)) : filtered;

    /* ---- detay çekmecesi ---- */
    const activeRow = useMemo(() => rows.find((r) => r.applicationId === activeId) || null, [rows, activeId]);
    const activeIdx = activeRow ? filtered.findIndex((r) => r.applicationId === activeRow.applicationId) : -1;
    const prevRow = activeIdx > 0 ? filtered[activeIdx - 1] : null;
    const nextRow = activeIdx >= 0 && activeIdx < filtered.length - 1 ? filtered[activeIdx + 1] : null;

    useEffect(() => {
        if (!activeRow) return;
        const onKey = (e) => {
            const tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
            if (e.key === 'ArrowLeft' && prevRow) setActiveId(prevRow.applicationId);
            if (e.key === 'ArrowRight' && nextRow) setActiveId(nextRow.applicationId);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeRow, prevRow, nextRow]);

    const lastActive = useRef(null);
    if (activeRow) lastActive.current = activeRow;
    const drawerRow = activeRow || lastActive.current;

    const copyAnswers = async (row) => {
        const lines = [`${row.userNameSurname || 'Misafir'}${row.userEmail ? ` <${row.userEmail}>` : ''}`, formatDateTime(row.submittedAt), ''];
        const vals = rowValues(row, headers);
        headers.forEach((h, i) => lines.push(`${h}\n${vals[i] || '-'}\n`));
        (await copyText(lines.join('\n'))) ? toast.success('Yanıtlar panoya kopyalandı.') : toast.error('Kopyalanamadı.');
    };

    const copyEmail = async (email) => {
        (await copyText(email)) ? toast.success('E-posta kopyalandı.') : toast.error('Kopyalanamadı.');
    };

    /* ---- render parçaları ---- */
    const who2 = (r) => (r.userId ? r.userNameSurname || 'Üye' : 'Misafir');

    const answerMatches = (r) => {
        const q = norm(query.trim());
        if (!q) return 0;
        const headersLen = headers.length;
        const vals = rowValues(r, headers);
        let n = 0;
        for (let i = 0; i < headersLen; i++) if (vals[i] && norm(vals[i]).includes(q)) n++;
        return n;
    };

    const userCell = (r) => (
        <div className="ad-row" style={{ gap: 10, minWidth: 0 }}>
            <Avatar name={who2(r)} size="sm" />
            <div style={{ minWidth: 0 }}>
                <div className="strong ad-trunc" style={{ maxWidth: 210 }}>
                    {r.userId ? <Highlight text={r.userNameSurname} query={query} /> : <span className="ad-muted">Misafir</span>}
                </div>
                <div className="ad-trunc ad-muted" style={{ fontSize: 12.5, maxWidth: 210 }}>
                    {r.userEmail ? <Highlight text={r.userEmail} query={query} /> : <span>#{r.applicationId}</span>}
                </div>
                {answerMatches(r) > 0 && (
                    <div className="ad-badge warn" style={{ height: 20, marginTop: 4, fontSize: 11 }}>
                        <Icon name="search" className="ad-ico-xs" /> {answerMatches(r)} yanıtta eşleşti
                    </div>
                )}
            </div>
        </div>
    );

    const total = stats.total;
    const hasData = total > 0;

    return (
        <>
            <PageHeader
                back={{ href: '/admin/forms', label: 'Başvuru Formları' }}
                title={isLoading && !data ? 'Yanıtlar yükleniyor…' : data?.formTitle || 'Form Yanıtları'}
                description={
                    hasData
                        ? 'Satıra tıklayarak başvurunun tamamını okuyun, aratın, filtreleyin ve dışa aktarın.'
                        : undefined
                }
                actions={
                    <>
                        <button type="button" className="ad-ib bordered" onClick={load} aria-label="Yenile" data-tip="Yenile" disabled={isLoading}>
                            <Icon name="refresh" className={isLoading ? 'ad-spin' : ''} />
                        </button>
                        <button type="button" className="ad-btn ad-btn-primary" onClick={() => exportCSV(exportList)} disabled={!hasData}>
                            <Icon name="download" className="ad-ico-sm" />
                            {selected.size ? `Seçilenleri indir (${selected.size})` : filtersActive ? `Filtreliyi indir (${filtered.length})` : 'CSV indir'}
                        </button>
                    </>
                }
            />

            {/* Özet */}
            {hasData && (
                <section className="ad-stats ad-rise" aria-label="Özet">
                    <div className="ad-stat">
                        <div className="ic"><Icon name="inbox" /></div>
                        <div><b>{stats.total}</b><span className="l">Toplam başvuru</span></div>
                    </div>
                    <div className="ad-stat">
                        <div className="ic ok"><Icon name="today" /></div>
                        <div><b>{stats.today}</b><span className="l">Bugün</span></div>
                    </div>
                    <div className="ad-stat">
                        <div className="ic info"><Icon name="date_range" /></div>
                        <div><b>{stats.week}</b><span className="l">Son 7 gün</span></div>
                    </div>
                    <div className="ad-stat">
                        <div className="ic warn"><Icon name="how_to_reg" /></div>
                        <div>
                            <b>{stats.members}<span className="ad-muted" style={{ fontSize: 14, fontWeight: 600 }}> / {stats.guests}</span></b>
                            <span className="l">Üye / Misafir</span>
                        </div>
                    </div>
                    <div className="ad-stat" style={{ gridColumn: 'span 2', minWidth: 0 }}>
                        <Spark days={stats.days} />
                    </div>
                </section>
            )}

            {/* Araç çubuğu */}
            {(hasData || filtersActive) && (
                <>
                    <div className="ad-toolbar">
                        <SearchBox value={query} onChange={setQuery} placeholder="İsim, e-posta veya yanıtlarda ara…" label="Başvurularda ara" />
                        <div className="ad-toolbar-end">
                            <button
                                type="button"
                                className={`ad-btn ad-sel-btn ${view === 'cards' ? '' : 'ad-show-sm'}`}
                                aria-pressed={selectMode}
                                onClick={() => (selectMode ? clearSelection() : setSelectMode(true))}
                            >
                                <Icon name={selectMode ? 'close' : 'checklist'} className="ad-ico-sm" />
                                <span>{selectMode ? 'Bitir' : 'Seç'}</span>
                            </button>

                            <select className="ad-select" style={{ width: 'auto', minWidth: 140 }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sırala">
                                <option value="new">En yeni önce</option>
                                <option value="old">En eski önce</option>
                                <option value="name">İsme göre (A–Z)</option>
                            </select>

                            <div className="ad-pop" ref={colsRef}>
                                <button type="button" className="ad-btn" onClick={() => setColsOpen((o) => !o)} aria-expanded={colsOpen}>
                                    <Icon name="view_column" className="ad-ico-sm" />
                                    <span className="ad-hide-sm">Sütunlar</span>
                                    {hiddenCols.length > 0 && <span className="ad-badge brand">{headers.length - hiddenCols.length}/{headers.length}</span>}
                                </button>
                                {colsOpen && (
                                    <div className="ad-pop-panel" role="menu">
                                        <div className="ad-nav-label" style={{ padding: '6px 10px' }}>Görünen sorular</div>
                                        {headers.map((h, i) => (
                                            <label key={i} className="ad-pop-item">
                                                <input type="checkbox" className="ad-check" checked={!hiddenCols.includes(i)} onChange={() => toggleCol(i)} />
                                                <span className="ad-clamp2">{h}</span>
                                            </label>
                                        ))}
                                        <div className="ad-pop-sep" />
                                        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm ad-btn-block" onClick={showAllCols}>Hepsini göster</button>
                                    </div>
                                )}
                            </div>

                            <div className="ad-desk-only" style={{ display: 'contents' }}>
                                <Segmented
                                    label="Görünüm"
                                    value={view}
                                    onChange={changeView}
                                    options={[
                                        { value: 'table', icon: 'table_rows', label: 'Tablo' },
                                        { value: 'cards', icon: 'grid_view', label: 'Kart' },
                                    ]}
                                />
                                {view === 'table' && (
                                    <button type="button" className="ad-ib bordered" onClick={toggleDense} aria-pressed={dense} data-tip={dense ? 'Rahat satırlar' : 'Sıkı satırlar'} aria-label="Satır yoğunluğu">
                                        <Icon name={dense ? 'density_large' : 'density_small'} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="ad-toolbar" style={{ marginTop: -2 }}>
                        <Segmented
                            label="Kullanıcı türü"
                            scroll
                            value={who}
                            onChange={setWho}
                            options={[
                                { value: 'all', label: 'Tümü' },
                                { value: 'member', icon: 'verified_user', label: `Üyeler (${stats.members})` },
                                { value: 'guest', icon: 'person_off', label: `Misafir (${stats.guests})` },
                            ]}
                        />
                        <Segmented
                            label="Dönem"
                            scroll
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { value: 'all', label: 'Tüm zamanlar' },
                                { value: 'today', label: 'Bugün' },
                                { value: '7d', label: '7 gün' },
                                { value: '30d', label: '30 gün' },
                            ]}
                        />
                        {filtersActive && (
                            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={clearFilters}>
                                <Icon name="filter_alt_off" className="ad-ico-xs" />
                                Temizle
                            </button>
                        )}
                        <span className="ad-muted" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }} aria-live="polite">
                            {filtersActive ? `${filtered.length} / ${total} sonuç` : `${total} başvuru`}
                        </span>
                    </div>
                </>
            )}

            {/* İçerik */}
            {isLoading && !data ? (
                <div className="ad-tw"><SkeletonRows rows={7} /></div>
            ) : error && !data ? (
                <div className="ad-tw"><ErrorState message={error} onRetry={load} /></div>
            ) : !hasData ? (
                <div className="ad-tw">
                    <EmptyState icon="inbox" title="Henüz yanıt yok" text="Bu form için henüz bir başvuru yapılmamış. Yanıtlar geldiğinde burada listelenecek." />
                </div>
            ) : filtered.length === 0 ? (
                <div className="ad-tw">
                    <EmptyState
                        icon="search_off"
                        title="Sonuç bulunamadı"
                        text="Arama veya filtre kriterlerine uyan başvuru yok."
                        action={<button type="button" className="ad-btn" onClick={clearFilters}>Filtreleri temizle</button>}
                    />
                </div>
            ) : (
                <>
                    {/* Tablo (masaüstü) */}
                    {view === 'table' && (
                        <div className="ad-only-table ad-tw ad-fade-in">
                            <div className="ad-tscroll" style={{ maxHeight: 'calc(100dvh - 190px)', minHeight: 240 }}>
                                <table className={`ad-table ${dense ? 'dense' : ''}`} style={{ minWidth: 'max-content', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th className="sticky-l" style={{ left: 0, width: 46, minWidth: 46, paddingRight: 0 }}>
                                                <input
                                                    type="checkbox"
                                                    className="ad-check"
                                                    aria-label="Sayfadakilerin tümünü seç"
                                                    checked={allOnPageSelected}
                                                    ref={(el) => el && (el.indeterminate = !allOnPageSelected && someOnPageSelected)}
                                                    onChange={togglePage}
                                                />
                                            </th>
                                            <th className="sticky-l sticky-edge" style={{ left: 46, minWidth: 250 }}>Kullanıcı</th>
                                            {visibleCols.map(({ h, i }) => (
                                                <th key={i} style={{ minWidth: 220, maxWidth: 320, whiteSpace: 'normal', verticalAlign: 'bottom' }} title={h}>
                                                    <span className="ad-clamp2" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12.5 }}>{h}</span>
                                                </th>
                                            ))}
                                            <th style={{ minWidth: 150 }}>Tarih</th>
                                            <th className="sticky-r num" style={{ width: 96 }}><span className="ad-sr">İşlemler</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageRows.map((r) => {
                                            const vals = rowValues(r, headers);
                                            const isSel = selected.has(r.applicationId);
                                            return (
                                                <tr
                                                    key={r.applicationId}
                                                    className={`click ${isSel ? 'sel' : ''}`}
                                                    onClick={(e) => {
                                                        if (e.target.closest('button, a, input, label')) return;
                                                        setActiveId(r.applicationId);
                                                    }}
                                                >
                                                    <td className="sticky-l" style={{ left: 0, paddingRight: 0 }}>
                                                        <input type="checkbox" className="ad-check" aria-label={`${who2(r)} başvurusunu seç`} checked={isSel} onChange={() => toggleOne(r.applicationId)} />
                                                    </td>
                                                    <td className="sticky-l sticky-edge" style={{ left: 46 }}>
                                                        {userCell(r)}
                                                    </td>
                                                    {visibleCols.map(({ i }) => (
                                                        <td key={i} style={{ maxWidth: 320 }}>
                                                            {vals[i] ? (
                                                                <div className={dense ? 'ad-trunc' : 'ad-clamp3'} title={vals[i]} style={{ whiteSpace: dense ? 'nowrap' : 'pre-line', maxWidth: 300 }}>
                                                                    <Highlight text={vals[i]} query={query} />
                                                                </div>
                                                            ) : (
                                                                <span className="ad-muted">—</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        <div className="strong" style={{ fontSize: 13.5 }}>{timeAgo(r.submittedAt)}</div>
                                                        <div className="ad-muted" style={{ fontSize: 12 }}>{formatDateTime(r.submittedAt)}</div>
                                                    </td>
                                                    <td className="sticky-r num" style={{ whiteSpace: 'nowrap' }}>
                                                        <span className="ad-row-actions">
                                                            <button type="button" className="ad-ib" data-tip="Detay" aria-label="Detayı aç" onClick={() => setActiveId(r.applicationId)}>
                                                                <Icon name="open_in_full" className="ad-ico-sm" />
                                                            </button>
                                                            <button type="button" className="ad-ib danger" data-tip="Sil" aria-label="Başvuruyu sil" disabled={busyIds.has(r.applicationId)} onClick={() => deleteOne(r)}>
                                                                <Icon name={busyIds.has(r.applicationId) ? 'progress_activity' : 'delete'} className={`ad-ico-sm ${busyIds.has(r.applicationId) ? 'ad-spin' : ''}`} />
                                                            </button>
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Footer
                                total={filtered.length}
                                page={curPage}
                                pageCount={pageCount}
                                pageSize={pageSize}
                                setPage={setPage}
                                setPageSize={setPageSize}
                                selectedCount={selected.size}
                                onSelectAll={selectAllFiltered}
                            />
                        </div>
                    )}

                    {/* Kartlar (mobil + masaüstü kart görünümü) */}
                    <div className={view === 'table' ? 'ad-only-cards' : 'ad-cards-grid'}>
                        {pageRows.map((r) => {
                            const vals = rowValues(r, headers);
                            const answered = visibleCols.filter(({ i }) => vals[i]);
                            const preview = answered.slice(0, 2);
                            const more = answered.length - preview.length;
                            const isSel = selected.has(r.applicationId);
                            return (
                                <div key={r.applicationId} className={`ad-item ${isSel ? 'sel' : ''}`}>
                                    <button
                                        type="button"
                                        className="ad-item-head"
                                        style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', width: '100%' }}
                                        onClick={() => (selectMode ? toggleOne(r.applicationId) : setActiveId(r.applicationId))}
                                        aria-label={`${who2(r)} başvurusunu ${selectMode ? 'seç' : 'aç'}`}
                                    >
                                        {selectMode && (
                                            <input type="checkbox" className="ad-check" readOnly checked={isSel} tabIndex={-1} style={{ marginTop: 10 }} />
                                        )}
                                        <Avatar name={who2(r)} />
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div className="ad-item-title"><Highlight text={who2(r)} query={r.userId ? query : ''} /></div>
                                            <div className="ad-item-sub">{r.userEmail ? <Highlight text={r.userEmail} query={query} /> : `#${r.applicationId}`}</div>
                                        </div>
                                        <div className="ad-muted" style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{timeAgo(r.submittedAt)}</div>
                                    </button>

                                    {preview.length > 0 && (
                                        <div className="ad-qa">
                                            {preview.map(({ h, i }) => (
                                                <div key={i} className="ad-qa-row">
                                                    <b className="ad-trunc">{h}</b>
                                                    <span className="ad-clamp2"><Highlight text={vals[i]} query={query} /></span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="ad-item-meta">
                                        {!r.userId && <Badge icon="person_off">Misafir</Badge>}
                                        {more > 0 && <span className="ad-m">+{more} yanıt daha</span>}
                                        <span className="ad-m" style={{ marginLeft: 'auto' }}>#{r.applicationId}</span>
                                    </div>

                                    {!selectMode && (
                                        <div className="ad-item-actions">
                                            <button type="button" className="ad-btn" onClick={() => setActiveId(r.applicationId)}>
                                                <Icon name="open_in_full" className="ad-ico-sm" />
                                                Tümünü gör
                                            </button>
                                            <button type="button" className="ad-btn ad-btn-danger" style={{ flex: '0 0 auto', width: 46, padding: 0 }} aria-label="Sil" disabled={busyIds.has(r.applicationId)} onClick={() => deleteOne(r)}>
                                                <Icon name="delete" className="ad-ico-sm" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Kartlarda sayfalama: tablo görünümündeyse yalnızca mobilde */}
                    <div className={view === 'table' ? 'ad-only-cards' : ''} style={{ marginTop: 12 }}>
                        <div className="ad-card ad-tfoot" style={{ borderRadius: 14, border: '1px solid var(--ad-line)' }}>
                            <FooterInner
                                total={filtered.length}
                                page={curPage}
                                pageCount={pageCount}
                                pageSize={pageSize}
                                setPage={setPage}
                                setPageSize={setPageSize}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Toplu işlem çubuğu */}
            <div className={`ad-bulk ${selected.size ? 'on' : ''}`} role="region" aria-label="Toplu işlemler" aria-hidden={!selected.size}>
                <span>{selected.size} seçili</span>
                <button type="button" className="ad-btn ad-btn-sm" onClick={() => exportCSV(rows.filter((r) => selected.has(r.applicationId)))}>
                    <Icon name="download" className="ad-ico-sm" />
                    <span className="ad-desk-only">CSV</span>
                </button>
                <button type="button" className="ad-btn ad-btn-sm del" onClick={deleteSelected} disabled={bulkBusy}>
                    <Icon name={bulkBusy ? 'progress_activity' : 'delete'} className={`ad-ico-sm ${bulkBusy ? 'ad-spin' : ''}`} />
                    Sil
                </button>
                <button type="button" className="ad-ib" style={{ color: 'inherit' }} onClick={clearSelection} aria-label="Seçimi temizle">
                    <Icon name="close" className="ad-ico-sm" />
                </button>
            </div>

            {/* Detay çekmecesi */}
            <Drawer
                open={!!activeRow}
                onClose={() => setActiveId(null)}
                leading={drawerRow ? <Avatar name={who2(drawerRow)} size="lg" /> : null}
                title={drawerRow ? who2(drawerRow) : ''}
                subtitle={drawerRow ? (drawerRow.userEmail || `Başvuru #${drawerRow.applicationId}`) : ''}
                footer={
                    drawerRow && (
                        <>
                            <button type="button" className="ad-ib bordered" onClick={() => prevRow && setActiveId(prevRow.applicationId)} disabled={!prevRow} aria-label="Önceki başvuru" data-tip="Önceki ←">
                                <Icon name="arrow_back" />
                            </button>
                            <button type="button" className="ad-ib bordered" onClick={() => nextRow && setActiveId(nextRow.applicationId)} disabled={!nextRow} aria-label="Sonraki başvuru" data-tip="Sonraki →">
                                <Icon name="arrow_forward" />
                            </button>
                            <span className="ad-muted" style={{ alignSelf: 'center', fontSize: 12.5, fontWeight: 600 }}>
                                {activeIdx >= 0 ? `${activeIdx + 1} / ${filtered.length}` : ''}
                            </span>
                            <div style={{ flex: 1 }} />
                            <button type="button" className="ad-btn ad-btn-danger" onClick={() => deleteOne(drawerRow)} disabled={busyIds.has(drawerRow.applicationId)}>
                                <Icon name="delete" className="ad-ico-sm" />
                                <span className="ad-desk-only">Sil</span>
                            </button>
                        </>
                    )
                }
                headerActions={
                    drawerRow && (
                        <button type="button" className="ad-ib bordered" onClick={() => copyAnswers(drawerRow)} aria-label="Yanıtları kopyala" data-tip="Yanıtları kopyala">
                            <Icon name="content_copy" className="ad-ico-sm" />
                        </button>
                    )
                }
            >
                {drawerRow && (
                    <>
                        <div className="ad-row ad-wrap" style={{ gap: 8, marginBottom: 6 }}>
                            <Badge tone={drawerRow.userId ? 'ok' : ''} icon={drawerRow.userId ? 'verified_user' : 'person_off'}>
                                {drawerRow.userId ? 'Kayıtlı üye' : 'Misafir'}
                            </Badge>
                            <Badge icon="schedule">{formatDateTime(drawerRow.submittedAt)}</Badge>
                            <Badge>#{drawerRow.applicationId}</Badge>
                            {drawerRow.userEmail && (
                                <>
                                    <a className="ad-btn ad-btn-sm" href={`mailto:${drawerRow.userEmail}`}>
                                        <Icon name="mail" className="ad-ico-xs" />
                                        E-posta gönder
                                    </a>
                                    <button type="button" className="ad-btn ad-btn-sm" onClick={() => copyEmail(drawerRow.userEmail)}>
                                        <Icon name="content_copy" className="ad-ico-xs" />
                                        Kopyala
                                    </button>
                                </>
                            )}
                        </div>
                        <dl style={{ margin: 0 }}>
                            {headers.map((h, i) => {
                                const v = rowValues(drawerRow, headers)[i];
                                return (
                                    <div key={i} className="ad-answer">
                                        <dt><i>{i + 1}</i><span>{h}</span></dt>
                                        <dd className={v ? '' : 'empty'}>{v ? (query.trim() ? <Highlight text={v} query={query} /> : <Linkified text={v} />) : 'Yanıt verilmedi'}</dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </>
                )}
            </Drawer>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Alt bileşenler                                                      */
/* ------------------------------------------------------------------ */

function Spark({ days }) {
    const max = Math.max(1, ...days.map((d) => d.n));
    const sum = days.reduce((a, d) => a + d.n, 0);
    return (
        <div style={{ width: '100%', minWidth: 0 }}>
            <div className="ad-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="l" style={{ fontSize: 12.5, color: 'var(--ad-ink-3)', fontWeight: 600 }}>Son 14 gün</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{sum} başvuru</span>
            </div>
            <div className="ad-spark" role="img" aria-label={`Son 14 günde ${sum} başvuru`}>
                {days.map((d) => (
                    <span
                        key={d.key}
                        className={d.n ? 'on' : ''}
                        style={{ height: `${Math.max(8, (d.n / max) * 100)}%` }}
                        title={`${d.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}: ${d.n}`}
                    />
                ))}
            </div>
        </div>
    );
}

function FooterInner({ total, page, pageCount, pageSize, setPage, setPageSize, selectedCount, onSelectAll }) {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(total, page * pageSize);
    return (
        <>
            <span>
                <b style={{ color: 'var(--ad-ink)' }}>{from}–{to}</b> / {total}
                {onSelectAll && selectedCount > 0 && selectedCount < total && (
                    <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" style={{ marginLeft: 8 }} onClick={onSelectAll}>
                        Tüm {total} sonucu seç
                    </button>
                )}
            </span>
            <span className="ad-row" style={{ gap: 12 }}>
                <label className="ad-row ad-desk-only" style={{ gap: 8 }}>
                    <span>Sayfa başına</span>
                    <select className="ad-select" style={{ width: 'auto', minHeight: 34 }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </label>
                <span className="ad-pager">
                    <button type="button" className="ad-ib bordered" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Önceki sayfa">
                        <Icon name="chevron_left" />
                    </button>
                    <span style={{ minWidth: 64, textAlign: 'center', fontWeight: 700, color: 'var(--ad-ink)' }}>{page} / {pageCount}</span>
                    <button type="button" className="ad-ib bordered" disabled={page >= pageCount} onClick={() => setPage(page + 1)} aria-label="Sonraki sayfa">
                        <Icon name="chevron_right" />
                    </button>
                </span>
            </span>
        </>
    );
}

function Footer(props) {
    return (
        <div className="ad-tfoot">
            <FooterInner {...props} />
        </div>
    );
}
