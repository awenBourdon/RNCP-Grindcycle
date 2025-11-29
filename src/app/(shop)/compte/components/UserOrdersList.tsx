'use client';
import { useState, useEffect } from 'react';
import { type OrderWithRelations } from '@/lib/utils/types/types';
import { Package, Coins, CreditCard, Calendar, Truck } from 'lucide-react';
import Image from 'next/image';
import { useAbortController } from '@/hooks/useAbortController';
import { PaginationMeta } from '@/lib/utils/pagination';
import { BoardType, OrderStatus, PaymentType } from '@/lib/utils/enums/enums';

interface UserOrdersListProps {
  userId: string;
}

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'En attente';
    case OrderStatus.CONFIRMED:
      return 'Confirmée';
    case OrderStatus.SHIPPED:
      return 'Expédiée';
    case OrderStatus.DELIVERED:
      return 'Livrée';
    case OrderStatus.CANCELLED:
      return 'Annulée';
    default:
      return status;
  }
};

const getProductTypeText = (type: BoardType) => {
  switch (type) {
    case BoardType.SKATE:
      return 'Skateboard';
    case BoardType.CRUISER:
      return 'Cruiser';
    case BoardType.LONG:
      return 'Longboard';
    default:
      return type;
  }
};

export const UserOrdersList = ({}: UserOrdersListProps) => {
  const { createSignal } = useAbortController();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async (page: number = 1) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/orders?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Status:', response.status);
        console.error('Error details:', errorData);
        throw new Error(errorData.error || 'Erreur chargement commandes');
      }

      const result = await response.json();

      if (!signal.aborted) {
        if (page === 1) {
          setOrders(result.data);
        } else {
          setOrders(prev => [...prev, ...result.data]);
        }
        setMeta(result.meta);
        setCurrentPage(page);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement commandes:', error);
        if (!signal.aborted) {
          setError('Impossible de charger les commandes');
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMoreOrders = async () => {
    if (loading || !meta.hasNextPage) return;
    await fetchOrders(currentPage + 1);
  };

  if (error) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4" role="alert">
            {error}
          </p>
          <button
            onClick={() => fetchOrders(1)}
            className="px-4 py-2 bg-[#0a3d3f] text-white rounded-lg hover:bg-[#083032] transition-colors"
            aria-label="Réessayer de charger les commandes"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="flex items-center mb-8">
          <Package
            size={24}
            className="text-[#0a3d3f] mr-3"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-normal text-[#010101]">Mes commandes</h2>
          {meta.totalItems > 0 && (
            <span
              className="ml-4 text-sm text-gray-600"
              aria-label={`${orders.length} sur ${meta.totalItems} commande${meta.totalItems !== 1 ? 's' : ''} affichée${orders.length !== 1 ? 's' : ''}`}
            >
              {orders.length}/{meta.totalItems} commande
              {meta.totalItems !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex justify-center items-center py-20" role="status">
            <div className="text-gray-600">Chargement des commandes...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center"
              aria-hidden="true"
            >
              <Package size={24} className="text-[#0a3d3f]" />
            </div>
            <h3 className="text-lg font-medium text-[#010101] mb-2">
              Aucune commande
            </h3>
            <p className="text-gray-600">
              Tu n&apos;as pas encore passé de commande
            </p>
          </div>
        ) : (
          <div className="space-y-6" aria-label="Liste de vos commandes">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                aria-label={`Commande ${order.id.slice(0, 8)}, statut ${getStatusText(order.status)}, passée le ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`}
              >
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          Commande #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        aria-label={`Statut : ${getStatusText(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div
                        className="flex items-center gap-1"
                        aria-label={`Date de la commande : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`}
                      >
                        <Calendar size={14} aria-hidden="true" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString(
                            'fr-FR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {order.paymentType === PaymentType.POINTS ? (
                          <>
                            <Coins
                              size={14}
                              className="text-[#0a3d3f]"
                              aria-hidden="true"
                            />
                            <span
                              aria-label={`Montant payé : ${order.pointsUsed} points`}
                            >
                              {order.pointsUsed} points
                            </span>
                          </>
                        ) : (
                          <>
                            <CreditCard
                              size={14}
                              className="text-[#0a3d3f]"
                              aria-hidden="true"
                            />
                            <span
                              aria-label={`Montant payé : ${order.totalAmount.toFixed(2)}€`}
                            >
                              {order.totalAmount.toFixed(2)}€
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className="space-y-4"
                    aria-label="Articles de la commande"
                  >
                    {order.orderItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4"
                        aria-label={`Article : ${item.productName}, ${getProductTypeText(item.productType)}, ${order.paymentType === PaymentType.POINTS ? `${item.pricePoints} points` : `${item.priceEuro.toFixed(2)}€`}`}
                      >
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
                            <div
                              className="w-full h-full flex items-center justify-center"
                              aria-hidden="true"
                            >
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[#010101] truncate">
                            {item.productName}
                          </h4>
                          <p className="text-sm text-gray-500 capitalize">
                            {getProductTypeText(item.productType)}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            {order.paymentType === PaymentType.POINTS ? (
                              <span className="text-sm font-medium text-[#010101]">
                                {item.pricePoints} points
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-[#010101]">
                                {item.priceEuro.toFixed(2)}€
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
                        <Truck
                          size={16}
                          className="text-[#0a3d3f] mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-1">
                            Adresse de livraison:
                          </p>
                          <address
                            aria-label={`Adresse de livraison : ${order.shippingAddress}, ${order.shippingPostalCode} ${order.shippingCity}, ${order.shippingCountry}${order.shippingPhone ? `, Téléphone : ${order.shippingPhone}` : ''}`}
                            style={{ fontStyle: 'normal' }}
                          >
                            <p>{order.shippingAddress}</p>
                            <p>
                              {order.shippingPostalCode} {order.shippingCity}
                            </p>
                            <p>{order.shippingCountry}</p>
                            {order.shippingPhone && (
                              <p>Tél: {order.shippingPhone}</p>
                            )}
                          </address>
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

      {meta.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreOrders}
            disabled={loading}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              loading
                ? `Chargement des commandes en cours... ${orders.length} sur ${meta.totalItems} affichées`
                : `Charger plus de commandes. ${orders.length} sur ${meta.totalItems} affichées`
            }
          >
            {loading
              ? 'Chargement...'
              : `Charger plus (${orders.length}/${meta.totalItems})`}
          </button>
        </div>
      )}

      {!meta.hasNextPage && orders.length > 0 && (
        <div
          className="mt-8 text-center text-gray-600"
          role="status"
          aria-label={`Toutes les ${orders.length} commandes ont été chargées`}
        >
          <p>Toutes les commandes ont été chargées</p>
        </div>
      )}
    </div>
  );
};
