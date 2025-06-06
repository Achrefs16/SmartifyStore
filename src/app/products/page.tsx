"use client";

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import { FunnelIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { categories } from '@/config/categories';

const sortOptions = [
  { label: 'Plus récents', value: 'newest' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix décroissant', value: 'price-desc' },
  { label: 'Popularité', value: 'popularity' },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
                    onClick={() => setSelectedCategory('Tous')}
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
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        selectedCategory === category.id
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
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                )}{' '}
                produits
              </p>
            </div>

            {/* Products */}
            {isLoading ? (
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
  );
} 