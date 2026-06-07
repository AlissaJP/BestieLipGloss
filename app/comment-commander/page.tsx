'use client';

import Link from 'next/link';
import { ShoppingBag, MessageCircle, CreditCard, Package } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

export default function CommentCommanderPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.howTo;

  const steps = [
    {
      number: '01',
      icon: <ShoppingBag size={28} className="text-primary" />,
      title: t.s1Title,
      desc: t.s1Desc,
      color: 'bg-pink-50',
    },
    {
      number: '02',
      icon: <CreditCard size={28} className="text-purple-600" />,
      title: t.s2Title,
      desc: t.s2Desc,
      color: 'bg-purple-50',
    },
    {
      number: '03',
      icon: <MessageCircle size={28} className="text-green-600" />,
      title: t.s3Title,
      desc: t.s3Desc,
      color: 'bg-green-50',
    },
    {
      number: '04',
      icon: <Package size={28} className="text-accent" />,
      title: t.s4Title,
      desc: t.s4Desc,
      color: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(242,167,187,0.2) 0%, rgba(232,213,196,0.35) 100%)',
        }}
      >
        <p className="font-lato text-xs tracking-widest text-gray-500 uppercase mb-2">{t.guide}</p>
        <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-gray-800 mb-3">
          {t.heading}
        </h1>
        <p className="font-cormorant text-xl text-gray-600 italic max-w-xl mx-auto">
          {t.sub}
        </p>
      </div>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex gap-6 items-start bg-white rounded-2xl p-6 border border-pink-100 shadow-sm"
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center`}>
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-8 bg-pink-200 rounded-full hidden sm:block" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-lato text-xs font-bold text-primary tracking-wider">
                    {t.stepPrefix} {step.number}
                  </span>
                </div>
                <h3 className="font-playfair font-bold text-xl text-gray-800 mb-2">{step.title}</h3>
                <p className="font-lato text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-12 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #F2A7BB, #E8D5C4)' }}
      >
        <h2 className="font-playfair font-bold text-2xl sm:text-3xl text-white mb-4">
          {t.ctaHeading}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/boutique"
            className="bg-white text-primary font-lato font-bold px-8 py-3.5 rounded-full hover:bg-pink-50 transition-colors shadow-md min-h-[48px] flex items-center justify-center"
          >
            {t.ctaShop}
          </Link>
          <a
            href="https://wa.me/50900000000"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white font-lato font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors min-h-[48px] flex items-center justify-center"
          >
            {t.ctaContact}
          </a>
        </div>
      </section>
    </div>
  );
}
