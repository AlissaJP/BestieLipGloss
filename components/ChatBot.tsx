'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, GripHorizontal } from 'lucide-react';

type Message = { id: number; text: string; from: 'bot' | 'user' };

const FAQ = [
  {
    q: '📦 Comment commander ?',
    a: 'Choisis ton produit dans la boutique, ajoute-le au panier, puis clique sur "Commander". Tu recevras une confirmation par WhatsApp. 🛍️',
  },
  {
    q: '🚚 Délai de livraison ?',
    a: 'Livraison dans tout Haïti en 24 à 72h selon ta localisation. Tu seras contactée par WhatsApp pour confirmer. 📍',
  },
  {
    q: '💰 Prix & paiement ?',
    a: 'Nos glosses vont de 400 à 600 HTG. Paiement à la livraison (cash) ou par transfert MonCash / Natcash. 💳',
  },
  {
    q: '🎨 Couleurs disponibles ?',
    a: 'La Rosée Matinale existe en 4 teintes : Cherry, Honey Rose, Strawberry et Rouge Grenat. Visite la boutique pour découvrir tous nos produits ! ✨',
  },
  {
    q: '🌿 Ingrédients naturels ?',
    a: 'Oui, 100% naturels ! Beurre de karité, huile d\'argan, vitamine E. Aucun parabène, aucune silicone. Ta peau mérite le meilleur. 💚',
  },
  {
    q: '📞 Contacter Bestie',
    a: 'Écris-nous sur WhatsApp au +509 0000 0000. Nous répondons en moins de 2h ! Tu peux aussi envoyer un message via le bouton WhatsApp du site. 💬',
  },
];

const GREETING = 'Bonjour ! 💕 Je suis l\'assistante Bestie. Clique sur une question pour que je t\'aide !';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: GREETING, from: 'bot' },
  ]);
  const [counter, setCounter] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleFAQ = (faq: { q: string; a: string }) => {
    setMessages((prev) => [
      ...prev,
      { id: counter, text: faq.q, from: 'user' },
      { id: counter + 1, text: faq.a, from: 'bot' },
    ]);
    setCounter((c) => c + 2);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      className="fixed bottom-6 right-6 z-50"
      style={{ touchAction: 'none', userSelect: 'none' }}
      ref={constraintsRef}
    >
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Header — also serves as drag handle visual cue */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">💋</span>
                <div>
                  <p className="font-lato font-bold text-white text-sm">Bestie Assistant</p>
                  <p className="font-lato text-white/80 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                    En ligne
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GripHorizontal size={16} className="text-white/50" aria-hidden="true" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                  aria-label="Fermer le chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="h-52 overflow-y-auto p-3 space-y-2"
              style={{ background: 'linear-gradient(180deg, #fdf2f4 0%, #fff 100%)' }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 text-xs font-lato leading-relaxed ${
                      msg.from === 'bot'
                        ? 'bg-white text-gray-700 shadow-sm rounded-2xl rounded-tl-none'
                        : 'bg-primary text-white rounded-2xl rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div
              className="p-3 border-t border-pink-100 space-y-1.5 max-h-44 overflow-y-auto bg-white"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p className="font-lato text-xs text-gray-400 mb-2">Questions fréquentes :</p>
              {FAQ.map((faq) => (
                <button
                  key={faq.q}
                  onClick={() => handleFAQ(faq)}
                  className="w-full text-left font-lato text-xs text-gray-700 bg-pink-50 hover:bg-pink-100 active:bg-pink-200 px-3 py-2 rounded-full transition-colors border border-pink-100 hover:border-primary/30"
                >
                  {faq.q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen((o) => !o)}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-14 h-14 bg-primary hover:bg-pink-400 rounded-full shadow-xl flex items-center justify-center transition-colors relative"
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat Bestie'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={22} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {!isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"
            aria-hidden="true"
          />
        )}
      </motion.button>
    </motion.div>
  );
}
