import {
  Users,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  BellRing,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalBoards: number;
  pendingBoards: number;
  receivedBoards: number;
  totalProducts: number;
  catalogProducts: number;
  purchasedProducts: number;
  unreadNotifications: number;
}

interface DashboardStatsProps {
  stats: Stats;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="space-y-8">
      {stats.unreadNotifications > 0 && (
        <div className="bg-[#f8f7f4] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <BellRing size={24} className="text-[#0a3d3f]" />
            <div>
              <h3 className="font-medium text-[#010101]">
                Nouvelles notifications
              </h3>
              <p className="text-gray-600">
                {stats.unreadNotifications} nouvelle
                {stats.unreadNotifications > 1 ? 's' : ''} notification
                {stats.unreadNotifications > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#f8f7f4] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Utilisateurs
              </p>
              <p className="text-2xl font-normal text-[#010101] mt-1">
                {stats.totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#f8f7f4] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Planches
              </p>
              <p className="text-2xl font-normal text-[#010101] mt-1">
                {stats.totalBoards}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#f8f7f4] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Produits
              </p>
              <p className="text-2xl font-normal text-[#010101] mt-1">
                {stats.totalProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#f8f7f4] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">À valider</p>
              <p className="text-2xl font-normal text-[#010101] mt-1">
                {stats.pendingBoards}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#f8f7f4] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reçues</p>
              <p className="text-2xl font-normal text-[#010101] mt-1">
                {stats.receivedBoards}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#f8f7f4] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">En catalogue</p>
              <p className="text-2xl font-normal text-[#010101] mt-1">
                {stats.catalogProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#f8f7f4] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Vendus</p>
              <p className="text-2xl font-normal text-[#010101] mt-1">
                {stats.purchasedProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
