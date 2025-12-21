'use client';
import { useState, useEffect, useTransition } from 'react';
import {
  Users,
  Hash,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ChevronDown,
  Recycle,
  ShoppingCart,
  AlertCircle,
  Truck,
  ImageIcon,
} from 'lucide-react';
import { ImageModal } from './ImageModal';
import { toast } from 'sonner';
import { Spinner } from '@/app/(shop)/components/Spinner';
import Image from 'next/image';
import { useImageModal } from '@/hooks/useImageModal';
import { updateUsedBoardAction } from '@/actions/used-boards/update-used-board';
import { deleteUsedBoardAction } from '@/actions/used-boards/delete-used-board';
import { useAbortController } from '@/hooks/useAbortController';
import { PaginationMeta } from '@/lib/utils/pagination';
import { UsedBoardStatus, BoardCondition } from '@/lib/utils/enums/enums';
import { UsedBoard } from '@/lib/utils/types/types';

interface UsedBoardWithUser extends UsedBoard {
  boardCondition: BoardCondition | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  product?: {
    id: string;
    name: string;
    status: string;
  } | null;
}

interface StatusSelectProps {
  boardId: string;
  currentStatus: UsedBoardStatus;
  onUpdate: () => void;
  currentPoints: number | null | undefined;
}

interface PointsSelectProps {
  boardId: string;
  currentPoints: number | null | undefined;
  currentStatus: UsedBoardStatus;
  onUpdate: () => void;
}

