import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const notCategory = searchParams.get('notCategory');
    const exclude = searchParams.get('exclude');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // If both category and notCategory are provided, return 2 from same, 2 from others
    if (category && notCategory && exclude) {
      const sameCat = await Product.find({
        category,
        _id: { $ne: exclude },
      })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();
      const otherCat = await Product.find({
        category: { $ne: category },
        _id: { $ne: exclude },
      })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();
      return NextResponse.json([...sameCat, ...otherCat]);
    }

    // If only category is provided
    if (category) {
      const filter: any = { category };
      if (exclude) (filter as any)._id = { $ne: exclude };
      let query = Product.find(filter).sort({ createdAt: -1 });
      if (limit) query = query.limit(limit);
      const products = await query.lean();
      return NextResponse.json(products);
    }

    // If only notCategory is provided
    if (notCategory) {
      const filter: any = { category: { $ne: notCategory } };
      if (exclude) (filter as any)._id = { $ne: exclude };
      let query = Product.find(filter).sort({ createdAt: -1 });
      if (limit) query = query.limit(limit);
      const products = await query.lean();
      return NextResponse.json(products);
    }

    // Default: return all products (optionally excluding one)
    const filter: any = {};
    if (exclude) (filter as any)._id = { $ne: exclude };
    let query = Product.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(limit);
    const products = await query.lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
} 