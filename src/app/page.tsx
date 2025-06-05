import Hero from '@/components/home/Hero';
import ProductGrid from '@/components/products/ProductGrid';

// This would typically come from your API
const featuredProducts = [
  {
    id: '1',
    name: 'Montre Connectée Pro',
    price: 199.99,
    image: '/images/products/smartwatch.jpg',
    category: 'Accessoires Tech',
  },
  {
    id: '2',
    name: 'Enceinte Bluetooth Premium',
    price: 149.99,
    image: '/images/products/speaker.jpg',
    category: 'Accessoires Tech',
  },
  {
    id: '3',
    name: 'Lampe Connectée',
    price: 79.99,
    image: '/images/products/smartlight.jpg',
    category: 'Accessoires Maison',
  },
  {
    id: '4',
    name: 'Tracker d\'activité',
    price: 89.99,
    image: '/images/products/fitnesstracker.jpg',
    category: 'Accessoires Bien-être',
  },
];

export default function Home() {
  return (
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
        <ProductGrid />
      </div>
    </div>
  );
}
