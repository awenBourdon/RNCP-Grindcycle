import type React from 'react';
import { auth } from '@/lib/auth';
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

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  let userPoints = 0;

  try {
    const response = await fetch(`${baseUrl}/api/users?id=${session.user.id}`, {
      headers: {
        ...Object.fromEntries(headersList.entries()),
      },
      cache: 'default',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        userPoints = data.data.points || 0;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des points:', error);
  }

  return (
    <AccountLayout session={session} userPoints={userPoints}>
      {children}
    </AccountLayout>
  );
}
