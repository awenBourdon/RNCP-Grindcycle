import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Session } from '@/lib/types'
import { UsedBoardsList } from '../components/UsedBoardsList'

export default async function UsedBoardsPage() {
  const headersList = await headers()
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null

  if (!session) redirect('/authentification/connexion')

  const userBoards = await prisma.usedBoard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return <UsedBoardsList userBoards={userBoards} />
}
