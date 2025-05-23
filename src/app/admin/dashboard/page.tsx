import { auth } from "@/lib/auth";
import ReturnButton from "../../../components/ReturnButton";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlaceholderDeleteUserButton, DeleteUserButton } from "./components/DeleteUserButton";
import { UserRoleSelect } from "./components/UserRoleSelect";
import type { User, UserRole } from "@/generated/prisma";
import { Users, Shield, Mail, Hash } from "lucide-react";

const DashboardPage = async () => {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || session.user.role !== "ADMIN") redirect("/authentification/connexion")

  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
  })

  const sortedUsers = users.sort((a: { role: string }, b: { role: string }) => {
    if (a.role === "ADMIN" && b.role !== "ADMIN") return -1
    if (a.role !== "ADMIN" && b.role === "ADMIN") return 1
    return 0
  })

  const totalUsers = users.length
  const adminUsers = users.filter((user) => user.role === "ADMIN").length
  const regularUsers = users.filter((user) => user.role === "USER").length

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="px-6 py-40 container mx-auto max-w-7xl">
        <div className="mb-12">
          <ReturnButton href="/compte" label="compte" />

          <div className="mt-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-normal text-black mb-4">Dashboard Admin</h1>
            <p className="text-gray-600 text-lg">Gestion des utilisateurs GRINDCYCLE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Utilisateurs</p>
                  <p className="text-2xl font-normal text-black mt-1">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Administrateurs</p>
                  <p className="text-2xl font-normal text-black mt-1">{adminUsers}</p>
                </div>
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Utilisateurs</p>
                  <p className="text-2xl font-normal text-black mt-1">{regularUsers}</p>
                </div>
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-black">Liste des utilisateurs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f7f4]">
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
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sortedUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="text-sm font-medium text-black">{user.name}</span>
                        {user.role === "ADMIN" && (
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
                      <UserRoleSelect userId={user.id} role={user.role as UserRole} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.role === "ADMIN" || user.id === session.user.id ? (
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

          {sortedUsers.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500">Il n&apos;y a actuellement aucun utilisateur dans la base de données.</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Connecté en tant que <span className="font-medium text-[#0a3d3f]">{session.user.name}</span> •{" "}
            <span className="font-medium">Administrateur</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
