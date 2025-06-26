"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import React from 'react';
import ProductCard from '@/components/products/ProductCard';
import Head from 'next/head';

interface ColorVariation {
  color: string;
  stock: number;
}

interface SelectedColor {
  color: string;
  quantity: number;
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
  oldPrice?: number;
  discount?: number;
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
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [displayImage, setDisplayImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);

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

  // Fetch related and other products after loading the product
  useEffect(() => {
    if (!product) return;
    const fetchSuggestions = async () => {
      try {
        // Fetch 2 from same category (excluding current)
        const relatedRes = await fetch(`/api/products?category=${encodeURIComponent(product.category)}&exclude=${product._id}&limit=2`);
        const related = relatedRes.ok ? await relatedRes.json() : [];
        setRelatedProducts(related);
        // Fetch 2 from other categories
        const otherRes = await fetch(`/api/products?notCategory=${encodeURIComponent(product.category)}&exclude=${product._id}&limit=2`);
        const other = otherRes.ok ? await otherRes.json() : [];
        setOtherProducts(other);
      } catch {}
    };
    fetchSuggestions();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.hasColorVariations && selectedColors.length === 0) {
      toast.error('Veuillez sélectionner au moins une couleur');
      return;
    }

    if (product.hasColorVariations) {
      // Add each selected color as a separate cart item
      selectedColors.forEach(({ color, quantity }) => {
        const cartItem = {
          ...product,
          quantity,
          selectedColor: color,
        };
        addToCart(cartItem);
      });
    } else {
      // For products without color variations
      const cartItem = {
        ...product,
        quantity: 1,
      };
      addToCart(cartItem);
    }
    
    toast.success('Produit(s) ajouté(s) au panier');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColors(prev => {
      const existing = prev.find(c => c.color === color);
      if (existing) {
        // Remove color if already selected
        return prev.filter(c => c.color !== color);
      } else {
        // Add new color with quantity 1
        return [...prev, { color, quantity: 1 }];
      }
    });
  };

  const updateColorQuantity = (color: string, newQuantity: number) => {
    setSelectedColors(prev => 
      prev.map(c => c.color === color ? { ...c, quantity: newQuantity } : c)
    );
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

  const uniqueProducts = [...relatedProducts, ...otherProducts].filter(
    (p, idx, arr) => arr.findIndex(x => x._id === p._id) === idx
  );

  // SEO meta tags and JSON-LD
  const productUrl = `https://smartify-store.vercel.app/products/${product._id}`;
  const productImage = product.image.startsWith('http') ? product.image : `https://smartify-store.vercel.app${product.image}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [productImage],
    description: product.description,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'Smartify Store'
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'TND',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Smartify Store'
      }
    },
    category: product.category
  };

  return (
    <>
      <Head>
        <title>{`${product.name} | Smartify Store Tunisie`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | Smartify Store Tunisie`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={productImage} />
        <meta property="og:url" content={productUrl} />
        <link rel="canonical" href={productUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      </Head>
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

            <div className="mb-6 flex items-center gap-3 flex-wrap">
              {product.discount && (
                <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
              <span className="text-3xl font-bold text-gray-900">
                {parseFloat(product.price.toFixed(2))} DT
              </span>
              {product.oldPrice && (
                <span className="text-lg font-medium text-gray-400 line-through">
                  {parseFloat(product.oldPrice.toFixed(2))} DT
                </span>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
            {product.hasColorVariations && product.colorVariations && (
              <div className=" mb-8 mt-4">
                <h3 className="text-sm font-medium text-gray-900">Couleurs disponibles</h3>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {product.colorVariations.map((variation) => {
                    const colorObj = COLOR_PALETTE.find(c => c.name === variation.color);
                    const isSelected = selectedColors.some(c => c.color === variation.color);
                    return (
                      <div key={variation.color} className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleColorSelect(variation.color)}
                          disabled={variation.stock === 0}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 scale-110'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${variation.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ backgroundColor: colorObj?.value || variation.color }}
                          title={`${variation.color} - Stock: ${variation.stock}`}
                        />
                        {isSelected && (
                          <div className="flex flex-col items-center gap-1 w-full">
                            <span className="text-xs text-gray-500">{variation.color}</span>
                            <div className="flex items-center justify-center w-full border border-gray-300 rounded-lg">
                              <button
                                onClick={() => {
                                  const currentQuantity = selectedColors.find(c => c.color === variation.color)?.quantity || 1;
                                  updateColorQuantity(variation.color, Math.max(1, currentQuantity - 1));
                                }}
                                className="w-10 h-10 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                              >
                                <span className="text-lg font-medium">−</span>
                              </button>
                              <span className="px-3 py-1.5 text-gray-900 min-w-[2.5rem] text-center">
                                {selectedColors.find(c => c.color === variation.color)?.quantity || 1}
                              </span>
                              <button
                                onClick={() => {
                                  const currentQuantity = selectedColors.find(c => c.color === variation.color)?.quantity || 1;
                                  updateColorQuantity(variation.color, Math.min(variation.stock, currentQuantity + 1));
                                }}
                                className="w-10 h-10 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                              >
                                <span className="text-lg font-medium">+</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedColors.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedColors.length} couleur(s) sélectionnée(s)
                  </p>
                )}
              </div>
            )}
            <div className="mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.hasColorVariations ? selectedColors.length === 0 : product.stock === 0}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  (product.hasColorVariations ? selectedColors.length === 0 : product.stock === 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#fc6f03] hover:bg-[#e56500]'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Ajouter au panier
              </button>
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

            {uniqueProducts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Vous pourriez aimer</h2>
                <div className="flex gap-6 overflow-x-auto pb-2">
                  {uniqueProducts.map((p) => (
                    <div key={p._id} className="w-56 flex-shrink-0">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 