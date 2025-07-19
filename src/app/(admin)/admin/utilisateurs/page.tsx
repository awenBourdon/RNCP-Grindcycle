import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { UsersTable } from '../components/UsersTable'
import { User } from '@/lib/types'

export default async function UsersPage() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion')
  }

  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  const sortedUsers = users.sort((a: User, b: User) => {
    if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1
    if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1
    return 0
  })

  return <UsersTable users={sortedUsers} />
}
