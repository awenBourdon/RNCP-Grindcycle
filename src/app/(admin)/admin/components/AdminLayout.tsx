'use client';
import type React from 'react';
import { usePathname } from 'next/navigation';
import { ReturnButton } from '@/components/ui/ReturnButton';
import { AdminNavbar } from './AdminNavbar';
import { AdminHeader } from './AdminHeader';
import { Session } from '@/lib/types';

interface AdminLayoutProps {
  session: Session;
  children: React.ReactNode;
}

export const AdminLayout = ({ session, children }: AdminLayoutProps) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <ReturnButton href="/compte/profil" label="Retourner sur le site" />
        </div>

        <AdminHeader session={session} />

        <div className="mt-6 sm:mt-8">
          <AdminNavbar currentPath={pathname} />
        </div>

        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </div>
  );
};
