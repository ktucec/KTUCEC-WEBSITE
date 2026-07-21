"use client";
import { useEffect } from 'react';

export function useScrollAnimation(deps = []) {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.fade-up:not(.visible)');
        elements.forEach(element => {
            observer.observe(element);
        });

        return () => {
            elements.forEach(element => observer.unobserve(element));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}