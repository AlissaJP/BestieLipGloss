// Coordonnées de contact — définir les variables dans .env.local avant la mise en production
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '50900000000';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const ZELLE_EMAIL = process.env.NEXT_PUBLIC_ZELLE_EMAIL ?? 'bestielipgloss@gmail.com';

// Réseaux sociaux — laisser vide ('') pour masquer le lien
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? '';
export const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? '';
export const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL ?? '';
