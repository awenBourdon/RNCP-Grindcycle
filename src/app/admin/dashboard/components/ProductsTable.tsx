'use client'

import { Hash, Eye, Trash2, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import type { Product, ProductStatus, BoardType } from '@/generated/prisma'

interface ProductWithUsedBoard extends Product {
  usedBoard?: {
    id: string
    name: string
    user: {
      id: string
      name: string
      email: string
    }
  } | null
}

interface ProductsTableProps {
  products: ProductWithUsedBoard[]
}

const getStatusColor = (status: ProductStatus) => {
  switch (status) {
    case 'CATALOG':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'PURCHASED':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200'
  }
}

const getStatusText = (status: ProductStatus) => {
  switch (status) {
    case 'CATALOG':
      return 'En catalogue'
    case 'PURCHASED':
      return 'Acheté'
    default:
      return status
  }
}

export const ProductsTable = ({ products }: ProductsTableProps) => {
  const router = useRouter()

  const getBoardTypeColor = (type: BoardType) => {
    switch (type) {
      case 'SKATE':
        return 'bg-blue-100 text-blue-800'
      case 'CRUISER':
        return 'bg-green-100 text-green-800'
      case 'LONG':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBoardTypeText = (type: BoardType) => {
    switch (type) {
      case 'SKATE':
        return 'Skateboard'
      case 'CRUISER':
        return 'Cruiser'
      case 'LONG':
        return 'Longboard'
      default:
        return type
    }
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/produit/${productId}`)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch('/api/product', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
        }),
      })

      console.log('📡 Réponse:', response.status, response.statusText)

      if (response.ok) {
        toast.success('Produit supprimé avec succès')
        router.refresh()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-12">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-black">
          Produits du catalogue
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {products.length} produit{products.length !== 1 ? 's' : ''} au total
        </p>
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
                Image
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Nom du produit
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                Type
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                Prix €
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                Points
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Planche d&apos;origine
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                Date création
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {product.id.slice(0, 8)}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="w-16 h-16 relative">
                    {product.imageUrl && product.imageUrl.length > 0 ? (
                      <Image
                        src={product.imageUrl[0]}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div>
                    <h3 className="text-sm font-medium text-black">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                        {product.description}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBoardTypeColor(product.type)}`}
                  >
                    {getBoardTypeText(product.type)}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {product.priceEuro.toFixed(2)} €
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-amber-600">
                    {product.pricePoints} pts
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border
                      ${getStatusColor(product.status)}
                    `}
                  >
                    {getStatusText(product.status)}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {product.usedBoard ? (
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {product.usedBoard.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        de {product.usedBoard.user.name}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      Aucune planche liée
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600">
                    {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewProduct(product.id)}
                      className="text-[#0a3d3f] hover:text-[#0a3d3f]/80 p-1 transition-colors"
                      title="Voir le produit"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800 p-1 transition-colors"
                      title="Supprimer le produit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-500">
            Il n&apos;y a actuellement aucun produit dans le catalogue.
          </p>
        </div>
      )}
    </div>
  )
}
