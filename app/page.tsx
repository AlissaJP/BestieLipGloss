'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Droplets, Truck, Smile, Gift, Star, Leaf, Rabbit, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

const testimonials = [
  { name: 'Chantal M.', location: 'Port-au-Prince', rating: 5, avatar: 'bg-amber-200', initial: 'C' },
  { name: 'Nadège P.', location: 'Pétion-Ville', rating: 5, avatar: 'bg-purple-200', initial: 'N' },
  { name: 'Fabiola L.', location: 'Cap-Haïtien', rating: 5, avatar: 'bg-rose-200', initial: 'F' },
];

const testimonialQuotes = [
  "Le Nude Chérie est devenu mon essentiel quotidien ! Il correspond parfaitement à mon teint et j'adore que ce soit 100% naturel.",
  "J'ai commandé le Berry Kiss pour une soirée et j'ai eu des compliments toute la nuit. La livraison était rapide et l'emballage trop mignon !",
  "Enfin une marque haïtienne qui comprend notre beauté ! L'Or Rose est tout simplement magique pour les grandes occasions.",
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const trustBadges = [
    { icon: <Truck size={32} className="text-primary" />, ...t.home.trust.shipping },
    { icon: <Leaf size={32} className="text-primary" />,  ...t.home.trust.natural },
    { icon: <Rabbit size={32} className="text-primary" />, ...t.home.trust.cruelty },
    { icon: <ShieldCheck size={32} className="text-primary" />, ...t.home.trust.secure },
  ];

  const whyItems = [
    { icon: <Sparkles size={30} className="text-yellow-500" />, bg: 'bg-yellow-50', ...t.home.why.item1 },
    { icon: <Droplets size={30} className="text-blue-500" />,   bg: 'bg-blue-50',   ...t.home.why.item2 },
    { icon: <Truck size={30} className="text-amber-500" />,     bg: 'bg-amber-50',   ...t.home.why.item3 },
    { icon: <Smile size={30} className="text-primary" />,       bg: 'bg-pink-50',    ...t.home.why.item4 },
    { icon: <Gift size={30} className="text-purple-500" />,     bg: 'bg-purple-50',  ...t.home.why.item5 },
    { icon: <Star size={30} className="text-rose-500" />,       bg: 'bg-rose-50',    ...t.home.why.item6 },
  ];

  return (
    <div>
      {/* ——— Hero ——— */}
      <section className="relative w-full overflow-hidden aspect-[3/4] sm:aspect-[4/3] lg:aspect-[1234/941]">
        <Image
          src="/accueilV2.png"
          alt=""
          fill
          sizes="100vw"
          priority
          quality={95}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* MOBILE — contenu centré, décalé vers le haut pour laisser place aux badges */}
        <div className="lg:hidden absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 gap-3 pb-28">
          <p className="font-lato text-xs tracking-[0.35em] text-white/90 uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
            {t.home.hero.eyebrow}
          </p>
          <h1 className="font-playfair font-bold text-3xl text-white leading-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.4)]">
            {t.home.hero.title}
          </h1>
          <p className="font-cormorant text-base text-white italic leading-relaxed mb-1 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
            {t.home.hero.subtitle}
          </p>
          <Link href="/boutique"
            className="w-full max-w-xs bg-white text-primary font-lato font-bold px-6 py-3 rounded-full text-base hover:bg-pink-50 transition-colors shadow-lg flex items-center justify-center min-h-[44px]">
            {t.home.hero.shopBtn}
          </Link>
          <Link href="/comment-commander"
            className="w-full max-w-xs border-2 border-white text-white font-lato font-semibold px-6 py-3 rounded-full text-base hover:bg-white/15 transition-colors flex items-center justify-center min-h-[44px] [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
            {t.home.hero.howToBtn}
          </Link>
        </div>

        {/* MOBILE — trust badges remontés, fond transparent */}
        <div className="lg:hidden absolute bottom-10 left-0 right-0 z-10 px-3 py-3">
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 max-w-sm mx-auto">
            {trustBadges.map((item, i) => (
              <div key={i} className={`flex items-center gap-2 ${i % 2 === 0 ? 'justify-start' : 'justify-start pl-3 border-l border-pink-300/60'}`}>
                <span className="shrink-0">{item.icon}</span>
                <div>
                  <p className="font-lato font-bold text-gray-900 text-[11px] leading-tight">{item.title}</p>
                  <p className="font-lato text-gray-800 text-[10px] leading-tight">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP : positions calées sur les zones annotées */}

        {/* Texte — carré bleu */}
        <div className="hidden lg:flex flex-col justify-center gap-4 absolute z-10 text-center"
          style={{ left: '39%', top: '1%', right: '4%', bottom: '37%' }}>
          <motion.p initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-lato text-base tracking-[0.35em] text-white uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]">
            {t.home.hero.eyebrow}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-playfair font-bold text-7xl text-white leading-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]">
            {t.home.hero.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="font-cormorant text-3xl text-white italic leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,0.4)]">
            {t.home.hero.subtitle}
          </motion.p>
        </div>

        {/* Bouton 1 — bloc rouge 1 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden lg:flex absolute z-10"
          style={{ right: '40%', top: '71%', width: '28%' }}>
          <Link href="/boutique"
            className="w-full bg-white text-primary font-lato font-bold px-6 py-3 rounded-full text-base hover:bg-pink-50 transition-colors shadow-lg flex items-center justify-center min-h-[44px]">
            {t.home.hero.shopBtn}
          </Link>
        </motion.div>

        {/* Bouton 2 — bloc rouge 2 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
          className="hidden lg:flex absolute z-10"
          style={{ right: '40%', top: '78%', width: '28%' }}>
          <Link href="/comment-commander"
            className="w-full border-2 border-white text-white font-lato font-semibold px-6 py-3 rounded-full text-base hover:bg-white/15 transition-colors flex items-center justify-center min-h-[44px] [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
            {t.home.hero.howToBtn}
          </Link>
        </motion.div>

        {/* DESKTOP — trust badges remontés, fond transparent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="hidden lg:grid grid-cols-4 divide-x divide-pink-300/50 absolute bottom-20 left-0 right-0 z-10"
        >
          {trustBadges.map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-3 py-4 px-6">
              <span className="shrink-0">{item.icon}</span>
              <div>
                <p className="font-lato font-bold text-gray-900 text-sm leading-tight">{item.title}</p>
                <p className="font-lato text-gray-800 text-xs leading-tight">{item.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Indicateur de scroll */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/70 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ——— Featured Products ——— */}
      <section className="py-12 sm:py-20 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-8 sm:mb-12">
            <p className="font-lato text-sm tracking-widest text-accent uppercase mb-2">{t.home.featured.eyebrow}</p>
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-800 mb-3">{t.home.featured.title}</h2>
            <p className="font-cormorant text-xl sm:text-2xl text-gray-500 italic">{t.home.featured.subtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {products.slice(0, 4).map((product, i) => (
              <FadeIn key={product.id} delay={i * 0.1}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4} className="text-center mt-10">
            <Link href="/boutique"
              className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-10 py-4 rounded-full transition-colors shadow-sm text-base">
              {t.home.featured.viewAll} ({products.length})
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ——— Notre Histoire ——— */}
      <section id="notre-histoire" className="py-12 sm:py-20 lg:py-28 px-4" style={{ backgroundColor: 'var(--secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <div className="rounded-3xl overflow-hidden shadow-lg relative w-full aspect-[1600/983] lg:mt-44">
                <Image
                  src="/CEO2.png"
                  alt="CEO Bestie LipGloss"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div>
                <h2 className="font-playfair font-bold text-4xl sm:text-5xl text-gray-800 mb-6 leading-snug">
                  {t.home.story.title}
                </h2>
                <div className="space-y-4 font-lato text-gray-600 leading-relaxed text-base sm:text-lg">
                  <p>{t.home.story.p1}</p>
                  <p>{t.home.story.p2}</p>
                  <p>{t.home.story.p3}</p>
                  {t.home.story.p4 && <p>{t.home.story.p4}</p>}
                  {t.home.story.p5 && <p>{t.home.story.p5}</p>}
                  {t.home.story.p6 && <p className="font-medium text-gray-700">{t.home.story.p6}</p>}
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  {[t.home.story.tag1, t.home.story.tag3].map((tag) => (
                    <span key={tag} className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full font-lato text-base text-gray-700 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ——— Testimonials ——— */}
      <section className="py-12 sm:py-20 lg:py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-8 sm:mb-12">
            <p className="font-lato text-sm tracking-widest text-accent uppercase mb-2">{t.home.reviews.eyebrow}</p>
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-800 mb-3">{t.home.reviews.title}</h2>
            <p className="font-cormorant text-xl sm:text-2xl text-gray-500 italic">{t.home.reviews.subtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <FadeIn key={testimonial.name} delay={i * 0.15}>
                <div className="bg-pink-50 rounded-2xl p-8 border border-pink-100 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${testimonial.avatar} w-14 h-14 rounded-full flex items-center justify-center font-playfair font-bold text-lg text-gray-700 flex-shrink-0`}>
                      {testimonial.initial}
                    </div>
                    <div>
                      <p className="font-playfair font-semibold text-gray-800 text-base">{testimonial.name}</p>
                      <p className="font-lato text-sm text-gray-400">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} size={16} className="fill-accent text-accent" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="font-cormorant text-xl text-gray-600 italic leading-relaxed flex-1">
                    &ldquo;{testimonialQuotes[i]}&rdquo;
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Why Bestie ——— */}
      <section className="py-10 sm:py-16 lg:py-20 px-4 bg-[#F2E9E1]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-8 sm:mb-14">
            <p className="font-lato text-xs tracking-widest text-accent uppercase mb-2">{t.home.why.eyebrow}</p>
            <h2 className="font-playfair font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-800">{t.home.why.title}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyItems.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-pink-50 h-full">
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="font-playfair font-semibold text-gray-800 text-lg mb-2">{item.title}</h3>
                  <p className="font-lato text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.4}>
            <p className="text-center font-playfair font-semibold text-lg text-primary mt-10">
              {t.home.why.tagline}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ——— CTA Banner ——— */}
      <section className="py-10 sm:py-16 px-4 text-center" style={{ background: 'linear-gradient(135deg, #D45F85, #C9A47A)' }}>
        <FadeIn>
          <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-white mb-4">{t.home.cta.title}</h2>
          <p className="font-cormorant text-xl text-white/90 italic mb-8 max-w-xl mx-auto">{t.home.cta.subtitle}</p>
          <Link href="/boutique"
            className="inline-flex items-center gap-2 bg-white text-primary font-lato font-bold px-8 py-4 rounded-full hover:bg-pink-50 transition-colors shadow-lg text-base">
            {t.home.cta.btn}
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
