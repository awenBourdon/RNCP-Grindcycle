import type React from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AccountLayout } from './components/AccountLayout'
import { Session } from '@/lib/types'

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null

  if (!session) redirect('/authentification/connexion')

  return <AccountLayout session={session}>{children}</AccountLayout>
}
