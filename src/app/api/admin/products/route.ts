import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';

// GET all products
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received product data:', body);
    
    const { name, price, stock, category, image, description, hasColorVariations, colorVariations, oldPrice, discount } = body;

    // Validate all required fields
    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    if (price === undefined || price === null) {
      return NextResponse.json({ error: 'Le prix est requis' }, { status: 400 });
    }
    if (stock === undefined || stock === null) {
      return NextResponse.json({ error: 'Le stock est requis' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'La catégorie est requise' }, { status: 400 });
    }
    if (!image) {
      return NextResponse.json({ error: 'L\'image est requise' }, { status: 400 });
    }

    // Convert numeric values
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (isNaN(numericPrice)) {
      return NextResponse.json({ error: 'Le prix doit être un nombre' }, { status: 400 });
    }
    if (isNaN(numericStock)) {
      return NextResponse.json({ error: 'Le stock doit être un nombre' }, { status: 400 });
    }

    await connectDB();
    
    const productData = {
      name,
      description: description || '',
      price: numericPrice,
      stock: numericStock,
      category,
      image,
      hasColorVariations: hasColorVariations || false,
      colorVariations: colorVariations || [],
      isActive: true,
      oldPrice,
      discount,
    };

    console.log('Creating product with data:', productData);

    const product = await Product.create(productData);
    console.log('Product created successfully:', product);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id, name, price, stock, category, image, description, hasColorVariations, colorVariations, oldPrice, discount } = body;

    if (!_id) {
      return NextResponse.json({ error: 'ID du produit requis' }, { status: 400 });
    }

    await connectDB();

    const productData = {
      name,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      category,
      image,
      hasColorVariations: hasColorVariations || false,
      colorVariations: colorVariations || [],
      oldPrice,
      discount,
    };

    const product = await Product.findByIdAndUpdate(
      _id,
      { $set: productData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
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