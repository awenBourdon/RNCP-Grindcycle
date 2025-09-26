'use client';
import type React from 'react';
import { usePathname } from 'next/navigation';
import { AccountSidebar } from './AccountSidebar';
import { AccountHeader } from './AccountHeader';
import { Session } from '@/lib/utils/types/types';

interface AccountLayoutProps {
  session: Session;
  userPoints: number;
  children: React.ReactNode;
}

export const AccountLayout = ({
  session,
  userPoints,
  children,
}: AccountLayoutProps) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="mb-8">
          <AccountHeader session={session} userPoints={userPoints} />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <AccountSidebar currentPath={pathname} />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
