"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import React from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Produit non trouvé');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Produit non trouvé'}
          </h2>
          <p className="text-gray-600">
            Désolé, nous n&apos;avons pas pu charger les détails du produit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            {isFavorite ? (
              <HeartIconSolid className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="mt-8 lg:mt-0 lg:pl-8">
          <div className="mb-4">
            <span className="text-sm text-gray-500">{product.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {product.name}
            </h1>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {parseFloat(product.price.toFixed(2))} DT
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <p className="mt-2 text-sm text-orange-600">
                Plus que {product.stock} en stock !
              </p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#fc6f03] hover:bg-[#e56500]'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Ajouter au panier
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Détails du produit
            </h2>
            <dl className="grid grid-cols-1 gap-4">
              <div className="flex justify-between">
                <dt className="text-gray-600">Catégorie</dt>
                <dd className="text-gray-900">{product.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Stock</dt>
                <dd className="text-gray-900">
                  {product.stock > 0 ? `${product.stock} unités` : 'Rupture de stock'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 