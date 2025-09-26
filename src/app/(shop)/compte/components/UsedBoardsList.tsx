import Image from 'next/image';
import type { UsedBoardStatus } from '@/generated/prisma';
import {
  Clock,
  CheckCircle,
  XCircle,
  Recycle,
  ShoppingCart,
  AlertCircle,
  Truck,
  Package,
} from 'lucide-react';
import { UsedBoard } from '@/lib/types/types';

interface UsedBoardsListProps {
  usedBoards: UsedBoard[];
}

const getStatusText = (status: UsedBoardStatus) => {
  switch (status) {
    case 'PENDING_VALIDATION':
      return 'À valider';
    case 'VALIDATED':
      return 'Validé';
    case 'REJECTED':
      return 'Rejeté';
    case 'SENT':
      return 'Envoyé';
    case 'RECEIVED':
      return 'Reçu';
    case 'RECYCLED_TO_PRODUCT':
      return 'Recyclé en produit';
    case 'SOLD':
      return 'Vendu';
    default:
      return status;
  }
};

const getStatusIcon = (status: UsedBoardStatus) => {
  switch (status) {
    case 'PENDING_VALIDATION':
      return <AlertCircle size={16} />;
    case 'VALIDATED':
      return <CheckCircle size={16} />;
    case 'REJECTED':
      return <XCircle size={16} />;
    case 'SENT':
      return <Truck size={16} />;
    case 'RECEIVED':
      return <CheckCircle size={16} />;
    case 'RECYCLED_TO_PRODUCT':
      return <Recycle size={16} />;
    case 'SOLD':
      return <ShoppingCart size={16} />;
    default:
      return <Clock size={16} />;
  }
};

export const UsedBoardsList = ({ usedBoards }: UsedBoardsListProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Package size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Mes planches envoyées
        </h2>
      </div>

      {usedBoards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <Recycle size={24} className="text-[#0a3d3f]" />
          </div>
          <h3 className="text-lg font-medium text-[#010101] mb-2">
            Aucune planche envoyée
          </h3>
          <p className="text-gray-600">
            Commence par envoyer ta première planche pour lui donner une seconde
            vie !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {usedBoards.map(board => (
            <div
              key={board.id}
              className="flex items-start gap-6 p-6 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0">
                {board.image && board.image.length > 0 ? (
                  <Image
                    src={board.image[0] || '/placeholder.webp'}
                    alt={`Image planche ${board.name || board.id}`}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    priority
                  />
                ) : (
                  <div className="w-20 h-20 bg-[#f8f7f4] rounded-lg flex items-center justify-center text-[#0a3d3f]">
                    <Recycle size={20} />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-lg text-[#010101]">
                    {board.name || 'Sans nom'}
                  </h3>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#0a3d3f] text-white rounded-full text-sm font-medium">
                    {getStatusIcon(board.status)}
                    {getStatusText(board.status)}
                  </span>
                </div>

                {board.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {board.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Envoyée le{' '}
                    {new Date(board.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-[#010101] font-medium">
                    {board.pointsAwarded || 0} point
                    {(board.pointsAwarded || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-gray-600 bg-[#f8f7f4] px-3 py-2 rounded text-sm">
                    {board.status === 'PENDING_VALIDATION' &&
                      'Ta planche est en cours de validation par notre équipe'}
                    {board.status === 'VALIDATED' &&
                      "Ta planche a été validée ! Tu pourras bientôt l'expédier"}
                    {board.status === 'REJECTED' && 'Planche refusée'}
                    {board.status === 'SENT' &&
                      'Ta planche a été expédiée et est en transit'}
                    {board.status === 'RECEIVED' &&
                      'Planche reçue et validée - Points attribués'}
                    {board.status === 'RECYCLED_TO_PRODUCT' &&
                      'Ta planche a été réhabilitée et a gagné une seconde vie !'}
                    {board.status === 'SOLD' &&
                      'Ta planche a été vendue - Merci pour ta contribution !'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
