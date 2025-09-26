import type React from 'react';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayout } from './components/AdminLayout';
import { Session } from '@/lib/types/types';

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

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  return <AdminLayout session={session}>{children}</AdminLayout>;
}
