"use client";
import Hero from '@/components/sections/HeroSection';
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
            <main className="max-w-(--spacing-container-max) mx-auto px-gutter py-margin-desktop space-y-[120px] relative z-10">
                <Announcements />
                <Events />
                <ManagementBoard />
                <About />
            </main>
        </>
    );
}