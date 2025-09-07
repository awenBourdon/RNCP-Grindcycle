import type React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountLayout } from './components/AccountLayout';
import { Session } from '@/lib/types';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session) redirect('/authentification/connexion');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true },
  });

  const userPoints = user?.points || 0;

  return (
    <AccountLayout session={session} userPoints={userPoints}>
      {children}
    </AccountLayout>
  );
}
