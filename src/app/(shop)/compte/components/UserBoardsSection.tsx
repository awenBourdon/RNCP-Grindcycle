import Image from "next/image"
import { Package, Recycle } from "lucide-react"
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

interface UserBoardsSectionProps {
  userBoards: UserBoard[]
}

const getStatusText = (status: UsedBoardStatus) => {
  switch (status) {
    case "PENDING_VALIDATION":
      return "À valider"
    case "VALIDATED":
      return "Validé"
    case "REJECTED":
      return "Rejeté"
    case "SENT":
      return "Envoyé"
    case "RECEIVED":
      return "Reçu"
    case "RECYCLED_TO_PRODUCT":
      return "Recyclé en produit"
    case "SOLD":
      return "Vendu"
    default:
      return status
  }
}

export const UserBoardsSection = ({ userBoards }: UserBoardsSectionProps) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <div className="flex items-center mb-8">
        <Package size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">Mes planches envoyées</h2>
      </div>

      {userBoards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#f8f7f4] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Recycle size={24} className="text-[#0a3d3f]" />
          </div>
          <h3 className="text-lg font-medium text-[#010101] mb-2">Aucune planche envoyée</h3>
          <p className="text-gray-600">Commence par envoyer ta première planche pour lui donner une seconde vie !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {userBoards.map((board) => (
            <div key={board.id} className="flex items-start gap-6 p-6 bg-[#f8f7f4] rounded-lg">
              <div className="flex-shrink-0">
                {board.image && board.image.length > 0 ? (
                  <Image
                    src={board.image[0] || "/placeholder.svg"}
                    alt={`Image planche ${board.name || board.id}`}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    priority
                  />
                ) : (
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-[#0a3d3f]">
                    <Recycle size={20} />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-lg text-[#010101]">{board.name || "Sans nom"}</h3>
                  <span className="px-3 py-1 bg-[#0a3d3f] text-white rounded-full text-sm font-medium">
                    {getStatusText(board.status)}
                  </span>
                </div>

                {board.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{board.description}</p>}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Envoyée le {new Date(board.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-[#010101] font-medium">
                    {board.pointsAwarded || 0} point{(board.pointsAwarded || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
