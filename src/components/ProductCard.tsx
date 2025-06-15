import Image from 'next/image';
import Link from 'next/link';

interface ColorVariation {
  color: string;
  stock: number;
  image?: string;
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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.hasColorVariations
    ? product.colorVariations.reduce((sum, variation) => sum + variation.stock, 0)
    : product.stock;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.hasColorVariations && (
          <div className="absolute bottom-2 right-2 flex space-x-1">
            {product.colorVariations.map((variation, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: variation.color }}
                title={`${variation.color} - Stock: ${variation.stock}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.category}</p>
        <p className="text-gray-800 font-bold mb-2">{product.price.toFixed(2)} €</p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Stock: {totalStock}
            {product.hasColorVariations && (
              <span className="text-xs text-gray-400 ml-1">
                ({product.colorVariations.length} couleurs)
              </span>
            )}
          </span>
          <Link
            href={`/products/${product._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
} 