const StatusSelect = ({
  boardId,
  currentStatus,
  onUpdate,
}: StatusSelectProps) => {
  const [isPending, startTransition] = useTransition();

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = evt.target.value as UsedBoardStatus;
    startTransition(async () => {
      try {
        const result = await updateUsedBoardAction(boardId, newStatus);
        if (result.success) {
          toast.success(result.message || 'Statut mis à jour');
          onUpdate();
        } else {
          toast.error(result.error || 'Erreur lors de la mise à jour');
        }
      } catch {
        toast.error('Erreur lors de la mise à jour du statut');
      }
    });
  };

  const getStatusIcon = (status: UsedBoardStatus) => {
    switch (status) {
      case UsedBoardStatus.PENDING_VALIDATION:
        return <AlertCircle size={14} />;
      case UsedBoardStatus.VALIDATED:
        return <CheckCircle size={14} />;
      case UsedBoardStatus.REJECTED:
        return <XCircle size={14} />;
      case UsedBoardStatus.SENT:
        return <Truck size={14} />;
      case UsedBoardStatus.RECEIVED:
        return <CheckCircle size={14} />;
      case UsedBoardStatus.RECYCLED_TO_PRODUCT:
        return <Recycle size={14} />;
      case UsedBoardStatus.SOLD:
        return <ShoppingCart size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="relative">
        <select
          value={currentStatus}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none pl-8 pr-8 py-2 text-sm font-medium border border-gray-200 rounded-full cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a3d3f]/20 focus:border-[#0a3d3f] disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 bg-white text-[#010101]"
        >
          <option value="PENDING_VALIDATION">À valider</option>
          <option value="VALIDATED">Validé</option>
          <option value="REJECTED">Rejeté</option>
          <option value="SENT">Envoyé</option>
          <option value="RECEIVED">Reçu</option>
          <option value="RECYCLED_TO_PRODUCT">Recyclé en produit</option>
          <option value="SOLD">Vendu</option>
        </select>
        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#0a3d3f]">
          {getStatusIcon(currentStatus)}
        </div>
        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Spinner />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

const POINTS_BAREME = {
  SKATE: {
    GOOD: 80,
    AVERAGE: 60,
    BAD: 40,
  },
  CRUISER: {
    GOOD: 90,
    AVERAGE: 70,
    BAD: 50,
  },
  LONG: {
    GOOD: 100,
    AVERAGE: 80,
    BAD: 60,
  },
} as const;

interface PointsSelectProps {
  boardId: string;
  currentPoints: number | null | undefined;
  currentStatus: UsedBoardStatus;
  onUpdate: () => void;
  suggestedPoints?: number;
}

const PointsSelect = ({
  boardId,
  currentPoints,
  currentStatus,
  onUpdate,
  suggestedPoints,
}: PointsSelectProps) => {
  const [isPending, startTransition] = useTransition();

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newPoints =
      evt.target.value === '' ? undefined : Number(evt.target.value);
    startTransition(async () => {
      try {
        const result = await updateUsedBoardAction(
          boardId,
          undefined,
          newPoints
        );
        if (result.success) {
          toast.success(result.message || 'Points mis à jour');
          onUpdate();
        } else {
          toast.error(result.error || 'Erreur lors de la mise à jour');
        }
      } catch {
        toast.error('Erreur lors de la mise à jour des points');
      }
    });
  };

  const canEditPoints = currentStatus === UsedBoardStatus.RECEIVED;
  
  // Use current points if defined, otherwise use suggested points (default), otherwise empty
  const displayValue = currentPoints !== undefined && currentPoints !== null 
    ? currentPoints 
    : (suggestedPoints ?? '');

  const pointOptions = [10, 25, 40, 50, 60, 70, 75, 80, 90, 100];

  return (
    <div className="relative inline-flex items-center group">
      <div className="relative">
        <select
          value={displayValue}
          onChange={handleChange}
          disabled={isPending || !canEditPoints}
          className={`appearance-none pl-3 pr-8 py-2 text-sm font-medium border rounded-full cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a3d3f]/20 focus:border-[#0a3d3f] disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] text-[#010101] ${
            !currentPoints && suggestedPoints ? 'border-[#0a3d3f] bg-[#0a3d3f]/5' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <option value="">0 pts</option>
          {pointOptions.map((points) => (
            <option key={points} value={points}>
              {points} pts {points === suggestedPoints ? '(Recommandé)' : ''}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Spinner />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </div>
      {!canEditPoints && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          Les points ne peuvent être attribués qu&apos;aux planches reçues,
          recyclées ou vendues.
        </div>
      )}
    </div>
  );
};

export const UsedBoardsTable = () => {
  const { createSignal } = useAbortController();
  const {
    isOpen,
    images,
    boardId: modalBoardId,
    userName,
    openModal,
    closeModal,
    description,
  } = useImageModal();

  const [usedBoards, setUsedBoards] = useState<UsedBoardWithUser[]>([]);
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

  const fetchBoards = async (page: number = 1) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        admin: 'true',
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/usedboards?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement planches');
      }

      const result = await response.json();

      if (!signal.aborted) {
        if (page === 1) {
          setUsedBoards(result.data);
        } else {
          setUsedBoards(prev => [...prev, ...result.data]);
        }
        setMeta(result.meta);
        setCurrentPage(page);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement planches:', error);
        if (!signal.aborted) {
          setError('Impossible de charger les planches');
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBoards(1);
  }, []);

  const loadMoreBoards = async () => {
    if (loading || !meta.hasNextPage) return;
    await fetchBoards(currentPage + 1);
  };

  const handleUpdate = () => {
    fetchBoards(1);
    setCurrentPage(1);
  };

  const getConditionText = (condition: BoardCondition | null) => {
    if (!condition) return 'Non défini';
    switch (condition) {
      case BoardCondition.GOOD:
        return 'Bon état';
      case BoardCondition.AVERAGE:
        return 'État moyen';
      case BoardCondition.BAD:
        return 'Mauvais état';
      default:
        return condition;
    }
  };

  const handleViewImages = (board: UsedBoardWithUser) => {
    if (board.image.length > 0) {
      openModal(
        board.image,
        board.id,
        board.user?.name || '',
        board?.description ?? undefined
      );
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      const result = await deleteUsedBoardAction(boardId);
      if (result.success) {
        toast.success(result.message || 'Planche supprimée');
        handleUpdate();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (error) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchBoards(1)}
            className="px-4 py-2 bg-[#0a3d3f] text-white rounded-lg hover:bg-[#083032] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="bg-[#f8f7f4] rounded-xl p-8">
          <div className="flex items-center mb-8">
            <Package size={24} className="text-[#0a3d3f] mr-3" />
            <h2 className="text-2xl font-normal text-[#010101]">
              Planches d&apos;occasion
            </h2>
            {meta.totalItems > 0 && (
              <span className="ml-4 text-sm text-gray-600">
                {usedBoards.length}/{meta.totalItems} planche
                {meta.totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading && usedBoards.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-600">Chargement des planches...</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-2">
                          <Hash size={16} />
                          ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          Utilisateur
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        Nom
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        État
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Description
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        Images
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        Points
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usedBoards.map(board => (
                      <tr
                        key={board.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {board.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {board.user ? (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {board.user.name?.slice(0, 1).toUpperCase() ||
                                  'U'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#010101]">
                                  {board.user.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {board.user.email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">-</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-600">
                            {board.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusSelect
                            boardId={board.id}
                            currentStatus={board.status}
                            onUpdate={handleUpdate}
                            currentPoints={board.pointsAwarded}
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getConditionText(board.boardCondition)}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div
                            className="text-sm text-gray-600 truncate"
                            title={board.description || 'Aucune description'}
                          >
                            {board.description || 'Aucune description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {board.image && board.image.length > 0 && (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <Image
                                  src={board.image[0] || '/placeholder.webp'}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  width={40}
                                  height={40}
                                  onError={e => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove(
                                      'hidden'
                                    );
                                  }}
                                />
                                <div className="hidden absolute inset-0 items-center justify-center cursor-pointer">
                                  <ImageIcon
                                    size={16}
                                    className="text-gray-400"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-600">
                                {board.image?.length || 0}
                              </span>
                              {board.image && board.image.length > 0 && (
                                <button
                                  onClick={() => handleViewImages(board)}
                                  className="text-[#0a3d3f] hover:text-[#0a3d3f]/80 p-1 transition-colors cursor-pointer"
                                  title="Voir les images"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {board.user ? (
                            <PointsSelect
                              boardId={board.id}
                              currentPoints={board.pointsAwarded}
                              currentStatus={board.status}
                              onUpdate={handleUpdate}
                              suggestedPoints={
                                board.boardType && board.boardCondition
                                  ? POINTS_BAREME[board.boardType][board.boardCondition]
                                  : undefined
                              }
                            />
                          ) : (
                            <div className="text-sm text-gray-400">-</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-600">
                            {new Date(board.createdAt).toLocaleDateString(
                              'fr-FR'
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteBoard(board.id)}
                            className="text-gray-600 hover:text-[#0a3d3f] p-1 transition-colors cursor-pointer"
                            title="Supprimer la planche"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {usedBoards.length === 0 && !loading && (
                <div className="px-6 py-12 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Aucune planche trouvée
                  </h3>
                  <p className="text-gray-500">
                    Il n&apos;y a actuellement aucune planche d&apos;occasion
                    dans la base de données.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {meta.hasNextPage && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMoreBoards}
              disabled={loading}
              className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Chargement...'
                : `Charger plus (${usedBoards.length}/${meta.totalItems})`}
            </button>
          </div>
        )}

        {!meta.hasNextPage && usedBoards.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            <p>Toutes les planches ont été chargées</p>
          </div>
        )}
      </div>

      <ImageModal
        images={images}
        isOpen={isOpen}
        onClose={closeModal}
        boardId={modalBoardId}
        userName={userName}
        description={description}
      />
    </>
  );
};
