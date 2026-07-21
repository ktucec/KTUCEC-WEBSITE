"use client";

import { useEffect, useRef, useState } from 'react';

export default function SponsorTicker({ logos }) {
    const trackRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const scrollStartLeft = useRef(0);
    const resumeTimeout = useRef(null);
    const rafId = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    const SPEED = 0.8; 
    const RESUME_DELAY = 1500; 

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        function tick() {
            if (!isDragging.current && !isPaused && track) {
                const half = track.scrollWidth / 2;
                let next = track.scrollLeft + SPEED;
                next = ((next % half) + half) % half;
                track.scrollLeft = next;
            }
            rafId.current = requestAnimationFrame(tick);
        }
        rafId.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(rafId.current);
    }, [isPaused]);

    const pauseAndScheduleResume = () => {
        setIsPaused(true);
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        resumeTimeout.current = setTimeout(() => setIsPaused(false), RESUME_DELAY);
    };

    const handlePointerDown = (e) => {
        isDragging.current = true;
        setIsPaused(true);
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        dragStartX.current = e.clientX;
        scrollStartLeft.current = trackRef.current.scrollLeft;
        trackRef.current.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current || !trackRef.current) return;
        const track = trackRef.current;
        const half = track.scrollWidth / 2;
        const dx = e.clientX - dragStartX.current;
        let next = scrollStartLeft.current - dx;
        next = ((next % half) + half) % half;
        track.scrollLeft = next;
    };

    const handlePointerUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        pauseAndScheduleResume();
    };

    useEffect(() => {
        return () => {
            if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        };
    }, []);

    return (
        <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="flex overflow-x-auto select-none cursor-grab active:cursor-grabbing scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {[0, 1].map((setIndex) => (
                <div
                    key={setIndex}
                    aria-hidden={setIndex === 1}
                    className="flex shrink-0 items-center gap-32 md:gap-32 pr-32 md:pr-32 py-4"
                >
                    {logos.map((src, i) => (
                        <div key={`ticker-${setIndex}-${i}`} className="shrink-0 flex items-center justify-center">
                            <img
                                className="h-[110px] w-auto object-contain pointer-events-none"
                                src={src}
                                alt={`Sponsor Logo ${i + 1}`}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
