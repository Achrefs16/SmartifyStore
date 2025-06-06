import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { authOptions } from '../../../auth/[...nextauth]/route';

function extractProductId(request: Request): string | null {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const productId = pathSegments[pathSegments.length - 1];
  return productId || null;
}

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
    console.error('Erreur lors de la récupération du produit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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

    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const productId = extractProductId(request);
    if (!productId) {
      return NextResponse.json({ error: 'ID de produit invalide' }, { status: 400 });
    }

    const updates = await request.json();

    await connectDB();

    const updated = await Product.findByIdAndUpdate(productId, updates, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
