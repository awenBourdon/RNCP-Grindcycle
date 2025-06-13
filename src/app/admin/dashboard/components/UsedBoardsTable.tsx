"use client";

import { Users, Hash, Eye, Trash2, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { ImageModal, useImageModal } from "./ImageModal";
import type { UsedBoard, UsedBoardStatus, BoardCondition } from "@/generated/prisma";

interface UsedBoardWithUser extends UsedBoard {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface UsedBoardsTableProps {
  usedBoards: UsedBoardWithUser[];
}

export const UsedBoardsTable = ({ usedBoards }: UsedBoardsTableProps) => {
  const { isOpen, images, boardId, userName, openModal, closeModal } = useImageModal();

  const getStatusColor = (status: UsedBoardStatus) => {
    switch (status) {
      case "SENT":
        return "bg-yellow-100 text-yellow-800"
      case "RECEIVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: UsedBoardStatus) => {
    switch (status) {
      case "SENT":
        return <Clock size={14} />
      case "RECEIVED":
        return <CheckCircle size={14} />
      case "REJECTED":
        return <XCircle size={14} />
      default:
        return <Clock size={14} />
    }
  }

  const getStatusText = (status: UsedBoardStatus) => {
    switch (status) {
      case "SENT":
        return "Envoyé"
      case "RECEIVED":
        return "Reçu"
      case "REJECTED":
        return "Rejeté"
      default:
        return status
    }
  }

  const getConditionColor = (condition: BoardCondition | null) => {
    if (!condition) return "bg-gray-100 text-gray-800"
    switch (condition) {
      case "GOOD":
        return "bg-green-100 text-green-800"
      case "AVERAGE":
        return "bg-orange-100 text-orange-800"
      case "BAD":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionText = (condition: BoardCondition | null) => {
    if (!condition) return "Non défini"
    switch (condition) {
      case "GOOD":
        return "Bon état"
      case "AVERAGE":
        return "État moyen"
      case "BAD":
        return "Mauvais état"
      default:
        return condition
    }
  }

  const handleViewImages = (board: UsedBoardWithUser) => {
    if (board.image.length > 0) {
      openModal(board.image, board.id, board.user.name);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
      try {
        const response = await fetch(`/api/used-board?boardId=${boardId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          window.location.reload();
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la suppression");
      }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-black">Planches d&apos;occasion</h2>
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
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">Statut</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">État</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Description</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">Images</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">Points</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">Date</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {usedBoards.map((board) => (
                <tr key={board.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {board.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0a3d3f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {board.user.name?.slice(0, 1).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">{board.user.name}</div>
                        <div className="text-xs text-gray-500">{board.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(board.status)}`}>
                      {getStatusIcon(board.status)}
                      {getStatusText(board.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(board.boardCondition)}`}>
                      {getConditionText(board.boardCondition)}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-600 truncate" title={board.description || "Aucune description"}>
                      {board.description || "Aucune description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm text-gray-600">{board.image.length}</span>
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
                    <span className="text-sm font-medium text-gray-900">
                      {board.pointsAwarded || "-"}
                    </span>
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
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune planche trouvée</h3>
            <p className="text-gray-500">Il n&apos;y a actuellement aucune planche d&apos;occasion dans la base de données.</p>
          </div>
        )}
      </div>

      <ImageModal
        images={images}
        isOpen={isOpen}
        onClose={closeModal}
        boardId={boardId}
        userName={userName}
      />
    </>
  );
};