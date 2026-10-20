import Hero from '@/editions/2025/components/sections/Hero';
import Ticker from '@/editions/2025/components/ui/Ticker';
import About from '@/editions/2025/components/sections/About';
import Impact from '@/editions/2025/components/sections/Impact';
import Speakers from '@/editions/2025/components/sections/Speakers';
import Sponsors from '@/editions/2025/components/sections/Sponsors';
import Gallery from '@/editions/2025/components/sections/Gallery';
import Contact from '@/editions/2025/components/sections/Contact';

export default function Page() {
  return (
    <>
      <Hero />
      <Ticker />
      <About />
      <Impact />
      <Speakers />
      <Sponsors />
      <Gallery />
      <Contact />
    </>
  );
}
