import { UserBoardsList } from "../UserBoardsList"
import type { UsedBoardStatus } from "@/generated/prisma"

interface UserBoard {
  id: string
  name: string | null
  image: string[]
  description: string | null
  createdAt: Date
  status: UsedBoardStatus
  pointsAwarded: number | null
}

interface BoardsSectionProps {
  userBoards: UserBoard[]
}

export const BoardsSection = ({ userBoards }: BoardsSectionProps) => {
  return <UserBoardsList userBoards={userBoards} />
}
