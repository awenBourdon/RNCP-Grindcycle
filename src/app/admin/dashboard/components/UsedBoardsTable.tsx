'use client'
import {
  Users,
  Hash,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ChevronDown,
  Recycle,
  ShoppingCart,
  AlertCircle,
  Truck,
} from 'lucide-react'
import { ImageModal, useImageModal } from './ImageModal'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/Spinner'
import type {
  UsedBoard,
  UsedBoardStatus,
  BoardCondition,
} from '@/generated/prisma'

interface UsedBoardWithUser extends UsedBoard {
  user: {
    id: string
    name: string
    email: string
  }
}

interface UsedBoardsTableProps {
  usedBoards: UsedBoardWithUser[]
}

interface StatusSelectProps {
  boardId: string
  currentStatus: UsedBoardStatus
  onUpdate: () => void
  currentPoints: number | null
}

interface PointsSelectProps {
  boardId: string
  currentPoints: number | null
  currentStatus: UsedBoardStatus
  onUpdate: () => void
}

const StatusSelect = ({
  boardId,
  currentStatus,
  onUpdate,
}: StatusSelectProps) => {
  const [isPending, startTransition] = useTransition()

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = evt.target.value as UsedBoardStatus

    startTransition(async () => {
      const controller = new AbortController()

      try {
        const response = await fetch('/api/used-board', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            boardId,
            status: newStatus,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour')
        }

        toast.success('Statut mis à jour')
        onUpdate()
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Erreur lors de la mise à jour du statut')
        }
      }
    })
  }

  const getStatusIcon = (status: UsedBoardStatus) => {
    switch (status) {
      case 'PENDING_VALIDATION':
        return <AlertCircle size={14} />
      case 'VALIDATED':
        return <CheckCircle size={14} />
      case 'REJECTED':
        return <XCircle size={14} />
      case 'SENT':
        return <Truck size={14} />
      case 'RECEIVED':
        return <CheckCircle size={14} />
      case 'RECYCLED_TO_PRODUCT':
        return <Recycle size={14} />
      case 'SOLD':
        return <ShoppingCart size={14} />
      default:
        return <Clock size={14} />
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

  return (
    <div className="relative inline-flex items-center">
      <div className="relative">
        <select
          value={currentStatus}
          onChange={handleChange}
          disabled={isPending}
          className={`
            appearance-none
            pl-8 pr-8 py-2
            text-sm font-medium
            border
            rounded-full
            cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#0a3d3f]/20 focus:border-[#0a3d3f]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:border-gray-300
            ${getStatusColor(currentStatus)}
          `}
        >
          <option value="PENDING_VALIDATION">À valider</option>
          <option value="VALIDATED">Validé</option>
          <option value="REJECTED">Rejeté</option>
          <option value="SENT">Envoyé</option>
          <option value="RECEIVED">Reçu</option>
          <option value="RECYCLED_TO_PRODUCT">Recyclé en produit</option>
          <option value="SOLD">Vendu</option>
        </select>

        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {getStatusIcon(currentStatus)}
        </div>

        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Spinner />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  )
}

const PointsSelect = ({
  boardId,
  currentPoints,
  currentStatus,
  onUpdate,
}: PointsSelectProps) => {
  const [isPending, startTransition] = useTransition()

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newPoints = evt.target.value === '' ? null : Number(evt.target.value)

    startTransition(async () => {
      const controller = new AbortController()

      try {
        const response = await fetch('/api/used-board', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            boardId,
            pointsAwarded: newPoints,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour')
        }

        toast.success('Points mis à jour')
        onUpdate()
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Erreur lors de la mise à jour des points')
        }
      }
    })
  }

  const getPointsColor = (points: number | null) => {
    if (!points) return 'text-gray-600 bg-gray-100 border-gray-200'
    if (points >= 50) return 'text-green-700 bg-green-50 border-green-200'
    if (points >= 25) return 'text-orange-700 bg-orange-50 border-orange-200'
    return 'text-blue-700 bg-blue-50 border-blue-200'
  }

  const canEditPoints =
    currentStatus === 'RECEIVED' ||
    currentStatus === 'RECYCLED_TO_PRODUCT' ||
    currentStatus === 'SOLD'

  return (
    <div className="relative inline-flex items-center group">
      <div className="relative">
        <select
          value={currentPoints || ''}
          onChange={handleChange}
          disabled={isPending || !canEditPoints}
          className={`
            appearance-none
            pl-3 pr-8 py-2
            text-sm font-medium
            border
            rounded-full
            cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#0a3d3f]/20 focus:border-[#0a3d3f]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:border-gray-300
            min-w-[80px]
            ${getPointsColor(currentPoints)}
          `}
        >
          <option value="">0 pts</option>
          <option value="10">10 pts</option>
          <option value="25">25 pts</option>
          <option value="50">50 pts</option>
          <option value="75">75 pts</option>
          <option value="100">100 pts</option>
        </select>

        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Spinner />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </div>

      {!canEditPoints && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          Les points ne peuvent être attribués qu&apos;aux planches reçues,
          recyclées ou vendues.
        </div>
      )}
    </div>
  )
}

