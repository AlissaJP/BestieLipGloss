'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, MessageCircle, CreditCard, Package } from 'lucide-react';
import type { ZoneLivraison } from '@/app/api/zones-livraison/route';

const steps = [
  {
    number: '01',
    icon: <ShoppingBag size={28} className="text-primary" />,
    title: 'Choisis tes produits',
    desc: 'Parcours notre boutique et ajoute tes teintes préférées au panier. Tu peux sélectionner plusieurs articles en une seule commande.',
    color: 'bg-pink-50',
  },
  {
    number: '02',
    icon: <CreditCard size={28} className="text-purple-600" />,
    title: 'Valide ta commande',
    desc: 'Remplis tes informations de livraison (nom, adresse, quartier, ville et numéro WhatsApp), puis choisis ton mode de paiement.',
    color: 'bg-purple-50',
  },
  {
    number: '03',
    icon: <MessageCircle size={28} className="text-green-600" />,
    title: 'Effectue le paiement',
    desc: "Règle ta commande via MonCash ou Zelle selon les instructions affichées. Envoie ensuite la capture d'écran de confirmation.",
    color: 'bg-green-50',
  },
  {
    number: '04',
    icon: <Package size={28} className="text-accent" />,
    title: 'Reçois ta livraison',
    desc: "Notre équipe vérifie ton paiement et te contacte sur WhatsApp sous 2h. La livraison s'effectue en 24 à 72h selon ta ville.",
    color: 'bg-amber-50',
  },
];

const staticFaqs = [
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'La livraison prend 24 à 72 heures après confirmation du paiement. Port-au-Prince et Pétion-Ville sont généralement livrés en 24h.',
  },
  {
    q: 'Comment puis-je payer ?',
    a: "Nous acceptons MonCash (numéro haïtien) et Zelle (pour les clients en dehors d'Haïti). D'autres modes de paiement seront disponibles bientôt.",
  },
  {
    q: 'Puis-je retourner un produit ?',
    a: "Pour des raisons d'hygiène, nous n'acceptons pas les retours sur les produits cosmétiques ouverts. Si ton produit est endommagé à la réception, contacte-nous immédiatement sur WhatsApp avec une photo.",
  },
  {
    q: "Est-ce que vous livrez en dehors d'Haïti ?",
    a: "Pour l'instant, nous livrons uniquement en Haïti. Nous travaillons sur des options de livraison internationale — reste connectée !",
  },
];

function buildDeliveryAnswer(zones: ZoneLivraison[]): string {
  if (zones.length === 0) {
    return "Les frais varient selon la ville : 150 HTG (Port-au-Prince centre), 200 HTG (Pétion-Ville), 250 HTG (Zone métropolitaine), 350 HTG (Cap-Haïtien), 400 HTG (autres villes). La livraison est GRATUITE pour toute commande de 2 000 HTG ou plus.";
  }
  const lines = zones.map((z) => {
    const seuil = z.seuil_gratuit ? ` — gratuite dès ${z.seuil_gratuit} HTG` : '';
    return `${z.frais_htg} HTG (${z.nom_zone})${seuil}`;
  });
  const uniqueSeuils = [...new Set(zones.map((z) => z.seuil_gratuit).filter(Boolean))];
  const freeNote = uniqueSeuils.length === 1
    ? ` La livraison est GRATUITE pour toute commande de ${uniqueSeuils[0]} HTG ou plus.`
    : '';
  return `Les frais varient selon la zone : ${lines.join(', ')}.${freeNote}`;
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
    q: 'Quels sont les frais de livraison ?',
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
          Comment commander ? 💋
        </h1>
        <p className="font-cormorant text-xl text-gray-600 italic max-w-xl mx-auto">
          Commander chez Bestie est simple et rapide — on t&apos;explique tout en 4 étapes
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
                    ÉTAPE {step.number}
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
          ❓ Questions fréquentes
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
          Prête à commander ? 💋
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/boutique"
            className="bg-white text-primary font-lato font-bold px-8 py-3.5 rounded-full hover:bg-pink-50 transition-colors shadow-md min-h-[48px] flex items-center justify-center"
          >
            Voir la boutique →
          </Link>
          <a
            href="https://wa.me/50900000000"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white font-lato font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors min-h-[48px] flex items-center justify-center"
          >
            💬 Nous contacter
          </a>
        </div>
      </section>
    </div>
  );
}
