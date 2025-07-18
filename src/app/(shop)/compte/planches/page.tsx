import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BoardsSection } from "../components/sections/BoardsSection"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

interface Session {
  user: User
}

export default async function PlanchesPage() {
  const headersList = await headers()
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null

  if (!session) redirect("/authentification/connexion")

  const userBoards = await prisma.usedBoard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return <BoardsSection userBoards={userBoards} />
}
