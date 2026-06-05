export interface ColorVariant {
  id: string;
  name: string;
  shade: string;
  description: string;
  image: string;
  bgColor: string;
}

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
}

export const products: Product[] = [
  {
    id: 1,
    slug: 'rosee-matinale',
    name: 'Rosée Matinale',
    shade: 'Collection Honey · 4 teintes',
    price_htg: 450,
    price_usd: 3.50,
    description:
      'Un gloss léger comme la rosée du matin, qui illumine tes lèvres d\'un éclat nacré et naturel. Sa formule hydratante te laisse un confort exceptionnel toute la journée. Disponible en 4 teintes pour s\'adapter à chaque humeur.',
    ingredients: [
      'Beurre de karité',
      'Huile d\'argan',
      'Vitamine E',
      'Cire de candelilla',
      'Extrait de rose',
    ],
    benefits: [
      'Hydratation longue durée',
      'Éclat naturel et nacré',
      'Soin des lèvres gercées',
    ],
    stock: 15,
    badge: 'Artisanal 🌿',
    bgColor: 'bg-pink-300',
    bgColorMini: ['bg-pink-200', 'bg-amber-200', 'bg-red-400', 'bg-red-900'],
    introImage: '/products/honey/intro.png',
    variants: [
      {
        id: 'cherry',
        name: 'Cherry',
        shade: '01# Rose cerise nacré',
        description:
          'Un rose cerise lumineux aux reflets nacrés qui habille tes lèvres d\'un voile doux et féminin. Cette teinte fraîche et romantique s\'adapte à toutes les carnations et sublime naturellement ton sourire au quotidien. Le choix parfait pour un look printanier et pétillant.',
        image: '/products/honey/cherry.png',
        bgColor: 'bg-pink-400',
      },
      {
        id: 'honey-rose',
        name: 'Honey Rose',
        shade: 'Champagne doré shimmer',
        description:
          'Un champagne rosé aux reflets dorés scintillants qui enveloppe tes lèvres d\'une lumière chaude et sophistiquée. Ce gloss ultra-brillant magnifie particulièrement les teints foncés en leur apportant une profondeur lumineuse irrésistible. Idéal pour un look chic de jour comme de soirée.',
        image: '/products/honey/champagne.png',
        bgColor: 'bg-amber-300',
      },
      {
        id: 'strawberry',
        name: 'Strawberry',
        shade: '02# Rouge fraise vif',
        description:
          'Un rouge fraise vibrant et intense aux reflets brillants qui réveille immédiatement le regard et illumine ton sourire. Cette teinte audacieuse et joyeuse apporte une énergie positive contagieuse à tous tes looks. Parfaite pour les sorties, les fêtes ou simplement quand tu veux te démarquer.',
        image: '/products/honey/strawberry.png',
        bgColor: 'bg-red-400',
      },
      {
        id: 'rouge-grenat',
        name: 'Rouge Grenat',
        shade: 'Bordeaux profond envoûtant',
        description:
          'Un rouge grenat profond et envoûtant aux reflets bordeaux qui incarne l\'élégance absolue. Cette teinte somptueuse et majestueuse transforme chaque sourire en une déclaration de confiance et de féminité pleinement assumée. Réservée aux femmes qui osent l\'intensité et qui savent ce qu\'elles valent.',
        image: '/products/honey/garnet.png',
        bgColor: 'bg-red-900',
      },
    ],
  },
  {
    id: 2,
    slug: 'nude-cherie',
    name: 'Nude Chérie',
    shade: 'Beige miel doux',
    price_htg: 400,
    price_usd: 3.00,
    description:
      'La teinte nude parfaite pour toutes les carnations haïtiennes — un beige miel qui sublime sans artifice. Ce gloss fondant nourrit tes lèvres tout en leur donnant un volume naturel irrésistible. L\'élégance simple au quotidien.',
    ingredients: [
      'Beurre de karité',
      'Huile de jojoba',
      'Vitamine E',
      'Cire d\'abeille naturelle',
      'Extrait de miel',
    ],
    benefits: [
      'Teinte universelle',
      'Effet volume naturel',
      'Nourrissant et réparateur',
    ],
    stock: 18,
    badge: 'Best-seller ✨',
    bgColor: 'bg-amber-100',
    bgColorMini: ['bg-yellow-100', 'bg-amber-200', 'bg-orange-100'],
  },
  {
    id: 3,
    slug: 'corail-vibrant',
    name: 'Corail Vibrant',
    shade: 'Corail chaud lumineux',
    price_htg: 500,
    price_usd: 3.80,
    description:
      'Un corail vif et chaleureux qui éclate comme le soleil des Caraïbes sur tes lèvres. Sa formule enrichie en huile d\'argan offre une couleur intense qui tient toute la journée. Idéal pour apporter de la vie à tous tes looks.',
    ingredients: [
      'Beurre de karité',
      'Huile d\'argan',
      'Vitamine C',
      'Pigments naturels',
      'Aloe vera',
    ],
    benefits: [
      'Couleur intense longue tenue',
      'Lèvres repulpées',
      'Anti-oxydant naturel',
    ],
    stock: 12,
    badge: 'Best-seller ✨',
    bgColor: 'bg-orange-300',
    bgColorMini: ['bg-orange-200', 'bg-red-200', 'bg-yellow-200'],
  },
  {
    id: 4,
    slug: 'berry-kiss',
    name: 'Berry Kiss',
    shade: 'Baie sauvage profond',
    price_htg: 550,
    price_usd: 4.20,
    description:
      'Un rouge profond aux reflets baie qui réveille tes lèvres et ta confiance. Cette teinte audacieuse, inspirée des fruits sauvages des mornes haïtiennes, est à la fois sensuelle et naturelle. Pour les femmes qui osent.',
    ingredients: [
      'Beurre de karité',
      'Huile de pépins de raisin',
      'Vitamine E',
      'Extrait de myrtille',
      'Cire de carnauba',
    ],
    benefits: [
      'Teinte profonde et lumineuse',
      'Lèvres protégées et douces',
      'Tenue renforcée',
    ],
    stock: 9,
    badge: 'Artisanal 🌿',
    bgColor: 'bg-purple-300',
    bgColorMini: ['bg-purple-200', 'bg-fuchsia-300', 'bg-pink-300'],
  },
  {
    id: 5,
    slug: 'or-rose',
    name: 'Or Rose',
    shade: 'Doré rose scintillant',
    price_htg: 600,
    price_usd: 4.50,
    description:
      'Notre gloss le plus glamour — un or rose aux mille reflets qui transforme n\'importe quel look en moment de fête. Ses micro-paillettes dorées dansent sur tes lèvres comme le soleil sur la mer des Caraïbes. Un trésor pour les grandes occasions.',
    ingredients: [
      'Beurre de karité',
      'Huile de moringa',
      'Vitamine E',
      'Mica doré naturel',
      'Extrait de vanille',
    ],
    benefits: [
      'Effet scintillant longue durée',
      'Hydratation intense',
      'Parfum délicat à la vanille',
    ],
    stock: 8,
    badge: 'Best-seller ✨',
    bgColor: 'bg-yellow-200',
    bgColorMini: ['bg-amber-100', 'bg-yellow-300', 'bg-orange-200'],
  },
];
