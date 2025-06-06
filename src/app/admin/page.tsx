"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getSignedUploadUrl, getImageUrl } from '@/lib/s3';
import { categories } from '@/config/categories';
import Image from 'next/image';

interface Order {
  _id: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    governorate: string;
  };
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string;
  }>;
  createdAt: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  createdAt: string;
}

interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  description?: string;
}

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
  ECHOUEE: 'echouee'
};

const STATUS_LABELS = {
  [ORDER_STATUSES.EN_ATTENTE]: 'En attente',
  [ORDER_STATUSES.CONFIRMEE]: 'Confirmée',
  [ORDER_STATUSES.EN_TRAITEMENT]: 'En traitement',
  [ORDER_STATUSES.EXPEDIEE]: 'Expédiée',
  [ORDER_STATUSES.LIVREE]: 'Livrée',
  [ORDER_STATUSES.ANNULEE]: 'Annulée',
  [ORDER_STATUSES.REMBOURSEE]: 'Remboursée',
  [ORDER_STATUSES.EN_SUSPENSION]: 'En suspension',
  [ORDER_STATUSES.RETOURNEE]: 'Retournée',
  [ORDER_STATUSES.ECHOUEE]: 'Échouée'
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'products'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    stock: 0,
    category: '',
    image: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.EN_ATTENTE:
        return 'bg-yellow-100 text-yellow-800';
      case ORDER_STATUSES.CONFIRMEE:
        return 'bg-blue-100 text-blue-800';
      case ORDER_STATUSES.EN_TRAITEMENT:
        return 'bg-purple-100 text-purple-800';
      case ORDER_STATUSES.EXPEDIEE:
        return 'bg-indigo-100 text-indigo-800';
      case ORDER_STATUSES.LIVREE:
        return 'bg-green-100 text-green-800';
      case ORDER_STATUSES.ANNULEE:
        return 'bg-red-100 text-red-800';
      case ORDER_STATUSES.REMBOURSEE:
        return 'bg-gray-100 text-gray-800';
      case ORDER_STATUSES.EN_SUSPENSION:
        return 'bg-orange-100 text-orange-800';
      case ORDER_STATUSES.RETOURNEE:
        return 'bg-pink-100 text-pink-800';
      case ORDER_STATUSES.ECHOUEE:
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Update the order in the local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la commande');
      }

      // Remove the order from the local state
      setOrders(orders.filter(order => order._id !== orderId));
      toast.success('Commande supprimée avec succès');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      
      // Upload to S3 through our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileBuffer: Array.from(new Uint8Array(buffer)),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(`Failed to upload image: ${errorData.error || response.statusText}`);
      }

      const { imageUrl } = await response.json();
      setProductFormData(prev => ({ ...prev, image: imageUrl }));
      toast.success('Image téléchargée avec succès');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Erreur lors du téléchargement de l'image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct._id}`
        : '/api/admin/products';
      
      const method = selectedProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productFormData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du produit');
      }

      const updatedProduct = await response.json();
      
      if (selectedProduct) {
        setProducts(products.map(p => 
          p._id === selectedProduct._id ? updatedProduct : p
        ));
        toast.success('Produit mis à jour avec succès');
      } else {
        setProducts([updatedProduct, ...products]);
        toast.success('Produit créé avec succès');
      }

      setIsProductModalOpen(false);
      setSelectedProduct(null);
      setProductFormData({
        name: '',
        price: 0,
        stock: 0,
        category: '',
        image: '',
        description: '',
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image,
      description: '',
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du produit');
      }

      setProducts(products.filter(p => p._id !== productId));
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('Accès non autorisé');
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'admin') {
        return;
      }

      try {
        setLoading(true);
        // Fetch all data in parallel
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/users'),
          fetch('/api/admin/products'),
        ]);

        if (!ordersRes.ok) {
          throw new Error('Erreur lors de la récupération des commandes');
        }
        if (!usersRes.ok) {
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        if (!productsRes.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }

        const [ordersData, usersData, productsData] = await Promise.all([
          ordersRes.json(),
          usersRes.json(),
          productsRes.json(),
        ]);

        setOrders(ordersData);
        setUsers(usersData);
        setProducts(productsData);

        // Calculate stats
        const totalRevenue = ordersData.reduce((sum: number, order: Order) => sum + order.totalPrice, 0);
        setStats({
          totalOrders: ordersData.length,
          totalRevenue,
          totalUsers: usersData.length,
          totalProducts: productsData.length,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-12">
            <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord administrateur</h1>
            <p className="text-blue-100">Gérez vos commandes, utilisateurs et produits</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-4 ml-4 space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-[#fc6f03] text-[#fc6f03]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`${
                  activeTab === 'orders'
                    ? 'border-[#fc6f03] text-[#fc6f03]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Commandes
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-[#fc6f03] text-[#fc6f03]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Utilisateurs
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`${
                  activeTab === 'products'
                    ? 'border-[#fc6f03] text-[#fc6f03]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Produits
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-orange-100 text-[#fc6f03]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Commandes</h3>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                        <p className="text-sm text-gray-500">Total des commandes</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Revenus</h3>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalRevenue.toFixed(2)} DT</p>
                        <p className="text-sm text-gray-500">Revenus totaux</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Utilisateurs</h3>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                        <p className="text-sm text-gray-500">Utilisateurs inscrits</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Produits</h3>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                        <p className="text-sm text-gray-500">Produits en stock</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Commandes récentes</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order._id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Commande #{order._id.slice(-6)}</p>
                              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{order.totalPrice.toFixed(2)} DT</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Inventory Status */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">État des stocks</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {products
                        .filter(product => product.stock < 10)
                        .slice(0, 5)
                        .map((product) => (
                          <div key={product._id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 h-10 w-10 relative">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="rounded-md object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {product.stock === 0 ? 'Rupture de stock' : 'Stock faible'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Sales Analytics */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Analytique des ventes</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500">Commandes aujourd'hui</h4>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                          {orders.filter(order => 
                            new Date(order.createdAt).toDateString() === new Date().toDateString()
                          ).length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500">Revenus aujourd'hui</h4>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                          {orders
                            .filter(order => 
                              new Date(order.createdAt).toDateString() === new Date().toDateString()
                            )
                            .reduce((sum, order) => sum + order.totalPrice, 0)
                            .toFixed(2)} DT
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-500">Panier moyen</h4>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                          {(stats.totalRevenue / (stats.totalOrders || 1)).toFixed(2)} DT
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Toutes les commandes</h2>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <li key={order._id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                Commande #{order._id}
                              </p>
                              <div className="ml-2 flex-shrink-0">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-blue-500`}
                                >
                                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {order.totalPrice.toFixed(2)} TND
                              </p>
                              <button
                                onClick={() => handleOrderClick(order)}
                                className="p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                                title="Voir détails"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteOrder(order._id)}
                                className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                                title="Supprimer la commande"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {order.shippingAddress.fullName}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                {order.shippingAddress.email}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm text-gray-500">
                              {order.items.map((item, index) => (
                                <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                  {item.name} x{item.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                          {order.statusHistory && order.statusHistory.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs text-gray-500">
                                Dernière mise à jour: {new Date(order.statusHistory[order.statusHistory.length - 1].timestamp).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Utilisateurs</h2>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <li key={user._id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-lg font-medium text-gray-600">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {user.role}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Produits</h2>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductFormData({
                        name: '',
                        price: 0,
                        stock: 0,
                        category: '',
                        image: '',
                        description: '',
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ajouter un produit
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="h-48 w-full relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none"
                          >
                            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none"
                          >
                            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-lg font-semibold text-gray-900">
                            {product.price.toFixed(2)} TND
                          </p>
                          <p className="text-sm text-gray-500">
                            Stock: {product.stock}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Product Modal */}
                {isProductModalOpen && (
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
                      </h3>
                      <form onSubmit={handleProductSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom
                            </label>
                            <input
                              type="text"
                              value={productFormData.name}
                              onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Catégorie
                            </label>
                            <select
                              value={productFormData.category}
                              onChange={(e) => setProductFormData(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              required
                            >
                              <option value="">Sélectionner une catégorie</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prix
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={productFormData.price || ''}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  setProductFormData(prev => ({ ...prev, price: value }));
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                                min="0"
                                step="0.01"
                              />
                              <span className="absolute right-3 top-2 text-gray-500">TND</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock
                            </label>
                            <input
                              type="number"
                              value={productFormData.stock || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                setProductFormData(prev => ({ ...prev, stock: value }));
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              required
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={productFormData.description || ''}
                            onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[100px] resize-y"
                            placeholder="Décrivez votre produit..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image
                          </label>
                          <div className="mt-1 flex items-center space-x-4">
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(file);
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              accept="image/*"
                              required={!selectedProduct}
                            />
                            {productFormData.image && (
                              <div className="relative h-20 w-20">
                                <img
                                  src={productFormData.image}
                                  alt="Preview"
                                  className="h-full w-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => setProductFormData(prev => ({ ...prev, image: '' }))}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProductModalOpen(false);
                              setSelectedProduct(null);
                              setProductFormData({
                                name: '',
                                price: 0,
                                stock: 0,
                                category: '',
                                image: '',
                                description: '',
                              });
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={isUploading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                          >
                            {isUploading ? 'Téléchargement...' : selectedProduct ? 'Mettre à jour' : 'Créer'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Commande #{selectedOrder._id}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors bg-white rounded-full p-1 hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <h4 className="text-lg font-semibold text-gray-900">Informations client</h4>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Nom complet</p>
                          <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <h4 className="text-lg font-semibold text-gray-900">Adresse de livraison</h4>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Ville</p>
                            <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.city}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Code postal</p>
                            <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.postalCode}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gouvernorat</p>
                          <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.governorate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <h4 className="text-lg font-semibold text-gray-900">Statut de la commande</h4>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          <span className="text-sm font-medium">
                            {STATUS_LABELS[selectedOrder.status as keyof typeof STATUS_LABELS]}
                          </span>
                        </div>
                      </div>
                      {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500">
                            Dernière mise à jour: {new Date(selectedOrder.statusHistory[selectedOrder.statusHistory.length - 1].timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <h4 className="text-lg font-semibold text-gray-900">Articles commandés</h4>
                    </div>
                    <div className="p-4">
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">{item.price.toFixed(2)} TND</p>
                          </div>
                        ))}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-medium text-gray-900">Total</p>
                            <p className="text-xl font-bold text-gray-900">{selectedOrder.totalPrice.toFixed(2)} TND</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 