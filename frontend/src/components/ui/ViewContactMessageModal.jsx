'use client';

import { useEffect } from 'react';
import { formatDateTime } from '@/lib/adminFormat';
import { Avatar, Icon, Linkified } from '@/components/admin/ui';

export default function ViewContactMessageModal({ isOpen, onClose, contactData }) {
    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !contactData) return null;

    const replyHref = contactData.email
        ? `mailto:${contactData.email}?subject=${encodeURIComponent('Re: ' + (contactData.subject || ''))}`
        : null;

    return (
        <div className="ad-drawer-wrap on" role="presentation">
            <div className="scrim" onClick={onClose} style={{ opacity: 1 }} />
            <aside className="ad-drawer" style={{ transform: 'none' }} role="dialog" aria-modal="true" aria-label="Mesaj detayı">
                <div className="ad-grab" />
                <div className="ad-drawer-head">
                    <Avatar name={contactData.nameSurname} size="lg" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="ad-item-title ad-trunc">{contactData.nameSurname}</div>
                        <div className="ad-item-sub ad-trunc">{formatDateTime(contactData.createdAt)}</div>
                    </div>
                    <button type="button" className="ad-ib bordered" onClick={onClose} aria-label="Kapat">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="ad-drawer-body">
                    <div className="ad-row ad-wrap" style={{ gap: 8, marginBottom: 14 }}>
                        {contactData.email && (
                            <a className="ad-badge info" href={`mailto:${contactData.email}`} style={{ textDecoration: 'none' }}>
                                <Icon name="mail" className="ad-ico-xs" />
                                {contactData.email}
                            </a>
                        )}
                    </div>

                    <div className="ad-label" style={{ marginBottom: 4 }}>Konu</div>
                    <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-montserrat)', fontSize: 19, lineHeight: 1.3, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>
                        {contactData.subject}
                    </h3>

                    <div className="ad-label">Mesaj</div>
                    <div
                        style={{
                            padding: 16,
                            borderRadius: 14,
                            background: 'var(--ad-card-2)',
                            border: '1px solid var(--ad-line)',
                            color: 'var(--ad-ink)',
                            fontSize: 15,
                            lineHeight: 1.65,
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        <Linkified text={contactData.message} />
                    </div>
                </div>

                <div className="ad-drawer-foot">
                    {replyHref && (
                        <a href={replyHref} className="ad-btn ad-btn-primary" style={{ flex: 1 }}>
                            <Icon name="reply" className="ad-ico-sm" />
                            E-posta ile yanıtla
                        </a>
                    )}
                    <button type="button" className="ad-btn" onClick={onClose} style={replyHref ? undefined : { flex: 1 }}>
                        Kapat
                    </button>
                </div>
            </aside>
        </div>
    );
}
