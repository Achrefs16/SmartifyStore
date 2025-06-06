import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

function extractProductId(request: Request): string | null {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const productId = pathSegments[pathSegments.length - 1];
  return productId || null;
}

export async function GET(request: Request) {
  try {
    const productId = extractProductId(request);
    if (!productId) {
      return NextResponse.json({ error: 'ID de produit invalide' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    );
  }
} 