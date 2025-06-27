import Image from 'next/image'
import { UsedBoardStatus } from '@/generated/prisma'

interface UserBoard {
  id: string
  name: string | null
  image: string[]
  description: string | null
  createdAt: Date
  status: UsedBoardStatus
  pointsAwarded: number | null
}

interface UserBoardsListProps {
  userBoards: UserBoard[]
}

const getStatusText = (status: UsedBoardStatus) => {
  switch (status) {
    case 'SENT':
      return 'Envoyé'
    case 'RECEIVED':
      return 'Reçu'
    case 'REJECTED':
      return 'Rejeté'
    default:
      return status
  }
}

export const UserBoardsList = ({ userBoards }: UserBoardsListProps) => {
  return (
    <div className="mt-12 bg-[#f8f7f4] rounded-xl p-8">
      <h2 className="text-2xl font-semibold mb-6">Mes planches envoyées</h2>
      {userBoards.length === 0 ? (
        <p>Aucune planche envoyée pour le moment.</p>
      ) : (
        <ul className="space-y-6">
          {userBoards.map((board) => (
            <li
              key={board.id}
              className="flex items-center gap-6 p-4 bg-white rounded shadow"
            >
              {board.image && board.image.length > 0 ? (
                <Image
                  src={board.image[0]}
                  alt={`Image planche ${board.id}`}
                  width={96}
                  height={96}
                  className="rounded object-cover"
                  priority
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  Pas d&apos;image
                </div>
              )}
              <div>
                <p className="font-medium text-lg">
                  {board.name || 'Sans nom'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Envoyée le{' '}
                  {new Date(board.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
                <span>{getStatusText(board.status)}</span>
                <p className="mt-1 text-sm font-medium text-green-700">
                  Points : {board.pointsAwarded ?? 0}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
