"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import React from 'react';

interface ColorVariation {
  color: string;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  hasColorVariations: boolean;
  colorVariations: ColorVariation[];
}

const COLOR_PALETTE = [
  { name: 'Rouge', value: '#FF0000' },
  { name: 'Bleu', value: '#0000FF' },
  { name: 'Vert', value: '#00FF00' },
  { name: 'Jaune', value: '#FFFF00' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Violet', value: '#800080' },
  { name: 'Rose', value: '#FFC0CB' },
  { name: 'Marron', value: '#A52A2A' },
  { name: 'Noir', value: '#000000' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' },
  { name: 'Beige', value: '#F5F5DC' },
];

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Produit non trouvé');
        }
        const data = await response.json();
        setProduct(data);
        setDisplayImage(data.image);
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
    if (!product) return;

    if (product.hasColorVariations && !selectedColor) {
      toast.error('Veuillez sélectionner une couleur');
      return;
    }

    const cartItem = {
      ...product,
      quantity,
      selectedColor: selectedColor || undefined,
    };

    addToCart(cartItem);
    toast.success('Produit ajouté au panier');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    if (!product.hasColorVariations) return product.stock;
    const variation = product.colorVariations.find(v => v.color === selectedColor);
    return variation?.stock || 0;
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

  const availableStock = getAvailableStock();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={displayImage}
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
            {availableStock > 0 && availableStock <= 5 && (
              <p className="mt-2 text-sm text-orange-600">
                Plus que {availableStock} en stock !
              </p>
            )}
          </div>

          {product.hasColorVariations && product.colorVariations && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">Couleurs disponibles</h3>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {product.colorVariations.map((variation) => {
                  const colorObj = COLOR_PALETTE.find(c => c.name === variation.color);
                  return (
                    <button
                      key={variation.color}
                      type="button"
                      onClick={() => handleColorSelect(variation.color)}
                      disabled={variation.stock === 0}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === variation.color
                          ? 'border-blue-500 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${variation.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: colorObj?.value || variation.color }}
                      title={`${variation.color} - Stock: ${variation.stock}`}
                    />
                  );
                })}
              </div>
              {selectedColor && (
                <p className="mt-2 text-sm text-gray-500">
                  Couleur sélectionnée: {selectedColor}
                </p>
              )}
            </div>
          )}

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
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= availableStock}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  availableStock === 0
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
                  {availableStock > 0 ? `${availableStock} unités` : 'Rupture de stock'}
                </dd>
              </div>
              {product.hasColorVariations && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Couleurs</dt>
                  <dd className="text-gray-900">
                    {product.colorVariations.length} couleurs disponibles
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 