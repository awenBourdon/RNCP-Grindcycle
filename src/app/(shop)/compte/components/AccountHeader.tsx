import Link from 'next/link';
import { Shield } from 'lucide-react';
import { SignOutButton } from './SignOutButton';
import { Session } from '@/lib/utils/types/types';

interface AccountHeaderProps {
  session: Session;
  userPoints: number;
}

export const AccountHeader = ({ session, userPoints }: AccountHeaderProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl mt-12 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-xl font-bold">
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-normal text-[#010101] mb-1">
              Bonjour, {session.user.name || 'Utilisateur'}
            </h1>
            <p className="text-gray-600 text-sm mb-2">{session.user.email}</p>

            <p className="text-[#0a3d3f] font-medium text-sm mb-2">
              Tu as actuellement {userPoints}{' '}
              {userPoints === 1 ? 'point' : 'points'} disponible
              {userPoints === 1 ? '' : 's'}
            </p>

            {session.user.role === 'ADMIN' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#0a3d3f] text-white">
                <Shield size={12} className="mr-1" />
                Administrateur
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {session.user.role === 'ADMIN' && (
            <Link
              href="/admin/tableau-de-bord"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-2 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
            >
              <Shield size={14} className="mr-2" />
              Tableau de bord
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
};
