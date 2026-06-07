'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { products as staticProducts } from '@/data/products';
import ProductDetailClient from './ProductDetailClient';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const managedProducts = useAdminStore((s) => s.managedProducts);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const catalog = managedProducts.length > 0 ? managedProducts : staticProducts;
  const product = catalog.find((p) => p.slug === slug);
  const related = catalog
    .filter((p) => ('published' in p ? p.published : true))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!product) return notFound();

  return <ProductDetailClient product={product} related={related} />;
}
