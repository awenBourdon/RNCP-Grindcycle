import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from './components/SignOutButton'
import { ReturnButton } from '@/components/ReturnButton'
import { UpdateUserForm } from './components/UpdateUserForm'
import { ChangePasswordForm } from './components/ChangePasswordForm'
import { User, Shield, Settings, Key } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { UserBoardsList } from './components/UserBoardsList'
import { UserNotifications } from './components/UserNotifications'

export default async function ProfilePage() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) redirect('/authentification/connexion')

  const FULL_POST_ACCESS = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        posts: ['update', 'delete'],
      },
    },
  })

  const userBoards = await prisma.usedBoard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-12">
          <ReturnButton href="/" label="Accueil" />
        </div>

        <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-normal text-black mb-2">
                  Bonjour, {session.user.name || 'Utilisateur'}
                </h1>
                <p className="text-gray-600">{session.user.email}</p>
                {session.user.role === 'ADMIN' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#0a3d3f] text-white mt-2">
                    <Shield size={14} className="mr-1" />
                    Administrateur
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
                >
                  <Shield size={16} className="mr-2" />
                  Tableau de bord
                </Link>
              )}
              <SignOutButton />
            </div>
          </div>
        </div>

        <UserNotifications userId={session.user.id} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-[#f8f7f4] rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Shield size={24} className="text-[#0a3d3f] mr-3" />
                <h2 className="text-xl font-medium text-black">Permissions</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span className="text-gray-700">Modifier mes posts</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Autorisé
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <span className="text-gray-700">Modifier tous les posts</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      FULL_POST_ACCESS.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {FULL_POST_ACCESS.success ? 'Autorisé' : 'Refusé'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8">
              <div className="flex items-center mb-6">
                <User size={24} className="text-[#0a3d3f] mr-3" />
                <h2 className="text-xl font-medium text-black">
                  Informations personnelles
                </h2>
              </div>
              <UpdateUserForm name={session.user.name || ''} />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#f8f7f4] rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Key size={24} className="text-[#0a3d3f] mr-3" />
                <h2 className="text-xl font-medium text-black">Sécurité</h2>
              </div>
              <ChangePasswordForm />
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Settings size={24} className="text-[#0a3d3f] mr-3" />
                <h2 className="text-xl font-medium text-black">
                  Informations du compte
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Rôle</span>
                  <span className="font-medium">
                    {session.user.role === 'ADMIN'
                      ? 'Administrateur'
                      : 'Utilisateur'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-medium">
                    {new Date(session.user.createdAt).toLocaleDateString(
                      'fr-FR'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UserBoardsList userBoards={userBoards} />

        <div className="mt-12 bg-[#f8f7f4] rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Settings size={20} className="text-[#0a3d3f] mr-2" />
            <h3 className="text-lg font-medium text-black">
              Données de session
            </h3>
          </div>
          <pre className="text-sm overflow-auto p-4 bg-white rounded-lg border border-gray-200 max-h-96">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
