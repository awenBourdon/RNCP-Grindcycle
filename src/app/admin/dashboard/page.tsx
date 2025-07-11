import { auth } from '@/lib/auth'
import { ReturnButton } from '../../../components/ReturnButton'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  PlaceholderDeleteUserButton,
  DeleteUserButton,
} from './components/DeleteUserButton'
import { UserRoleSelect } from './components/UserRoleSelect'
import {
  Users,
  Shield,
  Mail,
  Hash,
  Package,
  Clock,
  CheckCircle,
  ShoppingBag,
  BellRing,
} from 'lucide-react'
import { UsedBoardsTable } from './components/UsedBoardsTable'
import { AddProductForm } from './components/AddProductForm'
import { ProductsTable } from './components/ProductsTable'
import { getAdminNotifications } from '@/lib/notification'
import { AdminNotifications } from './components/AdminNotifications'
import { User, Notification, UserRole } from '@/lib/types'

export default async function DashboardPage() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion')
  }

  const [users, usedBoards, products, adminNotifications] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.usedBoard.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.product.findMany({
      include: {
        usedBoard: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    getAdminNotifications(),
  ])

  const sortedUsers = users.sort((a: User, b: User) => {
    if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1
    if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1
    return 0
  })

  const totalUsers = users.length
  const totalBoards = usedBoards.length
  const pendingBoards = usedBoards.filter(
    (board) => board.status === 'PENDING_VALIDATION'
  ).length
  const receivedBoards = usedBoards.filter(
    (board) => board.status === 'RECEIVED'
  ).length
  const totalProducts = products.length
  const catalogProducts = products.filter(
    (product) => product.status === 'CATALOG'
  ).length
  const purchasedProducts = products.filter(
    (product) => product.status === 'PURCHASED'
  ).length

  const unreadAdminNotifications = adminNotifications.filter(
    (notif: Notification) => !notif.isRead
  ).length

  return (
    <div className="min-h-screen">
      <div className="px-6 py-40 container mx-auto max-w-7xl">
        <div className="mb-12">
          <ReturnButton href="/compte" label="Compte" />

          <div className="mt-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-normal text-black mb-4">
                  Dashboard Admin
                </h1>
                <p className="text-gray-600 text-lg">
                  Gestion des utilisateurs, planches et produits GRINDCYCLE
                </p>
              </div>
              {unreadAdminNotifications > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full">
                  <BellRing size={20} className="text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    {unreadAdminNotifications} nouvelle
                    {unreadAdminNotifications > 1 ? 's' : ''} notification
                    {unreadAdminNotifications > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Utilisateurs
                  </p>
                  <p className="text-2xl font-normal text-black mt-1">
                    {totalUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Planches
                  </p>
                  <p className="text-2xl font-normal text-black mt-1">
                    {totalBoards}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <Package size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Produits
                  </p>
                  <p className="text-2xl font-normal text-black mt-1">
                    {totalProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <ShoppingBag size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">À valider</p>
                  <p className="text-2xl font-normal text-black mt-1">
                    {pendingBoards}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Reçues</p>
                  <p className="text-2xl font-normal text-black mt-1">
                    {receivedBoards}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    En catalogue
                  </p>
                  <p className="text-2xl font-normal text-black mt-1">
                    {catalogProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Package size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Vendus</p>
                  <p className="text-2xl font-normal text-black mt-1">
                    {purchasedProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <ShoppingBag size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <AdminNotifications notifications={adminNotifications} />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-black">
              Liste des utilisateurs
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
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
                {sortedUsers.map((user: User) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {user.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name?.slice(0, 1).toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium text-black">
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
                        role={user.role as UserRole}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.role === 'ADMIN' || user.id === session.user.id ? (
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

        <UsedBoardsTable usedBoards={usedBoards} />
        <ProductsTable products={products} />
        <AddProductForm usedBoards={usedBoards} />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Connecté en tant que{' '}
            <span className="font-medium text-[#0a3d3f]">
              {session.user.name}
            </span>{' '}
            • <span className="font-medium">Administrateur</span>
          </p>
        </div>
      </div>
    </div>
  )
}
