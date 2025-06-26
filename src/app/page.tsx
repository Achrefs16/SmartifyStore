'use client';
import Hero from '@/components/home/Hero';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import type { FC } from 'react';
import Head from 'next/head';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  oldPrice?: number;
  discount?: number;
}

interface Category { name: string; }

const CategoryProductRows: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageByCategory, setPageByCategory] = useState<Record<string, number>>({});
  const PAGE_SIZE = 5;

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/admin/categories'),
        ]);
        const [prodData, catData] = await Promise.all([
          prodRes.json(),
          catRes.json(),
        ]);
        setProducts(prodData);
        setCategories(catData);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;

  const productsByCategory: Record<string, Product[]> = categories.reduce((acc, cat) => {
    acc[cat.name] = products.filter((p) => p.category === cat.name);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="space-y-12">
      {categories.map((cat) => {
        const catProducts = productsByCategory[cat.name] || [];
        if (catProducts.length === 0) return null;
        const page = pageByCategory[cat.name] || 0;
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const paginated = catProducts.slice(start, end);
        const totalPages = Math.ceil(catProducts.length / PAGE_SIZE);
        return (
          <section key={cat.name}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{cat.name}</h2>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => setPageByCategory(prev => ({ ...prev, [cat.name]: Math.max(0, page - 1) }))}
                  disabled={page === 0}
                  aria-label="Précédent"
                >
                  <span>&larr;</span>
                </button>
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => setPageByCategory(prev => ({ ...prev, [cat.name]: Math.min(totalPages - 1, page + 1) }))}
                  disabled={page >= totalPages - 1}
                  aria-label="Suivant"
                >
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {paginated.map((product) => (
                <div key={product._id} className="w-64 flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// This would typically come from your API

export default function Home() {
  return (
    <>
      <Head>
        <title>Smartify Store Tunisie | Électronique, Parfums, Soins Personnels</title>
        <meta name="description" content="Boutique en ligne en Tunisie pour électronique, parfums originaux, et produits de soins personnels. Livraison rapide, qualité garantie." />
        <meta property="og:title" content="Smartify Store Tunisie | Électronique, Parfums, Soins Personnels" />
        <meta property="og:description" content="Boutique en ligne en Tunisie pour électronique, parfums originaux, et produits de soins personnels. Livraison rapide, qualité garantie." />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:url" content="https://smartify-store.vercel.app/" />
        <link rel="canonical" href="https://smartify-store.vercel.app/" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Smartify Store',
          url: 'https://smartify-store.vercel.app/',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://smartify-store.vercel.app/products?search={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }) }} />
      </Head>
      <div>
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Produits en Vedette
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection de produits les plus populaires
            </p>
          </div>
          <CategoryProductRows />
        </div>
      </div>
    </>
  );
}
