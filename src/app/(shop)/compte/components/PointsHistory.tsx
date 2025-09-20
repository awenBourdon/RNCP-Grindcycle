'use client';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Clock,
  Recycle,
  ShoppingBag,
} from 'lucide-react';
import { PointsHistory, PointsType } from '@/generated/prisma';

interface PointsHistoryProps {
  pointsHistory: PointsHistory[];
  currentPoints: number;
}

const getPointsTypeIcon = (type: PointsType) => {
  switch (type) {
    case 'RECYCLING':
      return <Recycle size={16} className="text-[#0a3d3f]" />;
    case 'PURCHASE':
      return <ShoppingBag size={16} className="text-[#7f1d1d]" />;
    default:
      return <Clock size={16} className="text-gray-600" />;
  }
};

const getPointsTypeText = (type: PointsType) => {
  switch (type) {
    case 'RECYCLING':
      return 'Planche usagée envoyé';
    case 'PURCHASE':
      return 'Achat';
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
  return isPositive
    ? 'text-[#0a3d3f] bg-[#0a3d3f]/10 border-[#0a3d3f]/20'
    : 'text-[#7f1d1d] bg-[#7f1d1d]/10 border-[#7f1d1d]/20';
};

export const PointsHistoryComponent = ({
  pointsHistory,
  currentPoints,
}: PointsHistoryProps) => {
  const totalEarned = pointsHistory
    .filter(entry => entry.pointsAmount > 0)
    .reduce((sum, entry) => sum + entry.pointsAmount, 0);

  const totalSpent = Math.abs(
    pointsHistory
      .filter(entry => entry.pointsAmount < 0)
      .reduce((sum, entry) => sum + entry.pointsAmount, 0)
  );

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Coins size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Historique de mes points
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-sm font-medium text-gray-600">Points gagnés</p>
              <p className="text-2xl font-normal text-[#0a3d3f]">
                +{totalEarned}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f]/10 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-[#0a3d3f]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Points utilisés
              </p>
              <p className="text-2xl font-normal text-red-800">-{totalSpent}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <TrendingDown size={24} className="text-red-800" />
            </div>
          </div>
        </div>
      </div>

      {pointsHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <Coins size={24} className="text-[#0a3d3f]" />
          </div>
          <h3 className="text-lg font-medium text-[#010101] mb-2">
            Aucun historique de points
          </h3>
          <p className="text-gray-600">
            Commence par recycler une planche pour gagner tes premiers points !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#010101] mb-4">
            Transactions récentes ({pointsHistory.length})
          </h3>

          {pointsHistory.map(entry => {
            const isPositive = entry.pointsAmount > 0;
            const formattedDate = new Date(entry.createdAt).toLocaleDateString(
              'fr-FR',
              {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }
            );

            return (
              <div
                key={entry.id}
                className="bg-white rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full border ${getPointsTypeColor(entry.type, isPositive)}`}
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
  );
};
