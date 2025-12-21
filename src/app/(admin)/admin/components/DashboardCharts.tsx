'use client';

import { BarChart3, PieChart } from 'lucide-react';
import { Product, UsedBoard, User } from '@/lib/utils/types/types';
import { ProductStatus } from '@/lib/utils/enums/enums';
import { useMemo } from 'react';

interface DashboardChartsProps {
  products: Product[];
  users: User[];
  usedBoards: UsedBoard[];
}

export const DashboardCharts = ({
  products,
  users,
  usedBoards,
}: DashboardChartsProps) => {
  const productStats = useMemo(() => {
    const total = products.length;
    const catalog = products.filter(
      p => p.status === ProductStatus.CATALOG
    ).length;
    const sold = products.filter(p => p.status === ProductStatus.SOLD).length;

    const catalogPercent = total > 0 ? (catalog / total) * 100 : 0;
    const soldPercent = total > 0 ? (sold / total) * 100 : 0;

    return { catalog, sold, catalogPercent, soldPercent };
  }, [products]);

  const userGrowthStats = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const stats = last7Days.map(date => {
      const dayUsers = users.filter(
        u => u.createdAt && new Date(u.createdAt).toISOString().startsWith(date)
      ).length;
      return { date, count: dayUsers };
    });

    const maxCount = Math.max(...stats.map(s => s.count), 1);

    return { data: stats, maxCount };
  }, [users]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-[#f8f7f4] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="text-[#0a3d3f]" size={20} />
          <h3 className="font-medium text-[#010101]">
            Répartition des Produits
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">En Catalogue</span>
              <span className="font-medium">
                {productStats.catalog} (
                {Math.round(productStats.catalogPercent)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#0a3d3f] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${productStats.catalogPercent}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Vendus</span>
              <span className="font-medium">
                {productStats.sold} ({Math.round(productStats.soldPercent)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#0a3d3f] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${productStats.soldPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100 text-sm text-gray-500">
            Total de {products.length} produits enregistrés.
          </div>
        </div>
      </div>

      <div className="bg-[#f8f7f4] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-[#0a3d3f]" size={20} />
          <h3 className="font-medium text-[#010101]">
            Inscriptions (7 derniers jours)
          </h3>
        </div>

        <div className="flex items-end justify-between h-40 gap-2">
          {userGrowthStats.data.map((stat, i) => (
            <div
              key={stat.date}
              className="flex flex-col items-center flex-1 group"
            >
              <div className="relative w-full flex justify-end flex-col items-center h-full">
                <div className="absolute -top-8 bg-[#0a3d3f] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {stat.count} utilisateurs
                </div>

                <div
                  className="w-full max-w-[30px] bg-[#0a3d3f]/80 hover:bg-[#0a3d3f] rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${(stat.count / userGrowthStats.maxCount) * 100}%`,
                    minHeight: stat.count > 0 ? '4px' : '2px',
                    opacity: stat.count === 0 ? 0.3 : 1,
                  }}
                ></div>
              </div>
              <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">
                {new Date(stat.date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
