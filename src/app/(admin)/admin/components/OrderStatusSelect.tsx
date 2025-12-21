'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  ChevronDown,
  Package,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { updateOrderStatusAction } from '@/actions/orders/update-order';
import { OrderStatus } from '@/lib/utils/enums/enums';

interface OrderStatusSelectProps {
  orderId: string;
  status: OrderStatus;
}

export const OrderStatusSelect = ({
  orderId,
  status,
}: OrderStatusSelectProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = evt.target.value as OrderStatus;

    if (newStatus === status) return;

    startTransition(async () => {
      try {
        const result = await updateOrderStatusAction(orderId, newStatus);

        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Une erreur s'est produite lors de la mise à jour.");
      }
    });
  };

  const getStatusIcon = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case OrderStatus.PENDING:
        return <Clock size={14} />;
      case OrderStatus.CONFIRMED:
        return <CheckCircle size={14} />;
      case OrderStatus.SHIPPED:
        return <Truck size={14} />;
      case OrderStatus.DELIVERED:
        return <Package size={14} />;
      case OrderStatus.CANCELLED:
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusText = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
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
        return orderStatus;
    }
  };

  const allStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  return (
    <div className="relative inline-flex items-center">
      <div className="relative">
        <select
          value={status}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none pl-8 pr-8 py-1.5 text-xs font-medium border border-gray-200 rounded-full cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a3d3f]/20 focus:border-[#0a3d3f] hover:border-gray-300 bg-white text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {allStatuses.map(statusOption => (
            <option key={statusOption} value={statusOption}>
              {getStatusText(statusOption)}
            </option>
          ))}
        </select>

        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
          {getStatusIcon(status)}
        </div>

        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};
