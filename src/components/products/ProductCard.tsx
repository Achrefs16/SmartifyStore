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
  oldPrice?: number;
  discount?: number; // percent, e.g., 39 for 39%
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      href={`/products/${product._id}`}
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-full max-w-xs sm:max-w-sm mx-auto p-3 sm:p-5 flex flex-col gap-3"
      style={{ minHeight: '370px' }}
    >
      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-md"
      >
        {isFavorite ? (
          <HeartIconSolid className="h-5 w-5 text-[#fc6f03]" />
        ) : (
          <HeartIcon className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Product Image */}
      <div className="relative w-full aspect-square mb-2">
        {/* Discount Badge */}
        {product.discount && (
          <span className="absolute top-3 left-3 bg-[#fed7aa] text-black text-xs font-bold px-2 py-1 rounded-full z-10">
            {product.discount}% OFF
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover rounded-xl"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Category Badge */}
        <span className="self-start px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-semibold mb-1">
          {product.category}
        </span>
        <h3 className="text-base sm:text-lg font-normal text-gray-900 mb-1 truncate">
          {product.name}
        </h3>
        <div className="flex flex-col flex-1 justify-end">
          <div className="flex-1" />
          <div className="flex items-end gap-1 ">
            <span className="text-2xl font-extrabold text-gray-900">
              {parseFloat(product.price.toFixed(3))} <span className="text-2xl font-extrabold text-gray-900 ml-1">DT</span>
            </span>
            {product.oldPrice && (
              <span className="text-sm font-medium text-gray-400 line-through">
                {parseFloat(product.oldPrice.toFixed(3))} DT
              </span>
            )}
          </div>
          <hr className="my-4 border-gray-100 w-full" />
          <div className="flex items-center">
            <button className="w-full flex items-center justify-center gap-2 bg-[#fc6f03] hover:bg-[#e56500] text-white font-semibold py-1.5 rounded-xl text-base transition-colors mt-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437m0 0L7.5 15.75A2.25 2.25 0 009.664 18h4.672a2.25 2.25 0 002.164-2.25v-.008a2.25 2.25 0 00-2.164-2.242H6.75m0 0L5.106 5.272A1.125 1.125 0 016.21 3.75h11.58a1.125 1.125 0 011.104 1.522l-1.644 4.928a2.25 2.25 0 01-2.164 1.55H8.25" />
              </svg>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
} 