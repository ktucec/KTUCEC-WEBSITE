'use client';
import { useEffect } from 'react';

// Sitedeki tüm kaydırma girişleri tek bir IntersectionObserver ile yönetilir.
//   data-io="rise | left | right | scale | blur | clip | clip-x | draw | tilt"  → giriş türü
//   data-io-group (üst öğe)                                                → çocuklar sırayla (80 ms aralık)
//   data-io-delay="120"                                                     → ek gecikme (ms)
// Yalnızca ilk açılışta ekranın altında kalan öğeler gizlenir; görünür içerik hiç yanıp sönmez. Her öğe bir
// kez açılır. Hareket azaltma tercihinde hiçbir şey gizlenmez.
export default function RevealObserver() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!('IntersectionObserver' in window)) return;

        const seen = new WeakSet<Element>();
        // clip-path ile tamamen kırpılmış (ya da scaleX(0)) bir öğenin görünür alanı sıfırdır ve gözlemci onu hiç
        // "kesişiyor" saymaz. Bu türlerde öğenin kendisi değil, üst öğesinin kutusu izlenir.
        const PROXY = new Set(['clip', 'clip-x', 'draw']);
        const waiting = new Map<Element, HTMLElement[]>();
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    for (const el of waiting.get(entry.target) ?? []) {
                        el.classList.add('io-in');
                        el.classList.remove('io-pending');
                    }
                    waiting.delete(entry.target);
                    io.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
        );

        const prepare = (root: ParentNode) => {
            root.querySelectorAll<HTMLElement>('[data-io-group]').forEach((group) => {
                group.querySelectorAll<HTMLElement>(':scope [data-io]').forEach((child, i) => {
                    if (!child.dataset.ioDelay) child.style.setProperty('--io-delay', `${i * 80}ms`);
                });
            });
            root.querySelectorAll<HTMLElement>('[data-io]').forEach((el) => {
                if (seen.has(el)) return;
                seen.add(el);
                if (el.dataset.ioDelay) el.style.setProperty('--io-delay', `${el.dataset.ioDelay}ms`);
                const r = el.getBoundingClientRect();
                // Zaten ekrandaysa (ya da yukarıda kaldıysa) olduğu gibi kalır.
                if (r.top < window.innerHeight * 0.92) return;
                el.classList.add('io-pending');
                const target = PROXY.has(el.dataset.io ?? '') && el.parentElement ? el.parentElement : el;
                const list = waiting.get(target);
                if (list) list.push(el);
                else {
                    waiting.set(target, [el]);
                    io.observe(target);
                }
            });
        };

        prepare(document);
        // Sayfanın en altındaki öğeler gözlemcinin alt payına hiç ulaşamayabilir: sona gelindiğinde
        // ekranda bekleyen ne varsa açılır.
        const onScroll = () => {
            if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
            document.querySelectorAll<HTMLElement>('.io-pending').forEach((el) => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('io-in');
                    el.classList.remove('io-pending');
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        // Dil değişince React bazı öğeleri yeniden oluşturur; yenileri de gözlemciye eklenir.
        const mo = new MutationObserver((records) => {
            for (const rec of records) rec.addedNodes.forEach((n) => n instanceof HTMLElement && prepare(n.parentElement ?? n));
        });
        mo.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            io.disconnect();
            mo.disconnect();
        };
    }, []);

    return null;
}
