import { Users, Hash, Mail, Shield } from 'lucide-react'
import { UserRoleSelect } from './UserRoleSelect'
import {
  PlaceholderDeleteUserButton,
  DeleteUserButton,
} from './DeleteUserButton'
import { User } from '@/lib/types'

interface UsersTableProps {
  users: User[]
}

export const UsersTable = ({ users }: UsersTableProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Users size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Liste des utilisateurs
        </h2>
      </div>

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
                    <span className="text-sm text-gray-600">{user.email}</span>
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
      </div>
    </div>
  )
}
