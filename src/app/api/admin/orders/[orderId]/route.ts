import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '../../../auth/[...nextauth]/route';

const ORDER_STATUSES = {
  EN_ATTENTE: 'en_attente',           // État initial lors de la commande
  CONFIRMEE: 'confirmee',             // Commande confirmée par l'admin
  EN_TRAITEMENT: 'en_traitement',     // Commande en cours de traitement
  EXPEDIEE: 'expediee',               // Commande expédiée
  LIVREE: 'livree',                   // Commande livrée
  ANNULEE: 'annulee',                 // Commande annulée
  REMBOURSEE: 'remboursee',           // Commande remboursée
  EN_SUSPENSION: 'en_suspension',     // Commande en attente temporaire
  RETOURNEE: 'retournee',             // Commande retournée
  ECHOUEE: 'echouee'                  // Paiement échoué ou autres problèmes
};

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const order = await Order.findByIdAndDelete(params.orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la commande' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status || !Object.values(ORDER_STATUSES).includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      params.orderId,
      { 
        status,
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            updatedBy: session.user.email
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
} 