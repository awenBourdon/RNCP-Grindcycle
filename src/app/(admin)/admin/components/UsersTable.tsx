'use client';
import { useState, useEffect } from 'react';
import { Users, Hash, Mail, Shield } from 'lucide-react';
import { UserRoleSelect } from './UserRoleSelect';
import {
  PlaceholderDeleteUserButton,
  DeleteUserButton,
} from './DeleteUserButton';
import { User } from '@/lib/utils/types/types';
import { useAbortController } from '@/hooks/useAbortController';
import { PaginationMeta } from '@/lib/utils/pagination';

export const UsersTable = () => {
  const { createSignal } = useAbortController();
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = async (page: number = 1) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        admin: 'true',
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/users?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement utilisateurs');
      }

      const result = await response.json();

      if (!signal.aborted) {
        if (page === 1) {
          setUsers(result.data);
        } else {
          setUsers(prev => [...prev, ...result.data]);
        }
        setMeta(result.meta);
        setCurrentPage(page);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement utilisateurs:', error);
        if (!signal.aborted) {
          setError('Impossible de charger les utilisateurs');
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const loadMoreUsers = async () => {
    if (loading || !meta.hasNextPage) return;
    await fetchUsers(currentPage + 1);
  };

  if (error) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchUsers(1)}
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
          <Users size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">
            Liste des utilisateurs
          </h2>
          {meta.totalItems > 0 && (
            <span className="ml-4 text-sm text-gray-600">
              {users.length}/{meta.totalItems} utilisateur
              {meta.totalItems !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">Chargement des utilisateurs...</div>
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
                        Nom d&apos;utilisateur
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Adresse email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Shield size={16} />
                        Rôle
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user: User) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {user.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name?.slice(0, 1).toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm font-medium text-[#010101]">
                            {user.name}
                          </span>
                          {user.role === 'ADMIN' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#0a3d3f] text-white">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <UserRoleSelect
                          userId={user.id}
                          role={user.role as 'ADMIN' | 'USER'}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.role === 'ADMIN' ? (
                          <PlaceholderDeleteUserButton />
                        ) : (
                          <DeleteUserButton userId={user.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && !loading && (
              <div className="px-6 py-12 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-gray-500">
                  Il n&apos;y a actuellement aucun utilisateur dans le système.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {meta.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreUsers}
            disabled={loading}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Chargement...'
              : `Charger plus (${users.length}/${meta.totalItems})`}
          </button>
        </div>
      )}

      {!meta.hasNextPage && users.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>Tous les utilisateurs ont été chargés</p>
        </div>
      )}
    </div>
  );
};
