import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log

    if (!session?.user?.id) {
      console.log('No session or user ID found'); // Debug log
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body); // Debug log

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

    console.log('Creating order with userId:', session.user.id); // Debug log

    const order = await Order.create({
      userId: session.user.id,
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
      paymentMethod: 'cash', // Default to cash payment
      status: 'en_attente', // Changed from paymentStatus to status
    });

    return NextResponse.json({
      message: 'Commande créée avec succès',
      orderId: order._id,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log

    if (!session?.user?.id) {
      console.log('No session or user ID found'); // Debug log
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