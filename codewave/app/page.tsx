import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Impact from '@/components/sections/Impact';
import Speakers from '@/components/sections/Speakers';
import Sponsors from '@/components/sections/Sponsors';
import Vision from '@/components/sections/Vision';
import Gallery from '@/components/sections/Gallery';
import Contact from '@/components/sections/Contact';

export default function Page() {
  return (
    <>
      <Hero />
      <About />
      <Impact />
      <Speakers />
      <Sponsors />
      <Vision />
      <Gallery />
      <Contact />
    </>
  );
}