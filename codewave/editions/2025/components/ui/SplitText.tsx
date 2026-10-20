'use client';
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react';

// Metni kelime ya da harf bazında maskeli olarak yukarı kaydırarak gösterir.
export default function SplitText({
    text,
    mode = 'words',
    as: Tag = 'span',
    className = '',
    delay = 0,
    step = 55,
    inView = true,
}: {
    text: string;
    mode?: 'words' | 'chars';
    as?: ElementType;
    className?: string;
    delay?: number;
    step?: number;
    inView?: boolean;
}) {
    const ref = useRef<HTMLElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!inView || !('IntersectionObserver' in window)) {
            const id = requestAnimationFrame(() => setShown(true));
            return () => cancelAnimationFrame(id);
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [inView]);

    const parts = mode === 'chars' ? Array.from(text) : text.split(' ');

    return (
        <Tag
            ref={ref}
            aria-label={text}
            className={`split split-${mode}${shown ? ' in' : ''} ${className}`}
            style={{ '--delay': `${delay}ms`, '--step': `${step}ms` } as CSSProperties}
        >
            {parts.map((p, i) => (
                <Fragment key={i}>
                    <span aria-hidden="true" className="sw">
                        <span className="swi" style={{ '--i': i } as CSSProperties}>
                            {p}
                        </span>
                    </span>
                    {mode === 'words' && i < parts.length - 1 ? ' ' : null}
                </Fragment>
            ))}
        </Tag>
    );
}
