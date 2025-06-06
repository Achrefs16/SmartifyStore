import Hero from '@/components/home/Hero';
import ProductGrid from '@/components/products/ProductGrid';

// This would typically come from your API


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
