'use client';
import {
  type OrderStatus,
  type OrderWithRelations,
  PaymentType,
} from '@/lib/types';
import { Package, Coins, CreditCard, Calendar, Truck } from 'lucide-react';
import Image from 'next/image';

interface UserOrdersListProps {
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

export const UserOrdersList = ({ orders }: UserOrdersListProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Package size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">Mes commandes</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <Package size={24} className="text-[#0a3d3f]" />
          </div>
          <h3 className="text-lg font-medium text-[#010101] mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-600">
            Vous n&apos;avez pas encore passé de commande
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Commande #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {order.paymentType === PaymentType.POINTS ? (
                        <>
                          <Coins size={14} className="text-[#0a3d3f]" />
                          <span>{order.pointsUsed} points</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={14} className="text-[#0a3d3f]" />
                          <span>{order.totalAmount.toFixed(2)}€</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {order.orderItems.map(item => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.imageUrl &&
                        item.product.imageUrl.length > 0 ? (
                          <Image
                            src={
                              item.product.imageUrl[0] || '/placeholder.webp'
                            }
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#010101] truncate">
                          {item.productName}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {item.productType.toLowerCase()}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Quantité: {item.quantity}
                          </span>
                          {order.paymentType === PaymentType.POINTS ? (
                            <span className="text-sm font-medium text-[#010101]">
                              {(item.pricePoints || 0) * item.quantity} points
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-[#010101]">
                              {(item.priceEuro * item.quantity).toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {order.shippingAddress && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <Truck size={16} className="text-[#0a3d3f] mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">
                          Adresse de livraison:
                        </p>
                        <p>{order.shippingAddress}</p>
                        <p>
                          {order.shippingPostalCode} {order.shippingCity}
                        </p>
                        <p>{order.shippingCountry}</p>
                        {order.shippingPhone && (
                          <p>Tél: {order.shippingPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
