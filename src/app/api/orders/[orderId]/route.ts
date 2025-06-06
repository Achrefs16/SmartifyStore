import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

function extractOrderId(request: Request): string | null {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orderId = pathSegments[pathSegments.length - 1];
  return orderId || null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const orderId = extractOrderId(request);
    
    if (!orderId) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // For checkout success page, allow access without authentication
    if (!session?.user?.id) {
      // Return basic order data without user information
      const orderData = {
        _id: order._id,
        items: order.items,
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
        status: order.status,
        createdAt: order.createdAt,
      };
      return NextResponse.json(orderData);
    }

    // If user is authenticated, check authorization
    const isAuthorized = 
      order.userId && 
      (order.userId.toString() === session.user.id || session.user.role === 'admin');

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Non autorisé à voir cette commande' },
        { status: 403 }
      );
    }

    // Return full order data for authenticated users
    const orderData = {
      _id: order._id,
      items: order.items,
      totalPrice: order.totalPrice,
      shippingAddress: order.shippingAddress,
      status: order.status,
      createdAt: order.createdAt,
      userId: order.userId
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const orderId = extractOrderId(request);
    if (!orderId) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Le statut est requis' },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est autorisé à modifier cette commande
    if (order.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé à modifier cette commande' },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: session.user.email,
    });

    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
} 