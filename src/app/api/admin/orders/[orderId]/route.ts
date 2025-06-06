import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '../../../auth/[...nextauth]/route';

const ORDER_STATUSES = {
  EN_ATTENTE: 'en_attente',
  CONFIRMEE: 'confirmee',
  EN_TRAITEMENT: 'en_traitement',
  EXPEDIEE: 'expediee',
  LIVREE: 'livree',
  ANNULEE: 'annulee',
  REMBOURSEE: 'remboursee',
  EN_SUSPENSION: 'en_suspension',
  RETOURNEE: 'retournee',
  ECHOUEE: 'echouee',
};

function extractOrderId(request: Request): string | null {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const orderId = pathSegments[pathSegments.length - 1];
  return orderId || null;
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const orderId = extractOrderId(request);
    if (!orderId) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la commande' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const orderId = extractOrderId(request);
    if (!orderId) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }

    const { status } = await request.json();

    if (!status || !Object.values(ORDER_STATUSES).includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            updatedBy: session.user.email,
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la commande' }, { status: 500 });
  }
}
