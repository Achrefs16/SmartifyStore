"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const TUNISIA_GOVERNORATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
  'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    governorate: '',
    notes: '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          totalPrice: totalPrice + 7,
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            governorate: formData.governorate,
          },
          notes: formData.notes,
          userId: session?.user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      clearCart();
      toast.success('Commande passée avec succès!', {
        duration: 4000,
        position: 'top-center',
      });
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (error: unknown) {
      console.error('Error placing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Votre panier est vide
              </h2>
              <p className="text-gray-600 mb-8">
                Ajoutez des articles à votre panier pour passer une commande.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Voir les produits
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!session && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Créez un compte pour suivre vos commandes
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    En créant un compte, vous pourrez suivre l'état de vos commandes et accéder à votre historique d'achats.
                    <Link href="/auth/register" className="font-medium underline hover:text-blue-600 ml-1">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Order Summary */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif de la commande</h1>
              
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={`${item._id}-${item.selectedColor}`} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.selectedColor && (
                        <div 
                          className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Quantité: {item.quantity}
                        {item.selectedColor && (
                          <span className="ml-2">
                            • Couleur: {item.selectedColor}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-base font-medium text-gray-900">
                      {parseFloat((item.price * item.quantity).toFixed(3))} DT
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Sous-total</p>
                  <p>{parseFloat(totalPrice.toFixed(3))} DT</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Frais de livraison</p>
                  <p>7.000 DT</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <p>Total</p>
                    <p>{parseFloat((totalPrice + 7).toFixed(3))} DT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Informations de livraison</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Entrez votre nom complet"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Entrez votre email"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{8}"
                      maxLength={8}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Entrez votre numéro de téléphone (8 chiffres)"
                    />
                    <p className="mt-1 text-sm text-gray-500">Le numéro doit contenir exactement 8 chiffres</p>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Entrez votre adresse complète"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Votre ville"
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Code postal"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-1">
                      Gouvernorat
                    </label>
                    <select
                      name="governorate"
                      id="governorate"
                      value={formData.governorate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="">Sélectionnez un gouvernorat</option>
                      {TUNISIA_GOVERNORATES.map((governorate) => (
                        <option key={governorate} value={governorate}>
                          {governorate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Ajoutez des notes pour votre commande..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      'Passer la commande'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 