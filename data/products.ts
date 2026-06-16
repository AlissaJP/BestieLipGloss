export interface ColorVariant {
  id: string;
  name: string;
  shade: string;
  description: string;
  image: string;
  bgColor: string;
  ordre_affichage?: number;
  is_active?: boolean;
}

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
  bgColorMini: string[];
  introImage?: string;
  variants?: ColorVariant[];
  is_active?: boolean;
  is_bestseller?: boolean;
  badge_type?: BadgeType;
  collection?: string;
  stock_alerte_seuil?: number;
}

export const products: Product[] = [
  {
    id: 1,
    slug: 'bestie-honey',
    name: 'Bestie Honey',
    shade: 'Collection Honey · 5 teintes',
    price_htg: 1690,
    price_usd: 13,
    description:
      'La collection Honey de Bestie LipGloss — un gloss nourrissant et ultra-brillant disponible en 5 teintes dorées et chaleureuses. Sa formule enrichie au beurre de karité et à l\'huile d\'argan illumine tes lèvres d\'un éclat naturel irrésistible. Pour chaque humeur, une teinte Honey t\'attend.',
    ingredients: [
      'Beurre de karité',
      'Huile d\'argan',
      'Vitamine E',
      'Cire de candelilla',
      'Extrait de miel',
    ],
    benefits: [
      'Hydratation longue durée',
      'Éclat doré et naturel',
      'Soin des lèvres gercées',
    ],
    stock: 15,
    badge: 'Best-seller ✨',
    bgColor: 'bg-amber-100',
    bgColorMini: ['bg-amber-800', 'bg-pink-300', 'bg-red-400', 'bg-rose-200', 'bg-red-600'],
    introImage: '/products/honey/introduction.png',
    is_active: true,
    is_bestseller: true,
    badge_type: 'bestseller',
    collection: 'Collection Honey',
    variants: [
      {
        id: 'honey-brown',
        name: 'Brown',
        ordre_affichage: 1,
        shade: 'Brun caramel chaleureux',
        description:
          'Un brun caramel riche et chaleureux qui sublime magnifiquement les teints foncés avec profondeur et sensualité. Cette teinte enveloppante apporte une intensité naturelle et sophistiquée à tes lèvres. Le choix idéal pour un regard profond et envoûtant.',
        image: '/products/honey/brown.png',
        bgColor: 'bg-amber-800',
        is_active: true,
      },
      {
        id: 'honey-pink',
        name: 'Pink',
        ordre_affichage: 2,
        shade: 'Rose nacré lumineux',
        description:
          'Un rose nacré délicat qui enveloppe tes lèvres d\'un éclat féminin et lumineux. Cette teinte fraîche et romantique s\'adapte à toutes les carnations pour un look naturel et élégant au quotidien.',
        image: '/products/honey/pink.png',
        bgColor: 'bg-pink-300',
        is_active: true,
      },
      {
        id: 'honey-red',
        name: 'Red',
        ordre_affichage: 3,
        shade: 'Rouge vif intense',
        description:
          'Un rouge vif et intense aux reflets brillants qui réveille immédiatement le regard et illumine ton sourire. Cette teinte audacieuse et joyeuse apporte une énergie positive à tous tes looks.',
        image: '/products/honey/red.png',
        bgColor: 'bg-red-400',
        is_active: true,
      },
      {
        id: 'honey-rosee',
        name: 'Rosée',
        ordre_affichage: 4,
        shade: 'Rose rosée doux',
        description:
          'Un rose rosée tendre et délicat, léger comme la rosée du matin. Cette teinte lumineuse et naturelle sublime tes lèvres avec une douceur féminine irrésistible pour tous les jours.',
        image: '/products/honey/rosee.png',
        bgColor: 'bg-rose-200',
        is_active: true,
      },
      {
        id: 'honey-rouge-grenadier',
        name: 'Rouge Grenadier',
        ordre_affichage: 5,
        shade: 'Rouge grenadier profond',
        description:
          'Un rouge grenadier profond et envoûtant inspiré de la richesse des fruits des Caraïbes. Cette teinte somptueuse et majestueuse transforme chaque sourire en une déclaration de confiance et d\'élégance absolue.',
        image: '/products/honey/rouge-grenadier.png',
        bgColor: 'bg-red-600',
        is_active: true,
      },
    ],
  },
  {
    id: 2,
    slug: 'bestie-labubu',
    name: 'Bestie Labubu',
    shade: 'Collection Labubu · 3 teintes',
    price_htg: 1690,
    price_usd: 13,
    description:
      'La collection Labubu de Bestie LipGloss — un gloss fondant et nourrissant en 3 teintes tendance. Sa formule au beurre de karité et à l\'huile de jojoba nourrit tes lèvres tout en leur donnant un volume naturel irrésistible. L\'élégance playful au quotidien.',
    ingredients: [
      'Beurre de karité',
      'Huile de jojoba',
      'Vitamine E',
      'Cire d\'abeille naturelle',
      'Extrait de miel',
    ],
    benefits: [
      'Teinte lumineuse et tendance',
      'Effet volume naturel',
      'Nourrissant et réparateur',
    ],
    stock: 18,
    badge: 'Nouveau 🆕',
    bgColor: 'bg-purple-100',
    bgColorMini: ['bg-purple-200', 'bg-pink-200', 'bg-red-400'],
    introImage: '/products/labubu/introduction.jpg',
    is_active: true,
    is_bestseller: false,
    badge_type: 'nouveau',
    collection: 'Collection Labubu',
    variants: [
      {
        id: 'labubu-pastel',
        name: 'Pastel',
        ordre_affichage: 1,
        shade: 'Pastel doux & rêveur',
        description:
          'Un pastel doux et rêveur qui habille tes lèvres d\'une légèreté aérienne et féminine. Cette teinte délicate et moderne apporte une fraîcheur unique et tendance à tous tes looks du quotidien.',
        image: '/products/labubu/pastel.jpg',
        bgColor: 'bg-purple-200',
        is_active: true,
      },
      {
        id: 'labubu-pink',
        name: 'Pink',
        ordre_affichage: 2,
        shade: 'Rose doux nacré',
        description:
          'Un rose tendre et nacré qui enveloppe tes lèvres d\'une douceur lumineuse. Cette teinte délicate sublime toutes les carnations avec une légèreté féminine et naturelle.',
        image: '/products/labubu/pink.jpg',
        bgColor: 'bg-pink-200',
        is_active: true,
      },
      {
        id: 'labubu-red',
        name: 'Red',
        ordre_affichage: 3,
        shade: 'Rouge intense brillant',
        description:
          'Un rouge intense et brillant qui affirme ton style avec audace. Cette teinte classique revisitée apporte une élégance intemporelle à tous tes looks.',
        image: '/products/labubu/red.jpg',
        bgColor: 'bg-red-400',
        is_active: true,
      },
    ],
  },
];
