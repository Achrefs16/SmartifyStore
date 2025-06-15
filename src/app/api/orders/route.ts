import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      items,
      totalPrice,
      fullName,
      email,
      phone,
      address,
      city,
      postalCode,
      governorate,
      notes,
    } = body;

    if (!items || !totalPrice || !fullName || !email || !phone || !address || !city || !postalCode || !governorate) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create order data object
    const orderData = {
      items,
      totalPrice,
      shippingAddress: {
        fullName,
        email,
        phone,
        address,
        city,
        postalCode,
        governorate,
      },
      notes,
      paymentMethod: 'cash',
      status: 'en_attente',
    };

    // Only add userId if user is authenticated
    if (session?.user?.id) {
      Object.assign(orderData, { userId: session.user.id });
    }

    const order = await Order.create(orderData);

    return NextResponse.json({
      message: 'Commande créée avec succès',
      orderId: order._id,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Erreur de validation des données' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 