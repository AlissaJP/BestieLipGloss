export type BadgeType = 'bestseller' | 'artisanal' | 'nouveau' | 'none';

export interface Product {
  id: number;
  slug: string;
  name: string;
  shade: string;
  price_htg: number;
  price_usd: number;
  description: string;
  ingredients: string[];
  benefits: string[];
  stock: number;
  badge: string;
  bgColor: string;
  image?: string;
  is_active?: boolean;
  is_bestseller?: boolean;
  badge_type?: BadgeType;
  stock_alerte_seuil?: number;
}

const HONEY_INGREDIENTS = [
  'Beurre de karité',
  "Huile d'argan",
  'Vitamine E',
  'Cire de candelilla',
  'Extrait de miel',
];

const HONEY_BENEFITS = [
  'Hydratation longue durée',
  'Éclat doré et naturel',
  'Soin des lèvres gercées',
];

const LABUBU_INGREDIENTS = [
  'Beurre de karité',
  'Huile de jojoba',
  'Vitamine E',
  "Cire d'abeille naturelle",
  'Extrait de miel',
];

const LABUBU_BENEFITS = [
  'Teinte lumineuse et tendance',
  'Effet volume naturel',
  'Nourrissant et réparateur',
];

export const products: Product[] = [
  {
    id: 1,
    slug: 'honey-brown',
    name: 'Bestie Honey – Brown',
    shade: 'Brun caramel chaleureux',
    price_htg: 1690,
    price_usd: 13,
    description:
      'Un brun caramel riche et chaleureux qui sublime magnifiquement les teints foncés avec profondeur et sensualité. Cette teinte enveloppante apporte une intensité naturelle et sophistiquée à tes lèvres. Le choix idéal pour un regard profond et envoûtant.',
    ingredients: HONEY_INGREDIENTS,
    benefits: HONEY_BENEFITS,
    stock: 15,
    badge: 'Best-seller ✨',
    bgColor: 'bg-amber-800',
    image: '/products/honey/brown.png',
    is_active: true,
    is_bestseller: true,
    badge_type: 'bestseller',
  },
  {
    id: 2,
    slug: 'honey-pink',
    name: 'Bestie Honey – Pink',
    shade: 'Rose nacré lumineux',
    price_htg: 1690,
    price_usd: 13,
    description:
      "Un rose nacré délicat qui enveloppe tes lèvres d'un éclat féminin et lumineux. Cette teinte fraîche et romantique s'adapte à toutes les carnations pour un look naturel et élégant au quotidien.",
    ingredients: HONEY_INGREDIENTS,
    benefits: HONEY_BENEFITS,
    stock: 15,
    badge: 'Best-seller ✨',
    bgColor: 'bg-pink-300',
    image: '/products/honey/pink.png',
    is_active: true,
    is_bestseller: true,
    badge_type: 'bestseller',
  },
  {
    id: 3,
    slug: 'honey-red',
    name: 'Bestie Honey – Red',
    shade: 'Rouge vif intense',
    price_htg: 1690,
    price_usd: 13,
    description:
      'Un rouge vif et intense aux reflets brillants qui réveille immédiatement le regard et illumine ton sourire. Cette teinte audacieuse et joyeuse apporte une énergie positive à tous tes looks.',
    ingredients: HONEY_INGREDIENTS,
    benefits: HONEY_BENEFITS,
    stock: 15,
    badge: 'Best-seller ✨',
    bgColor: 'bg-red-400',
    image: '/products/honey/red.png',
    is_active: true,
    is_bestseller: true,
    badge_type: 'bestseller',
  },
  {
    id: 4,
    slug: 'honey-rosee',
    name: 'Bestie Honey – Rosée',
    shade: 'Rose rosée doux',
    price_htg: 1690,
    price_usd: 13,
    description:
      "Un rose rosée tendre et délicat, léger comme la rosée du matin. Cette teinte lumineuse et naturelle sublime tes lèvres avec une douceur féminine irrésistible pour tous les jours.",
    ingredients: HONEY_INGREDIENTS,
    benefits: HONEY_BENEFITS,
    stock: 15,
    badge: 'Best-seller ✨',
    bgColor: 'bg-rose-200',
    image: '/products/honey/rosee.png',
    is_active: true,
    is_bestseller: true,
    badge_type: 'bestseller',
  },
  {
    id: 5,
    slug: 'honey-rouge-grenadier',
    name: 'Bestie Honey – Rouge Grenadier',
    shade: 'Rouge grenadier profond',
    price_htg: 1690,
    price_usd: 13,
    description:
      'Un rouge grenadier profond et envoûtant inspiré de la richesse des fruits des Caraïbes. Cette teinte somptueuse et majestueuse transforme chaque sourire en une déclaration de confiance et d\'élégance absolue.',
    ingredients: HONEY_INGREDIENTS,
    benefits: HONEY_BENEFITS,
    stock: 15,
    badge: 'Best-seller ✨',
    bgColor: 'bg-red-600',
    image: '/products/honey/rouge-grenadier.png',
    is_active: true,
    is_bestseller: true,
    badge_type: 'bestseller',
  },
  {
    id: 6,
    slug: 'labubu-pastel',
    name: 'Bestie Labubu – Pastel',
    shade: 'Pastel doux & rêveur',
    price_htg: 1690,
    price_usd: 13,
    description:
      'Un pastel doux et rêveur qui habille tes lèvres d\'une légèreté aérienne et féminine. Cette teinte délicate et moderne apporte une fraîcheur unique et tendance à tous tes looks du quotidien.',
    ingredients: LABUBU_INGREDIENTS,
    benefits: LABUBU_BENEFITS,
    stock: 18,
    badge: 'Nouveau 🆕',
    bgColor: 'bg-purple-200',
    image: '/products/labubu/pastel.jpg',
    is_active: true,
    is_bestseller: false,
    badge_type: 'nouveau',
  },
  {
    id: 7,
    slug: 'labubu-pink',
    name: 'Bestie Labubu – Pink',
    shade: 'Rose doux nacré',
    price_htg: 1690,
    price_usd: 13,
    description:
      'Un rose tendre et nacré qui enveloppe tes lèvres d\'une douceur lumineuse. Cette teinte délicate sublime toutes les carnations avec une légèreté féminine et naturelle.',
    ingredients: LABUBU_INGREDIENTS,
    benefits: LABUBU_BENEFITS,
    stock: 18,
    badge: 'Nouveau 🆕',
    bgColor: 'bg-pink-200',
    image: '/products/labubu/pink.jpg',
    is_active: true,
    is_bestseller: false,
    badge_type: 'nouveau',
  },
  {
    id: 8,
    slug: 'labubu-red',
    name: 'Bestie Labubu – Red',
    shade: 'Rouge intense brillant',
    price_htg: 1690,
    price_usd: 13,
    description:
      'Un rouge intense et brillant qui affirme ton style avec audace. Cette teinte classique revisitée apporte une élégance intemporelle à tous tes looks.',
    ingredients: LABUBU_INGREDIENTS,
    benefits: LABUBU_BENEFITS,
    stock: 18,
    badge: 'Nouveau 🆕',
    bgColor: 'bg-red-400',
    image: '/products/labubu/red.jpg',
    is_active: true,
    is_bestseller: false,
    badge_type: 'nouveau',
  },
];
