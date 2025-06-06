import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';

function extractProductId(request: Request): string | null {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const productId = pathSegments[pathSegments.length - 1];
  return productId || null;
}

// GET single product
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const productId = extractProductId(request);
    if (!productId) {
      return NextResponse.json({ error: 'ID de produit invalide' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
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

// PUT update product
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const productId = extractProductId(request);
    if (!productId) {
      return NextResponse.json({ error: 'ID de produit invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { name, price, stock, category, image } = body;

    if (!name || !price || !stock || !category || !image) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        price,
        stock,
        category,
        image,
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const productId = extractProductId(request);
    if (!productId) {
      return NextResponse.json({ error: 'ID de produit invalide' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
} 