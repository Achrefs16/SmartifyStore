"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { items, totalPrice, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Votre panier est vide
          </h1>
          <p className="text-gray-600 mb-8">
            Découvrez nos produits et commencez vos achats.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#fc6f03] hover:bg-[#e56500]"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panier</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item._id}-${item.selectedColor || 'default'}`}
                className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                  {item.selectedColor && (
                    <div
                      className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.selectedColor }}
                      title={item.selectedColor}
                    />
                  )}
                </div>

                <div className="flex-grow">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    {parseFloat(item.price.toFixed(3))} DT
                  </p>
                  {item.selectedColor && (
                    <p className="text-sm text-gray-500">
                      Couleur: {item.selectedColor}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1, item.selectedColor)}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 text-gray-600 hover:bg-gray-100 text-sm sm:text-base"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-gray-900 text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedColor)}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 text-gray-600 hover:bg-gray-100 text-sm sm:text-base"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id, item.selectedColor)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Résumé de la commande
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{parseFloat(totalPrice.toFixed(3))} DT</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span>7.000 DT</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-medium text-gray-900">
                  <span>Total</span>
                  <span>{parseFloat((totalPrice + 7).toFixed(3))} DT</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full mt-6 bg-[#fc6f03] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#e56500] disabled:bg-[#fc6f03]/50"
            >
              {isCheckingOut ? 'Redirection...' : 'Passer la commande'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 