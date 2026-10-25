'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

// Sayfa içi bağlantılar (#bilet, #ulasim, #konusmacilar...) sabitlenmiş konuşmacı sahnesinin içinden geçecekse
// sahneyi kaydırarak oynatmak yerine önce sahnenin öbür ucuna anında atlanır, kalan yol yumuşakça kayılır.
// Böylece bilet butonu, konuşmacıların uçuşlarını hızla sararak çirkin bir ara görüntü oluşturmaz.
export default function SmartAnchors() {
    useEffect(() => {
        const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
            if (!link) return;
            const url = new URL(link.href, window.location.href);
            if (url.pathname !== window.location.pathname || !url.hash) return;
            const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
            if (!target) return;
            e.preventDefault();

            const targetY = target.getBoundingClientRect().top + window.scrollY;
            const fromY = window.scrollY;
            const spacer = document.querySelector('#konusmacilar .pin-spacer') as HTMLElement | null;

            // Yol sahnenin içinden geçiyor mu? Geçiyorsa sahnenin hedefe yakın ucuna anında atla.
            if (spacer) {
                const top = spacer.getBoundingClientRect().top + window.scrollY;
                const bottom = top + spacer.offsetHeight;
                if (!spacer.contains(target)) {
                    if (fromY < bottom && targetY >= bottom) window.scrollTo({ top: bottom, behavior: 'instant' });
                    else if (fromY > top && targetY <= top) window.scrollTo({ top: Math.max(top - window.innerHeight, targetY), behavior: 'instant' });
                }
            }

            history.replaceState(null, '', url.hash);
            if (reduce()) {
                window.scrollTo({ top: targetY, behavior: 'instant' });
            } else {
                gsap.to(window, { scrollTo: { y: targetY, autoKill: true }, duration: 1.1, ease: 'power3.inOut' });
            }
            // Klavye ve ekran okuyucu için odak hedef bölüme taşınır.
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            window.setTimeout(() => target.focus({ preventScroll: true }), reduce() ? 0 : 1100);
        };

        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, []);

    return null;
}
