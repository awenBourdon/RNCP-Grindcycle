'use client'
import { useState } from 'react'
import { ReturnButton } from '@/components/ui/ReturnButton'
import { AccountSidebar } from './AccountSidebar'
import { AccountHeader } from './AccountHeader'
import { ProfileSection } from './sections/ProfileSection'
import { SecuritySection } from './sections/SecuritySection'
import { PermissionsSection } from './sections/PermissionsSection'
import { AccountInfoSection } from './sections/AccountInfoSection'
import { BoardsSection } from './sections/BoardsSection'
import { NotificationsSection } from './sections/NotificationsSection'

interface AccountPageLayoutProps {
  session: any
  userBoards: any[]
  fullPostAccess: boolean
}

export const AccountPageLayout = ({
  session,
  userBoards,
  fullPostAccess,
}: AccountPageLayoutProps) => {
  const [activeSection, setActiveSection] = useState('profile')

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection name={session.user.name || ''} />
      case 'security':
        return <SecuritySection />
      case 'permissions':
        return <PermissionsSection fullPostAccess={fullPostAccess} />
      case 'account':
        return <AccountInfoSection session={session} />
      case 'boards':
        return <BoardsSection userBoards={userBoards} />
      case 'notifications':
        return <NotificationsSection userId={session.user.id} />
      default:
        return <ProfileSection name={session.user.name || ''} />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <ReturnButton href="/" label="Accueil" />
        </div>

        <AccountHeader session={session} />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="lg:w-80 flex-shrink-0">
            <AccountSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          <div className="flex-1">{renderSection()}</div>
        </div>
      </div>
    </div>
  )
}
