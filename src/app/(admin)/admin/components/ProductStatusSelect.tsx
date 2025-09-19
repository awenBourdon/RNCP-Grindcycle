'use client';
import type { ProductStatus } from '@/generated/prisma';
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
} from 'lucide-react';
import { updateProductStatusAction } from '@/actions/products/update-product';

interface ProductStatusSelectProps {
  productId: string;
  status: ProductStatus;
}

export const ProductStatusSelect = ({
  productId,
  status,
}: ProductStatusSelectProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = evt.target.value as ProductStatus;

    if (newStatus === status) return;

    startTransition(async () => {
      try {
        const result = await updateProductStatusAction(productId, newStatus);

        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Une erreur s'est produite.");
      }
    });
  };

  const getStatusIcon = (productStatus: ProductStatus) => {
    switch (productStatus) {
      case 'CATALOG':
        return <Package size={14} />;
      case 'SOLD':
        return <ShoppingCart size={14} />;
      case 'SHIPPED':
        return <Truck size={14} />;
      case 'DELIVERED':
        return <CheckCircle size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const getStatusText = (productStatus: ProductStatus) => {
    switch (productStatus) {
      case 'CATALOG':
        return 'Disponible';
      case 'SOLD':
        return 'Vendu';
      case 'SHIPPED':
        return 'Expédié';
      case 'DELIVERED':
        return 'Livré';
      default:
        return productStatus;
    }
  };

  const allStatuses: ProductStatus[] = [
    'CATALOG',
    'SOLD',
    'SHIPPED',
    'DELIVERED',
  ];

  return (
    <div className="relative inline-flex items-center">
      <div className="relative">
        <select
          value={status}
          onChange={handleChange}
          className="appearance-none pl-8 pr-8 py-2 text-sm font-medium border border-gray-200 rounded-full cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 bg-white text-gray-800"
        >
          {allStatuses.map(statusOption => (
            <option key={statusOption} value={statusOption}>
              {getStatusText(statusOption)}
            </option>
          ))}
        </select>

        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-black">
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
