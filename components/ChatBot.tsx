'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

type Message = { id: number; text: string; from: 'bot' | 'user'; streaming?: boolean };

const KEYWORDS: { words: string[]; faqIndex: number }[] = [
  { words: ['order', 'ordering', 'buy', 'purchase', 'cart', 'commander', 'commande', 'acheter', 'panier', 'pedir', 'pedido', 'comprar'], faqIndex: 0 },
  { words: ['delivery', 'shipping', 'ship', 'deliver', 'time', 'wait', 'livraison', 'délai', 'livrer', 'entrega', 'envío', 'entregar'], faqIndex: 1 },
  { words: ['price', 'payment', 'pay', 'cost', 'moncash', 'natcash', 'htg', 'prix', 'paiement', 'zelle', 'precio', 'pago', 'pagar', 'costo'], faqIndex: 2 },
  { words: ['color', 'shade', 'colour', 'cherry', 'honey', 'strawberry', 'grenat', 'couleur', 'teinte', 'tono'], faqIndex: 3 },
  { words: ['ingredient', 'natural', 'shea', 'argan', 'paraben', 'naturel', 'karité', 'ingrédient', 'ingrediente'], faqIndex: 4 },
  { words: ['contact', 'whatsapp', 'phone', 'call', 'number', 'reach', 'téléphone', 'numéro', 'teléfono', 'contacto'], faqIndex: 5 },
];

function BotAvatar({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const [imgError, setImgError] = useState(false);
  const cls =
    size === 'lg'
      ? 'w-11 h-11 rounded-2xl object-cover'
      : 'w-6 h-6 rounded-full object-cover shrink-0';

  if (imgError) {
    return (
      <div
        className={
          size === 'lg'
            ? 'w-11 h-11 rounded-2xl flex items-center justify-center text-2xl bg-white/25 backdrop-blur-sm'
            : 'w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0'
        }
        style={
          size === 'sm'
            ? { background: 'linear-gradient(135deg, #D45F85, #D4835A)' }
            : {}
        }
      >
        💋
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/avatar-bot.png"
      alt="Bestie"
      className={cls}
      onError={() => setImgError(true)}
    />
  );
}

export default function ChatBot() {
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.chatbot;

  const getBotReply = (input: string): string => {
    const lower = input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    for (const { words, faqIndex } of KEYWORDS) {
      if (words.some((w) => lower.includes(w))) return t.faqs[faqIndex].a;
    }
    return t.defaultReply;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: t.greeting, from: 'bot' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [counter, setCounter] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset chat when language changes
  useEffect(() => {
    setMessages([{ id: 0, text: t.greeting, from: 'bot' }]);
    setCounter(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  useEffect(() => {
    return () => { if (streamRef.current) clearInterval(streamRef.current); };
  }, []);

  const streamReply = (fullText: string, msgId: number) => {
    let i = 0;
    streamRef.current = setInterval(() => {
      i += 2;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, text: fullText.slice(0, i), streaming: i < fullText.length } : m
        )
      );
      if (i >= fullText.length) {
        clearInterval(streamRef.current!);
        streamRef.current = null;
      }
    }, 22);
  };

  const deliverBotReply = (reply: string, userId: number) => {
    const botId = userId + 1;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: botId, text: '', from: 'bot', streaming: true }]);
      streamReply(reply, botId);
    }, 700);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    const reply = getBotReply(trimmed);
    const userId = counter;
    setMessages((prev) => [...prev, { id: userId, text: trimmed, from: 'user' }]);
    setCounter((c) => c + 2);
    setInputValue('');
    deliverBotReply(reply, userId);
  };

  const handleFAQ = (faq: { q: string; a: string }) => {
    if (isTyping) return;
    const userId = counter;
    setMessages((prev) => [...prev, { id: userId, text: faq.q, from: 'user' }]);
    setCounter((c) => c + 2);
    deliverBotReply(faq.a, userId);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute bottom-20 right-0 w-[350px] bg-white rounded-3xl overflow-hidden"
            style={{
              boxShadow:
                '0 8px 40px rgba(242,167,187,0.35), 0 2px 12px rgba(0,0,0,0.10)',
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #D45F85 0%, #D4835A 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <BotAvatar size="lg" />
                <div>
                  <p className="font-playfair font-bold text-white text-[17px] leading-tight">
                    Bestie
                  </p>
                  <p className="font-lato text-white/85 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block animate-pulse" />
                    {t.online}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
                aria-label={t.closeChat}
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="h-60 overflow-y-auto px-4 py-4 space-y-3"
              style={{
                background: 'linear-gradient(180deg, #FFF5F8 0%, #FFFFFF 60%)',
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${
                    msg.from === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.from === 'bot' && <BotAvatar size="sm" />}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 font-lato text-[13px] leading-relaxed ${
                      msg.from === 'bot'
                        ? 'bg-white text-gray-700 rounded-2xl rounded-bl-sm shadow-sm border border-pink-50'
                        : 'text-white rounded-2xl rounded-br-sm shadow-sm'
                    }`}
                    style={
                      msg.from === 'user'
                        ? { background: 'linear-gradient(135deg, #D45F85, #D4835A)' }
                        : {}
                    }
                  >
                    {msg.text}
                    {msg.streaming && (
                      <span
                        className="inline-block w-0.5 h-3.5 ml-0.5 rounded-full align-middle animate-pulse"
                        style={{ background: '#D45F85', verticalAlign: 'middle' }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Dots typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-2"
                  >
                    <BotAvatar size="sm" />
                    <div className="bg-white border border-pink-50 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#D45F85' }}
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 0.55,
                            delay: i * 0.15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* FAQ chips */}
            <div className="px-4 pt-2.5 pb-2 border-t border-pink-50 bg-white">
              <p className="font-lato text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                {t.suggestions}
              </p>
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none' }}
              >
                {t.faqs.map((faq) => (
                  <button
                    key={faq.q}
                    onClick={() => handleFAQ(faq)}
                    className="font-lato text-[12px] text-primary bg-pink-50 hover:bg-pink-100 active:scale-95 px-3 py-1.5 rounded-full whitespace-nowrap border border-pink-100 hover:border-primary/40 transition-all shrink-0"
                  >
                    {faq.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-pink-50 flex items-center gap-2.5">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage(inputValue);
                }}
                placeholder={t.placeholder}
                className="flex-1 font-lato text-sm bg-pink-50/70 border border-pink-100 rounded-full px-4 py-2.5 outline-none focus:border-primary/50 focus:bg-pink-50 transition-all placeholder-gray-300"
              />
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-35"
                style={{ background: 'linear-gradient(135deg, #D45F85, #D4835A)' }}
                aria-label={t.sendAria}
              >
                <Send size={14} className="text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <div className="relative">
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(242,167,187,0.4)' }}
            animate={{ scale: [1, 1.55, 1.55], opacity: [0.7, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.91 }}
          onClick={() => setIsOpen((o) => !o)}
          className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #D45F85 0%, #D4835A 100%)',
            boxShadow: '0 4px 20px rgba(242,167,187,0.55)',
          }}
          aria-label={isOpen ? t.closeChat : t.openChat}
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
                <X size={20} className="text-white" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-2xl"
              >
                💋
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
