'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/admin/ui';

export function setHtml(attr, value) {
    try {
        document.documentElement.setAttribute(attr, value);
    } catch {}
}

export function useAdminTheme() {
    const [theme, setTheme] = useState('light');
    useEffect(() => {
        setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    }, []);
    const toggle = useCallback(() => {
        setTheme((t) => {
            const next = t === 'dark' ? 'light' : 'dark';
            setHtml('data-theme', next);
            try {
                localStorage.setItem('adm-theme', next);
            } catch {}
            return next;
        });
    }, []);
    const set = useCallback((next) => {
        setTheme(next);
        setHtml('data-theme', next);
        try {
            localStorage.setItem('adm-theme', next);
        } catch {}
    }, []);
    return [theme, toggle, set];
}

export function ThemeButton({ className = 'ad-ib bordered' }) {
    const [theme, toggle] = useAdminTheme();
    return (
        <button
            type="button"
            className={className}
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
            data-tip={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
        >
            <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
        </button>
    );
}

