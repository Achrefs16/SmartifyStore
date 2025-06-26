"use client";

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import { FunnelIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import type { FC } from 'react';
import Head from 'next/head';

const sortOptions = [
  { label: 'Plus récents', value: 'newest' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix décroissant', value: 'price-desc' },
  { label: 'Popularité', value: 'popularity' },
];

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

  if (loading) return <div className="py-12 text-center text-gray-500">Chargement...</div>;
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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<{ name: string }[]>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  // Set selectedCategory from URL on load and when URL changes
  useEffect(() => {
    if (categories.length === 0) return;
    const urlCategory = searchParams.get('category');
    if (urlCategory && categories.some(c => c.name === urlCategory)) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('Tous');
    }
  }, [searchParams, categories]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // When user clicks a category, update state and URL
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (category === 'Tous') {
      router.push('/products');
    } else {
      router.push(`/products?category=${encodeURIComponent(category)}`);
    }
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = Number(value);
    if (type === 'min') {
      setPriceRange(prev => ({
        ...prev,
        min: Math.min(numValue, prev.max)
      }));
    } else {
      setPriceRange(prev => ({
        ...prev,
        max: Math.max(numValue, prev.min)
      }));
    }
  };

  return (
    <>
      <Head>
        <title>Catalogue Produits | Smartify Store Tunisie</title>
        <meta name="description" content="Découvrez tous les produits électroniques, parfums et soins personnels disponibles chez Smartify Store en Tunisie." />
        <meta property="og:title" content="Catalogue Produits | Smartify Store Tunisie" />
        <meta property="og:description" content="Découvrez tous les produits électroniques, parfums et soins personnels disponibles chez Smartify Store en Tunisie." />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:url" content="https://smartify-store.vercel.app/products" />
        <link rel="canonical" href="https://smartify-store.vercel.app/products" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Catalogue Produits',
          url: 'https://smartify-store.vercel.app/products',
          about: ['électronique', 'parfum', 'soins personnels', 'Tunisie']
        }) }} />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtres
              {showFilters && (
                <XMarkIcon className="h-5 w-5 ml-2" />
              )}
            </button>
          </div>

          <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
            {/* Filters Sidebar */}
            <div
              className={`lg:block ${
                showFilters ? 'block' : 'hidden'
              } bg-white rounded-xl shadow-sm p-6 mb-6 lg:mb-0 transition-all duration-300`}
            >
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Catégories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryClick('Tous')}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        selectedCategory === 'Tous'
                          ? 'bg-[#fc6f03]/10 text-[#fc6f03] font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Tous les produits
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          selectedCategory === category.name
                            ? 'bg-[#fc6f03]/10 text-[#fc6f03] font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Prix
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label htmlFor="min-price" className="block text-sm text-gray-600 mb-1">
                          Min
                        </label>
                        <input
                          type="number"
                          id="min-price"
                          value={priceRange.min}
                          onChange={(e) => handlePriceChange('min', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fc6f03] focus:border-transparent"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="max-price" className="block text-sm text-gray-600 mb-1">
                          Max
                        </label>
                        <input
                          type="number"
                          id="max-price"
                          value={priceRange.max}
                          onChange={(e) => handlePriceChange('max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fc6f03] focus:border-transparent"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {/* Sort Options */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#fc6f03] focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedCategory !== 'Tous' && (
                    <span className="font-medium">
                      {categories.find((c) => c.name === selectedCategory)?.name}
                    </span>
                  )}{' '}
                  produits
                </p>
              </div>

              {/* Products */}
              {selectedCategory === 'Tous' ? (
                <CategoryProductRows />
              ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              ) : (
                <ProductGrid
                  selectedCategory={selectedCategory}
                  sortBy={sortBy}
                  minPrice={priceRange.min}
                  maxPrice={priceRange.max}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 