import Image from 'next/image'
import { UsedBoardStatus } from '@/generated/prisma'
import {
  Clock,
  CheckCircle,
  XCircle,
  Recycle,
  ShoppingCart,
  AlertCircle,
  Truck,
} from 'lucide-react'

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
    case 'PENDING_VALIDATION':
      return 'À valider'
    case 'VALIDATED':
      return 'Validé'
    case 'REJECTED':
      return 'Rejeté'
    case 'SENT':
      return 'Envoyé'
    case 'RECEIVED':
      return 'Reçu'
    case 'RECYCLED_TO_PRODUCT':
      return 'Recyclé en produit'
    case 'SOLD':
      return 'Vendu'
    default:
      return status
  }
}

const getStatusColor = (status: UsedBoardStatus) => {
  switch (status) {
    case 'PENDING_VALIDATION':
      return 'text-orange-700 bg-orange-50 border-orange-200'
    case 'VALIDATED':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'REJECTED':
      return 'text-red-700 bg-red-50 border-red-200'
    case 'SENT':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'RECEIVED':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'RECYCLED_TO_PRODUCT':
      return 'text-purple-700 bg-purple-50 border-purple-200'
    case 'SOLD':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200'
  }
}

const getStatusIcon = (status: UsedBoardStatus) => {
  switch (status) {
    case 'PENDING_VALIDATION':
      return <AlertCircle size={16} />
    case 'VALIDATED':
      return <CheckCircle size={16} />
    case 'REJECTED':
      return <XCircle size={16} />
    case 'SENT':
      return <Truck size={16} />
    case 'RECEIVED':
      return <CheckCircle size={16} />
    case 'RECYCLED_TO_PRODUCT':
      return <Recycle size={16} />
    case 'SOLD':
      return <ShoppingCart size={16} />
    default:
      return <Clock size={16} />
  }
}

const getPointsColor = (points: number | null, status: UsedBoardStatus) => {
  if (
    ['PENDING_VALIDATION', 'VALIDATED', 'REJECTED', 'SENT'].includes(status)
  ) {
    return 'text-gray-500'
  }

  if (!points || points === 0) return 'text-gray-500'
  if (points >= 50) return 'text-green-700'
  if (points >= 25) return 'text-orange-700'
  return 'text-blue-700'
}

export const UserBoardsList = ({ userBoards }: UserBoardsListProps) => {
  return (
    <div className="mt-12 bg-[#f8f7f4] rounded-xl p-8">
      <h2 className="text-2xl font-semibold mb-6">Mes planches envoyées</h2>
      {userBoards.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Recycle size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-600">
            Aucune planche envoyée pour le moment.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Commence par envoyer ta première planche !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {userBoards.map((board) => (
            <div
              key={board.id}
              className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                {board.image && board.image.length > 0 ? (
                  <Image
                    src={board.image[0]}
                    alt={`Image planche ${board.name || board.id}`}
                    width={96}
                    height={96}
                    className="rounded-lg object-cover"
                    priority
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Recycle size={24} />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {board.name || 'Sans nom'}
                  </h3>

                  <span
                    className={`
                    inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border
                    ${getStatusColor(board.status)}
                  `}
                  >
                    {getStatusIcon(board.status)}
                    {getStatusText(board.status)}
                  </span>
                </div>

                {board.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {board.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Envoyée le{' '}
                    {new Date(board.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>

                  <div
                    className={`
                    text-sm font-medium
                    ${getPointsColor(board.pointsAwarded, board.status)}
                  `}
                  >
                    {[
                      'PENDING_VALIDATION',
                      'VALIDATED',
                      'REJECTED',
                      'SENT',
                    ].includes(board.status) ? (
                      <span>Aucun point attribué</span>
                    ) : (
                      <span>
                        {board.pointsAwarded || 0} point
                        {(board.pointsAwarded || 0) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs">
                  {board.status === 'PENDING_VALIDATION' && (
                    <p className="text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      Ta planche est en cours de validation par notre équipe
                    </p>
                  )}
                  {board.status === 'VALIDATED' && (
                    <p className="text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Ta planche a été validée ! Tu pourras bientôt
                      l&apos;expédier
                    </p>
                  )}
                  {board.status === 'REJECTED' && (
                    <p className="text-red-600 bg-red-50 px-2 py-1 rounded">
                      Planche refusée
                    </p>
                  )}
                  {board.status === 'SENT' && (
                    <p className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Ta planche a été expédiée et est en transit
                    </p>
                  )}
                  {board.status === 'RECEIVED' && (
                    <p className="text-green-600 bg-green-50 px-2 py-1 rounded">
                      Planche reçue et validée - Points attribués
                    </p>
                  )}
                  {board.status === 'RECYCLED_TO_PRODUCT' && (
                    <p className="text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      Ta planche a été réhabilitée et a gagnée une seconde vie !
                    </p>
                  )}
                  {board.status === 'SOLD' && (
                    <p className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      Ta planche a été vendue - Merci pour ta contribution !
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
