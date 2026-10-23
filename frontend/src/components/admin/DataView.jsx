'use client';

import { EmptyState, ErrorState, SkeletonRows } from '@/components/admin/ui';

/**
 * Basit liste görünümü: masaüstünde tablo, mobilde kart.
 * columns: [{ key, label, render(row), className, th }]
 * renderCard(row): mobil kart içeriği
 * renderActions(row): satır sonu butonları (masaüstü)
 */
export default function DataView({
    columns,
    rows,
    rowKey = (r) => r.id,
    renderCard,
    renderActions,
    loading,
    error,
    onRetry,
    empty,
    footer,
}) {
    if (loading) {
        return (
            <div className="ad-tw">
                <SkeletonRows rows={6} />
            </div>
        );
    }
    if (error) {
        return (
            <div className="ad-tw">
                <ErrorState message={error} onRetry={onRetry} />
            </div>
        );
    }
    if (!rows.length) {
        return (
            <div className="ad-tw">
                <EmptyState {...empty} />
            </div>
        );
    }

    return (
        <>
            <div className="ad-only-table ad-tw ad-fade-in">
                <div className="ad-tscroll">
                    <table className="ad-table">
                        <thead>
                            <tr>
                                {columns.map((c) => (
                                    <th key={c.key} className={c.th || ''}>
                                        {c.label}
                                    </th>
                                ))}
                                {renderActions && <th className="num">İşlemler</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={rowKey(row)}>
                                    {columns.map((c) => (
                                        <td key={c.key} className={c.className || ''}>
                                            {c.render(row)}
                                        </td>
                                    ))}
                                    {renderActions && (
                                        <td className="num" style={{ whiteSpace: 'nowrap' }}>
                                            <span className="ad-row-actions">{renderActions(row)}</span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {footer && <div className="ad-tfoot">{footer}</div>}
            </div>

            <div className="ad-only-cards ad-fade-in">{rows.map((row) => renderCard(row))}</div>
            {footer && (
                <div className="ad-only-cards" style={{ marginTop: 6 }}>
                    <div className="ad-muted" style={{ fontSize: 13, textAlign: 'center' }}>
                        {footer}
                    </div>
                </div>
            )}
        </>
    );
}
