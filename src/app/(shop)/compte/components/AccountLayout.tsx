"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { ReturnButton } from "@/components/ui/ReturnButton"
import { AccountSidebar } from "./AccountSidebar"
import { AccountHeader } from "./AccountHeader"

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

interface AccountLayoutProps {
  session: Session
  children: React.ReactNode
}

export const AccountLayout = ({ session, children }: AccountLayoutProps) => {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <ReturnButton href="/" label="Accueil" />
        </div>

        <AccountHeader session={session} />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="lg:w-80 flex-shrink-0">
            <AccountSidebar currentPath={pathname} />
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
