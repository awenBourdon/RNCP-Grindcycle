import { Session } from '@/lib/types/types';

interface AdminHeaderProps {
  session: Session;
}

export const AdminHeader = ({ session }: AdminHeaderProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#010101] mb-2 sm:mb-4">
            Dashboard Admin
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Gestion des utilisateurs, planches et produits GRINDCYCLE
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-gray-500">
            Connecté en tant que{' '}
            <span className="font-medium text-[#0a3d3f]">
              {session.user.name}
            </span>
          </p>
          <p className="text-sm text-gray-500">Administrateur</p>
        </div>
      </div>
    </div>
  );
};
