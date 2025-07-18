import Link from "next/link"
import { Shield } from "lucide-react"
import { SignOutButton } from "./SignOutButton"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

interface Session {
  user: User
}

interface AccountHeaderProps {
  session: Session
}

export const AccountHeader = ({ session }: AccountHeaderProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-normal text-[#010101] mb-2">Bonjour, {session.user.name || "Utilisateur"}</h1>
            <p className="text-gray-600">{session.user.email}</p>
            {session.user.role === "ADMIN" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#0a3d3f] text-white mt-2">
                <Shield size={14} className="mr-1" />
                Administrateur
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {session.user.role === "ADMIN" && (
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
  )
}
