import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { UsedBoardsTable } from '../components/UsedBoardsTable'

export default async function UsedBoardsPage() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion')
  }

  const usedBoards = await prisma.usedBoard.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return <UsedBoardsTable usedBoards={usedBoards} />
}
