'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, MessageCircle, CreditCard, Package } from 'lucide-react';
import type { ZoneLivraison } from '@/app/api/zones-livraison/route';

const steps = [
  {
    number: '01',
    icon: <ShoppingBag size={28} className="text-primary" />,
    title: 'Choose your products',
    desc: 'Browse our shop and add your favorite shades to your cart. You can select multiple items in a single order.',
    color: 'bg-pink-50',
  },
  {
    number: '02',
    icon: <CreditCard size={28} className="text-purple-600" />,
    title: 'Confirm your order',
    desc: 'Fill in your delivery information (name, address, neighborhood, city, and WhatsApp number), then choose your payment method.',
    color: 'bg-purple-50',
  },
  {
    number: '03',
    icon: <MessageCircle size={28} className="text-green-600" />,
    title: 'Make the payment',
    desc: 'Pay your order via MonCash or Zelle according to the instructions displayed. Then send the confirmation screenshot.',
    color: 'bg-green-50',
  },
  {
    number: '04',
    icon: <Package size={28} className="text-accent" />,
    title: 'Receive your delivery',
    desc: 'Our team verifies your payment and contacts you on WhatsApp within 2 hours. Delivery takes 24 to 72 hours depending on your city.',
    color: 'bg-amber-50',
  },
];

const staticFaqs = [
  {
    q: 'What are the delivery times?',
    a: 'Delivery takes 24 to 72 hours after payment confirmation. Port-au-Prince and Pétion-Ville are usually delivered within 24 hours.',
  },
  {
    q: 'How can I pay?',
    a: 'We accept MonCash (Haitian number) and Zelle (for customers outside Haiti). Other payment methods will be available soon.',
  },
  {
    q: 'Can I return a product?',
    a: 'For hygiene reasons, we do not accept returns on opened cosmetic products. If your product is damaged upon receipt, contact us immediately on WhatsApp with a photo.',
  },
  {
    q: 'Do you deliver outside Haiti?',
    a: 'Currently, we only deliver within Haiti. We are working on international shipping options — stay tuned!',
  },
];

function buildDeliveryAnswer(zones: ZoneLivraison[]): string {
  if (zones.length === 0) {
    return 'Fees vary by city: 150 HTG (Port-au-Prince center), 200 HTG (Pétion-Ville), 250 HTG (Metro area), 350 HTG (Cap-Haïtien), 400 HTG (other cities). Delivery is FREE for any order of 2,000 HTG or more.';
  }
  const lines = zones.map((z) => {
    const seuil = z.seuil_gratuit ? ` — free from ${z.seuil_gratuit} HTG` : '';
    return `${z.frais_htg} HTG (${z.nom_zone})${seuil}`;
  });
  const uniqueSeuils = [...new Set(zones.map((z) => z.seuil_gratuit).filter(Boolean))];
  const freeNote = uniqueSeuils.length === 1
    ? ` Delivery is FREE for any order of ${uniqueSeuils[0]} HTG or more.`
    : '';
  return `Fees vary by zone: ${lines.join(', ')}.${freeNote}`;
}

export default function CommentCommanderPage() {
  const [zones, setZones] = useState<ZoneLivraison[]>([]);

  useEffect(() => {
    fetch('/api/zones-livraison')
      .then((r) => r.json())
      .then((d) => setZones(d.zones ?? []))
      .catch(() => {});
  }, []);

  const deliveryFaq = {
    q: 'What are the shipping fees?',
    a: buildDeliveryAnswer(zones),
  };

  const faqs = [staticFaqs[0], deliveryFaq, ...staticFaqs.slice(1)];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(242,167,187,0.2) 0%, rgba(232,213,196,0.35) 100%)',
        }}
      >
        <p className="font-lato text-xs tracking-widest text-gray-500 uppercase mb-2">Guide</p>
        <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-gray-800 mb-3">
          How to Order? 💋
        </h1>
        <p className="font-cormorant text-xl text-gray-600 italic max-w-xl mx-auto">
          Ordering from Bestie is simple and fast — we explain everything in 4 steps
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
                    STEP {step.number}
                  </span>
                </div>
                <h3 className="font-playfair font-bold text-xl text-gray-800 mb-2">{step.title}</h3>
                <p className="font-lato text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="font-playfair font-bold text-2xl text-gray-800 mb-6">
          ❓ Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white rounded-2xl p-5 border border-pink-100">
              <h3 className="font-playfair font-semibold text-gray-800 mb-2">{faq.q}</h3>
              <p className="font-lato text-sm text-gray-600 leading-relaxed">{faq.a}</p>
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
          Ready to order? 💋
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/boutique"
            className="bg-white text-primary font-lato font-bold px-8 py-3.5 rounded-full hover:bg-pink-50 transition-colors shadow-md min-h-[48px] flex items-center justify-center"
          >
            View the shop →
          </Link>
          <a
            href="https://wa.me/50900000000"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white font-lato font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors min-h-[48px] flex items-center justify-center"
          >
            💬 Contact us
          </a>
        </div>
      </section>
    </div>
  );
}
