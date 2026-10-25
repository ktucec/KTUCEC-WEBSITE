'use client';
import { useRef, type ElementType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { useLang } from '../i18n/LanguageProvider';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

type Props = { as?: ElementType; text: string; className?: string; id?: string; ariaHidden?: boolean };

// Başlık, ilk kez ekrana girdiğinde kelime kelime maskelerin altından yükselir. Öğe dile göre anahtarlanır:
// dil değişince React onu yeniden oluşturur (SplitText'in değiştirdiği DOM'la çakışmaz) ve yeni metin
// animasyonsuz, doğrudan görünür.
export default function SplitHeading({ as: Tag = 'h2', text, className = '', id, ariaHidden }: Props) {
    const { lang } = useLang();
    const ref = useRef<HTMLElement>(null);
    const played = useRef(false);

    useGSAP(
        (_ctx, contextSafe) => {
            const el = ref.current;
            if (!el || played.current || !contextSafe) return;
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                let split: SplitText | null = null;
                const run = contextSafe(() => {
                    if (!ref.current) return;
                    split = SplitText.create(ref.current, { type: 'words', mask: 'words' });
                    gsap.from(split.words, {
                        yPercent: 115,
                        duration: 1.2,
                        stagger: 0.06,
                        ease: 'expo.out',
                        scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true, onEnter: () => (played.current = true) },
                    });
                });
                document.fonts.ready.then(run);
                return () => split?.revert();
            });
        },
        { scope: ref, dependencies: [lang], revertOnUpdate: true },
    );

    return (
        <Tag key={lang} ref={ref} id={id} className={className} aria-hidden={ariaHidden || undefined}>
            {text}
        </Tag>
    );
}
