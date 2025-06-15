import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Order from '@/models/Order';
import connectDB from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'items',
      'totalPrice',
      'shippingAddress',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: 'Le panier est vide' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of body.items) {
      if (!item.name || !item.price || !item.quantity) {
        return NextResponse.json(
          { message: 'Informations de produit invalides' },
          { status: 400 }
        );
      }
    }

    // Validate shipping address
    const requiredAddressFields = [
      'fullName',
      'email',
      'phone',
      'address',
      'city',
      'postalCode',
      'governorate',
    ];

    for (const field of requiredAddressFields) {
      if (!body.shippingAddress[field]) {
        return NextResponse.json(
          { message: `L'adresse de livraison est incomplète` },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const orderData = {
      userId: session?.user?.id || null,
      items: body.items.map((item: any) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
      })),
      totalPrice: body.totalPrice,
      shippingAddress: body.shippingAddress,
      status: 'en_attente',
      statusHistory: [
        {
          status: 'en_attente',
          timestamp: new Date(),
          updatedBy: session?.user?.id || 'system',
        },
      ],
    };

    const order = await Order.create(orderData);

    return NextResponse.json(
      { message: 'Commande créée avec succès', orderId: order._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
} 