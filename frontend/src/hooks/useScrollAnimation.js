"use client";
import { useEffect } from 'react';

export function useScrollAnimation() {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.fade-up');
        elements.forEach(element => {
            observer.observe(element);
        });

        return () => {
            elements.forEach(element => observer.unobserve(element));
        };
    }, []);
}