"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      href={`/products/${product._id}`}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
      >
        {isFavorite ? (
          <HeartIconSolid className="h-4 w-4 text-[#fc6f03]" />
        ) : (
          <HeartIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-medium">Rupture de stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500">{product.category}</span>
          <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            {parseFloat(product.price.toFixed(3))} DT
          </span>
          <button
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[#fc6f03] hover:bg-[#e56500] transition-colors"
          >
            Voir détails
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="mt-2 text-xs text-[#fc6f03] font-medium">
            Plus que {product.stock} en stock !
          </p>
        )}
      </div>
    </Link>
  );
} 