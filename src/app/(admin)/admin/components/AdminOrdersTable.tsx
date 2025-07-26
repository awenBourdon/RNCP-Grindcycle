'use client';

import {
  type OrderStatus,
  type OrderWithRelations,
  PaymentType,
} from '@/lib/types';
import {
  ShoppingBag,
  Hash,
  User,
  Calendar,
  Coins,
  CreditCard,
  Package,
  Eye,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface AdminOrdersTableProps {
  orders: OrderWithRelations[];
}

const getStatusText = (status: OrderStatus) => {
  const statusMap = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  };
  return statusMap[status] || status;
};

const getPaymentTypeIcon = (paymentType: PaymentType) => {
  return paymentType === PaymentType.POINTS ? (
    <Coins size={16} className="text-[#0a3d3f]" />
  ) : (
    <CreditCard size={16} className="text-[#0a3d3f]" />
  );
};

export const AdminOrdersTable = ({ orders }: AdminOrdersTableProps) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <ShoppingBag size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Gestion des commandes
        </h2>
        <span className="ml-4 text-sm text-gray-600">
          {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
        </span>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <Hash size={16} />
                    Commande
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Client
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Statut
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Paiement
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Montant
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Articles
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar size={16} />
                    Date
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {order.user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#010101]">
                            {order.user?.name || 'Anonyme'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.user?.email || 'Non connecté'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getPaymentTypeIcon(order.paymentType)}
                        <span className="text-sm text-[#010101]">
                          {order.paymentType === PaymentType.POINTS
                            ? 'Points'
                            : 'Carte'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.paymentType === PaymentType.POINTS ? (
                        <span className="text-sm font-medium text-[#010101]">
                          {order.pointsUsed} pts
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-[#010101]">
                          {order.totalAmount.toFixed(2)}€
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {order.orderItems.length} article
                        {order.orderItems.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleOrderDetails(order.id)}
                        className="text-[#0a3d3f] hover:text-[#0a3d3f]/80 p-1 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-6 bg-gray-50 border-b border-gray-200"
                      >
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-[#010101] mb-4 flex items-center gap-2">
                              <Package size={16} />
                              Articles commandés
                            </h4>
                            <div className="grid gap-4">
                              {order.orderItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-4 bg-white p-4 rounded-lg"
                                >
                                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                    {item.product.imageUrl &&
                                    item.product.imageUrl.length > 0 ? (
                                      <Image
                                        src={
                                          item.product.imageUrl[0] ||
                                          '/placeholder.webp'
                                        }
                                        alt={item.productName}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package
                                          size={20}
                                          className="text-gray-400"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium text-[#010101]">
                                      {item.productName}
                                    </h5>
                                    <p className="text-xs text-gray-500 capitalize">
                                      {item.productType.toLowerCase()}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span className="text-xs text-gray-600">
                                        Quantité: {item.quantity}
                                      </span>
                                      {order.paymentType ===
                                      PaymentType.POINTS ? (
                                        <span className="text-xs font-medium text-[#010101]">
                                          {(item.pricePoints || 0) *
                                            item.quantity}{' '}
                                          points
                                        </span>
                                      ) : (
                                        <span className="text-xs font-medium text-[#010101]">
                                          {(
                                            item.priceEuro * item.quantity
                                          ).toFixed(2)}
                                          €
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {order.shippingAddress && (
                            <div>
                              <h4 className="text-sm font-medium text-[#010101] mb-4 flex items-center gap-2">
                                <Truck size={16} />
                                Adresse de livraison
                              </h4>
                              <div className="bg-white p-4 rounded-lg">
                                <div className="text-sm text-gray-700 space-y-1">
                                  <p>{order.shippingAddress}</p>
                                  <p>
                                    {order.shippingPostalCode}{' '}
                                    {order.shippingCity}
                                  </p>
                                  <p>{order.shippingCountry}</p>
                                  {order.shippingPhone && (
                                    <p>Tél: {order.shippingPhone}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium text-[#010101] mb-4">
                              Résumé
                            </h4>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">
                                    Date de commande
                                  </p>
                                  <p className="font-medium text-[#010101]">
                                    {new Date(
                                      order.createdAt
                                    ).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Statut</p>
                                  <p className="font-medium text-[#010101]">
                                    {getStatusText(order.status)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">
                                    Mode de paiement
                                  </p>
                                  <p className="font-medium text-[#010101]">
                                    {order.paymentType === PaymentType.POINTS
                                      ? 'Points'
                                      : 'Carte bancaire'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Total</p>
                                  <p className="font-medium text-[#010101]">
                                    {order.paymentType === PaymentType.POINTS
                                      ? `${order.pointsUsed} points`
                                      : `${order.totalAmount.toFixed(2)}€`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="px-6 py-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-500">
              Il n&apos;y a actuellement aucune commande dans le système.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
