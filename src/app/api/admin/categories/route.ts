import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { authOptions } from '@/lib/auth';

// GET: List all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des catégories' }, { status: 500 });
  }
}

// POST: Add a new category (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nom de catégorie requis' }, { status: 400 });
    }
    await connectDB();
    // Prevent duplicates
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: 'Cette catégorie existe déjà' }, { status: 409 });
    }
    const category = await Category.create({ name: name.trim() });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la catégorie' }, { status: 500 });
  }
} 