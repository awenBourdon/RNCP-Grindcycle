import type React from 'react';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayout } from './components/AdminLayout';
import { Session } from '@/lib/utils/types/types';
import { UserRole } from '@/lib/utils/enums/enums';

export const metadata = {
  title: 'Dashboard Grindcycle',
};

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/authentification/connexion');
  }

  return <AdminLayout session={session}>{children}</AdminLayout>;
}
