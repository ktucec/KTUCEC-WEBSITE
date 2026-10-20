import Hero from '@/editions/2025/components/sections/Hero';
import About from '@/editions/2025/components/sections/About';
import Impact from '@/editions/2025/components/sections/Impact';
import Speakers from '@/editions/2025/components/sections/Speakers';
import Sponsors from '@/editions/2025/components/sections/Sponsors';
import Vision from '@/editions/2025/components/sections/Vision';
import Gallery from '@/editions/2025/components/sections/Gallery';
import Contact from '@/editions/2025/components/sections/Contact';

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