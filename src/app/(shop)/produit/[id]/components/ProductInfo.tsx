import { BoardType, ProductType } from '@/lib/types';

interface ProductInfoProps {
  product: ProductType;
}

const getBoardTypeText = (type: BoardType) => {
  switch (type) {
    case 'SKATE':
      return 'Skateboard';
    case 'CRUISER':
      return 'Cruiser';
    case 'LONG':
      return 'Longboard';
    default:
      return type;
  }
};

export const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#010101] mb-4 leading-tight">
          {product.name}
        </h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center border-b border-gray-200 pb-3">
          <span className="w-24 font-medium text-[#010101]">Type :</span>
          <span className="text-gray-600">
            {getBoardTypeText(product.type)}
          </span>
        </div>
        {product.description && (
          <div className="border-b border-gray-200 pb-3">
            <span className="font-medium text-[#010101] block mb-2">
              Description :
            </span>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-[#0a3d3f]">
          <span className="text-2xl sm:text-3xl font-normal">
            {product.priceEuro.toFixed(2)} €
          </span>
        </div>
        {product.pricePoints && product.pricePoints > 0 && (
          <span className="text-sm text-gray-600 bg-[#f8f7f4] px-3 py-1 rounded-full">
            ou {product.pricePoints} points
          </span>
        )}
      </div>
    </div>
  );
};
