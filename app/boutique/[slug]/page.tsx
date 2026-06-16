import { notFound } from 'next/navigation';
import { products as staticProducts } from '@/data/products';
import ProductDetailClient from './ProductDetailClient';

export function generateStaticParams() {
  return staticProducts.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = staticProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = staticProducts
    .filter((p) => p.is_active !== false)
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return <ProductDetailClient product={product} related={related} />;
}
