'use client';
import { useState, useEffect } from 'react';
import {
  Coins,
  TrendingDown,
  Clock,
  Recycle,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { PointsHistory, PointsType } from '@/generated/prisma';
import { useAbortController } from '@/hooks/useAbortController';
import { PaginationMeta } from '@/lib/utils/pagination';

interface PointsHistoryProps {
  userId: string;
}

const getPointsTypeIcon = (type: PointsType) => {
  switch (type) {
    case 'RECYCLING':
      return <Recycle size={16} className="text-[#0a3d3f]" />;
    case 'PURCHASE':
      return <ShoppingBag size={16} className="text-[#7f1d1d]" />;
    case 'ADJUSTMENT_RECYCLING':
      return <RefreshCw size={16} className="text-gray-600" />;
    default:
      return <Clock size={16} className="text-gray-600" />;
  }
};

const getPointsTypeText = (type: PointsType) => {
  switch (type) {
    case 'RECYCLING':
      return 'Planche usagée envoyée';
    case 'PURCHASE':
      return 'Achat';
    case 'ADJUSTMENT_RECYCLING':
      return 'Recalcul des points';
    default:
      return type;
  }
};

const getPointsTypeColor = (type: PointsType, isPositive: boolean) => {
  if (type === 'RECYCLING') {
    return 'text-[#0a3d3f] bg-[#0a3d3f]/10 border-[#0a3d3f]/20';
  }
  if (type === 'PURCHASE') {
    return 'text-[#7f1d1d] bg-[#7f1d1d]/10 border-[#7f1d1d]/20';
  }
  if (type === 'ADJUSTMENT_RECYCLING') {
    return isPositive
      ? 'text-[#0a3d3f] bg-[#0a3d3f]/10 border-[#0a3d3f]/20'
      : 'text-[#7f1d1d] bg-[#7f1d1d]/10 border-[#7f1d1d]/20';
  }
  return isPositive
    ? 'text-[#0a3d3f] bg-[#0a3d3f]/10 border-[#0a3d3f]/20'
    : 'text-[#7f1d1d] bg-[#7f1d1d]/10 border-[#7f1d1d]/20';
};

export const PointsHistoryComponent = ({ userId }: PointsHistoryProps) => {
  const { createSignal } = useAbortController();
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
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

  const fetchUserPoints = async () => {
    try {
      const response = await fetch(`/api/users?id=${userId}`);
      if (!response.ok) throw new Error('Erreur récupération points');

      const data = await response.json();
      if (data.success) {
        setCurrentPoints(data.data.points || 0);
      }
    } catch (error) {
      console.error('Erreur fetch points:', error);
    }
  };

  const fetchPointsHistory = async (page: number = 1) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/pointshistory?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement historique');
      }

      const result = await response.json();

      if (!signal.aborted) {
        if (page === 1) {
          setPointsHistory(result.data);
        } else {
          setPointsHistory(prev => [...prev, ...result.data]);
        }
        setMeta(result.meta);
        setCurrentPage(page);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement historique:', error);
        if (!signal.aborted) {
          setError("Impossible de charger l'historique");
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUserPoints();
    fetchPointsHistory(1);
  }, []);

  const loadMoreHistory = async () => {
    if (loading || !meta.hasNextPage) return;
    await fetchPointsHistory(currentPage + 1);
  };

  const totalSpent = Math.abs(
    pointsHistory
      .filter(entry => entry.type === 'PURCHASE')
      .reduce((sum, entry) => sum + entry.pointsAmount, 0)
  );

  if (error) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchPointsHistory(1)}
            className="px-4 py-2 bg-[#0a3d3f] text-white rounded-lg hover:bg-[#083032] transition-colors"
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
          <Coins size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">
            Historique de mes points
          </h2>
          {meta.totalItems > 0 && (
            <span className="ml-4 text-sm text-gray-600">
              {pointsHistory.length}/{meta.totalItems} transaction
              {meta.totalItems !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Points actuels
                </p>
                <p className="text-2xl font-normal text-[#0a3d3f]">
                  {currentPoints}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                <Coins size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Points utilisés
                </p>
                <p className="text-2xl font-normal text-red-800">
                  -{totalSpent}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <TrendingDown size={24} className="text-red-800" />
              </div>
            </div>
          </div>
        </div>

        {loading && pointsHistory.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">
              Chargement de l&apos;historique...
            </div>
          </div>
        ) : pointsHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
              <Coins size={24} className="text-[#0a3d3f]" />
            </div>
            <h3 className="text-lg font-medium text-[#010101] mb-2">
              Aucun historique de points
            </h3>
            <p className="text-gray-600">
              Commence par recycler une planche pour gagner tes premiers points
              !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#010101] mb-4">
              Transactions récentes
            </h3>

            {pointsHistory.map(entry => {
              const isPositive = entry.pointsAmount > 0;
              const formattedDate = new Date(
                entry.createdAt
              ).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full border ${getPointsTypeColor(
                          entry.type,
                          isPositive
                        )}`}
                      >
                        {getPointsTypeIcon(entry.type)}
                      </div>

                      <div>
                        <h4 className="font-medium text-[#010101] mb-1">
                          {getPointsTypeText(entry.type)}
                        </h4>
                        <p className="text-sm text-gray-600">{formattedDate}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-medium ${
                          isPositive ? 'text-[#0a3d3f]' : 'text-red-800'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {entry.pointsAmount} point
                        {Math.abs(entry.pointsAmount) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {entry.usedBoardId && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        ID Planche: {entry.usedBoardId.slice(0, 8)}...
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {meta.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreHistory}
            disabled={loading}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Chargement...'
              : `Charger plus (${pointsHistory.length}/${meta.totalItems})`}
          </button>
        </div>
      )}

      {!meta.hasNextPage && pointsHistory.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>Tout l&apos;historique a été chargé</p>
        </div>
      )}
    </div>
  );
};
