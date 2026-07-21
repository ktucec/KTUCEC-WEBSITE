import React, { forwardRef } from 'react';

const TimelineEventCard = forwardRef(({ event, index }, ref) => {
    return (
        <div
            className={`relative flex flex-col md:flex-row items-center justify-between mb-48 group ${event.align === 'right' ? 'md:flex-row-reverse' : ''} ${event.status === 'past' ? 'opacity-80 hover:opacity-100 transition-opacity' : ''}`}
            style={{ marginTop: index === 0 ? '100px' : '0' }}
        >
            <div className="hidden md:block w-1/2"></div>

            {/* Center Dot */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 ${event.status === 'past' ? 'bg-outline' : 'bg-primary shadow-[0_0_15px_rgba(158,0,0,0.5)]'}`}></div>

            {/* Content Block */}
            <div
                ref={ref}
                className={`node-content w-full md:w-[45%] flex items-center gap-8 ${event.align === 'right' ? 'reveal-right' : 'reveal-left flex-row-reverse'}`}
            >
                {/* Date Column (Vertical Text) */}
                <div className={`vertical-text font-display-lg opacity-50 select-none ${event.status === 'past' ? 'text-secondary' : 'text-primary'}`}>
                    {event.displayDate}
                </div>

                {/* Glass Card */}
                <div className={`glass-panel p-10 flex-1 relative overflow-hidden ${event.align === 'right' ? 'shape-blob-1' : 'shape-blob-2'} ${event.status === 'past' ? 'grayscale' : ''}`}>

                    {/* Diagonal Image Mask - Sadece ImageUrl varsa göster */}
                    {event.imageUrl && (
                        <div className={`absolute ${event.align === 'right' ? '-right-20 -top-10' : '-left-20 -bottom-10'} w-64 h-64 md:w-72 md:h-72 opacity-30 diagonal-mask z-0`}>
                            <img className="w-full h-full object-cover" src={event.imageUrl} alt={event.title} />
                        </div>
                    )}

                    {/* Card Text Content */}
                    <div className={`relative z-10 ${event.align === 'left' ? 'text-right' : ''}`}>
                        <span className={`${event.tag === 'Arşiv' ? 'bg-surface-variant text-on-surface-variant' : (event.tag === 'Atölye' || event.tag === 'Workshop' ? 'bg-primary-container text-white' : 'bg-primary text-white')} text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block`}>
                            {event.tag}
                        </span>
                        <h2 className={`font-headline-md mb-4 ${event.status === 'past' ? 'text-secondary' : 'text-on-surface'}`}>
                            {event.title}
                        </h2>
                        <p className={`font-body-md mb-6 ${event.status === 'past' ? 'text-on-surface-variant opacity-60' : 'text-on-surface-variant'}`}>
                            {event.location}
                        </p>

                        {event.buttonText && (
                            <button className={`text-primary font-label-md flex items-center gap-2 group-hover:gap-4 transition-all ${event.align === 'left' ? 'flex-row-reverse ml-auto' : ''}`}>
                                {event.buttonText} <span className="material-symbols-outlined text-sm">{event.buttonIcon}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

TimelineEventCard.displayName = 'TimelineEventCard';

export default TimelineEventCard;