export const UsedBoardsTable = ({ usedBoards }: UsedBoardsTableProps) => {
  const {
    isOpen,
    images,
    boardId,
    userName,
    openModal,
    closeModal,
    description,
  } = useImageModal()
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  const getConditionColor = (condition: BoardCondition | null) => {
    if (!condition) return 'bg-gray-100 text-gray-800'
    switch (condition) {
      case 'GOOD':
        return 'bg-green-100 text-green-800'
      case 'AVERAGE':
        return 'bg-orange-100 text-orange-800'
      case 'BAD':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionText = (condition: BoardCondition | null) => {
    if (!condition) return 'Non défini'
    switch (condition) {
      case 'GOOD':
        return 'Bon état'
      case 'AVERAGE':
        return 'État moyen'
      case 'BAD':
        return 'Mauvais état'
      default:
        return condition
    }
  }

  const handleViewImages = (board: UsedBoardWithUser) => {
    if (board.image.length > 0) {
      openModal(
        board.image,
        board.id,
        board.user.name,
        board?.description ?? undefined
      )
    }
  }

  const handleDeleteBoard = async (boardId: string) => {
    const controller = new AbortController()

    try {
      const response = await fetch(`/api/used-board?boardId=${boardId}`, {
        method: 'DELETE',
        signal: controller.signal,
      })

      if (response.ok) {
        toast.success('Planche supprimée')
        router.refresh()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-black">
            Planches d&apos;occasion
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <Hash size={16} />
                    ID
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    Utilisateur
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Nom
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Statut
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  État
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Images
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Points
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {usedBoards.map((board) => (
                <tr
                  key={board.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {board.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {board.user.name?.slice(0, 1).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">
                          {board.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {board.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">{board.name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusSelect
                      boardId={board.id}
                      currentStatus={board.status}
                      onUpdate={handleUpdate}
                      currentPoints={board.pointsAwarded}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(board.boardCondition)}`}
                    >
                      {getConditionText(board.boardCondition)}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div
                      className="text-sm text-gray-600 truncate"
                      title={board.description || 'Aucune description'}
                    >
                      {board.description || 'Aucune description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm text-gray-600">
                        {board.image.length}
                      </span>
                      {board.image.length > 0 && (
                        <button
                          onClick={() => handleViewImages(board)}
                          className="text-[#0a3d3f] hover:text-[#0a3d3f]/80 p-1 transition-colors"
                          title="Voir les images"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <PointsSelect
                      boardId={board.id}
                      currentPoints={board.pointsAwarded}
                      currentStatus={board.status}
                      onUpdate={handleUpdate}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">
                      {new Date(board.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-red-600 hover:text-red-800 p-1 transition-colors"
                      title="Supprimer la planche"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usedBoards.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucune planche trouvée
            </h3>
            <p className="text-gray-500">
              Il n&apos;y a actuellement aucune planche d&apos;occasion dans la
              base de données.
            </p>
          </div>
        )}
      </div>

      <ImageModal
        images={images}
        isOpen={isOpen}
        onClose={closeModal}
        boardId={boardId}
        userName={userName}
        description={description}
      />
    </>
  )
}
