'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Droplets, Truck, Smile, Gift, Star } from 'lucide-react';
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
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #D45F85 0%, #D47898 40%, #C9A47A 75%, #C9A47A 100%)' }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 text-center py-24">
          <motion.p initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-lato text-xs tracking-[0.35em] text-white/80 uppercase mb-5">
            {t.home.hero.eyebrow}
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-playfair font-bold text-4xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            {t.home.hero.title}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="font-cormorant text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto italic leading-relaxed">
            {t.home.hero.subtitle}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/boutique"
              className="bg-white text-primary font-lato font-bold px-8 py-4 rounded-full text-base hover:bg-pink-50 transition-colors shadow-lg min-h-[52px] flex items-center justify-center">
              {t.home.hero.shopBtn}
            </Link>
            <Link href="/comment-commander"
              className="border-2 border-white text-white font-lato font-semibold px-8 py-4 rounded-full text-base hover:bg-white/10 transition-colors min-h-[52px] flex items-center justify-center">
              {t.home.hero.howToBtn}
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white/70 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ——— Featured Products ——— */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-12">
            <p className="font-lato text-xs tracking-widest text-accent uppercase mb-2">{t.home.featured.eyebrow}</p>
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-3">{t.home.featured.title}</h2>
            <p className="font-cormorant text-xl text-gray-500 italic">{t.home.featured.subtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, i) => (
              <FadeIn key={product.id} delay={i * 0.1}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4} className="text-center mt-10">
            <Link href="/boutique"
              className="inline-flex items-center gap-2 bg-primary hover:bg-pink-400 text-white font-lato font-semibold px-8 py-3 rounded-full transition-colors shadow-sm">
              {t.home.featured.viewAll} ({products.length})
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ——— Notre Histoire ——— */}
      <section id="notre-histoire" className="py-20 px-4" style={{ backgroundColor: 'var(--secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <div className="rounded-3xl overflow-hidden shadow-lg relative w-full aspect-[1600/983] lg:mt-44">
                <Image
                  src="/CEO2.png"
                  alt="CEO Bestie LipGloss"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div>
                <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-6 leading-snug">
                  {t.home.story.title}
                </h2>
                <div className="space-y-4 font-lato text-gray-600 leading-relaxed text-sm sm:text-base">
                  <p>{t.home.story.p1}</p>
                  <p>{t.home.story.p2}</p>
                  <p>{t.home.story.p3}</p>
                  {t.home.story.p4 && <p>{t.home.story.p4}</p>}
                  {t.home.story.p5 && <p>{t.home.story.p5}</p>}
                  {t.home.story.p6 && <p className="font-medium text-gray-700">{t.home.story.p6}</p>}
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  {[t.home.story.tag1, t.home.story.tag3].map((tag) => (
                    <span key={tag} className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full font-lato text-sm text-gray-700 shadow-sm">
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
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-12">
            <p className="font-lato text-xs tracking-widest text-accent uppercase mb-2">{t.home.reviews.eyebrow}</p>
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800 mb-3">{t.home.reviews.title}</h2>
            <p className="font-cormorant text-xl text-gray-500 italic">{t.home.reviews.subtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <FadeIn key={testimonial.name} delay={i * 0.15}>
                <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${testimonial.avatar} w-10 h-10 rounded-full flex items-center justify-center font-playfair font-bold text-gray-700 flex-shrink-0`}>
                      {testimonial.initial}
                    </div>
                    <div>
                      <p className="font-playfair font-semibold text-gray-800 text-sm">{testimonial.name}</p>
                      <p className="font-lato text-xs text-gray-400">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} size={13} className="fill-accent text-accent" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="font-cormorant text-base text-gray-600 italic leading-relaxed flex-1">
                    &ldquo;{testimonialQuotes[i]}&rdquo;
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Why Bestie ——— */}
      <section className="py-20 px-4 bg-[#F2E9E1]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="font-lato text-xs tracking-widest text-accent uppercase mb-2">{t.home.why.eyebrow}</p>
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-gray-800">{t.home.why.title}</h2>
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
      <section className="py-16 px-4 text-center" style={{ background: 'linear-gradient(135deg, #D45F85, #C9A47A)' }}>
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
