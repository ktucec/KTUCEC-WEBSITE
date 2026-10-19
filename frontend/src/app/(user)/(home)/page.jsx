"use client";
import Hero from '@/components/sections/HeroSection';
import TopicBands from '@/components/fx/TopicBands';
import Announcements from '@/components/sections/Announcements';
import Events from '@/components/sections/Events';
import ManagementBoard from '@/components/sections/ManagementBoard';
import About from '@/components/sections/HomeAbout';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Home() {
    useScrollAnimation();

    return (
        <>
            <Hero />
            <TopicBands />
            <div className="max-w-container-max mx-auto px-5 sm:px-gutter pt-10 md:pt-16 pb-28 md:pb-36 space-y-28 md:space-y-40 relative z-10">
                <Announcements />
                <Events />
                <ManagementBoard />
                <About />
            </div>
        </>
    );
}
