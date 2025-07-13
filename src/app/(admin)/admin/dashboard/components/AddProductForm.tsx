'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, Info, CheckCircle, XCircle } from 'lucide-react'
import { productSchema } from '@/lib/zod-validations/productValidation'
import z from 'zod'
import { Spinner } from '@/components/Spinner'

interface UsedBoard {
  id: string
  name: string
  status: string
}

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

interface AddProductFormProps {
  usedBoards: UsedBoard[]
}

enum ProductType {
  SKATE = 'SKATE',
  CRUISER = 'CRUISER',
  LONG = 'LONG',
}

export const AddProductForm = ({ usedBoards }: AddProductFormProps) => {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    priceEuro: 0,
    pricePoints: 0,
    usedBoardId: '',
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const availableUsedBoards = usedBoards.filter(
    (board) => board.status === 'RECEIVED'
  )

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const newFiles = [...selectedFiles]
      newFiles[index] = file
      setSelectedFiles(newFiles.filter(Boolean))

      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newImages = [...previewImages]
          newImages[index] = reader.result
          setPreviewImages(newImages)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)

    const newImages = [...previewImages]
    newImages.splice(index, 1)
    setPreviewImages(newImages)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'priceEuro' || name === 'pricePoints' ? Number(value) : value,
    }))
  }

  const validateFormData = () => {
    try {
      productSchema.parse(formData)

      if (selectedFiles.length === 0) {
        addToast('error', 'Au moins une image est requise')
        return false
      }

      const invalidImages = selectedFiles.filter(
        (file) =>
          ![
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
          ].includes(file.type)
      )

      if (invalidImages.length > 0) {
        addToast(
          'error',
          "Format d'image non supporté. Utilisez JPG, PNG, WebP ou GIF."
        )
        return false
      }

      const oversizedImages = selectedFiles.filter(
        (file) => file.size > 5 * 1024 * 1024
      )

      if (oversizedImages.length > 0) {
        addToast(
          'error',
          'Une ou plusieurs images sont trop volumineuses (max 5MB)'
        )
        return false
      }

      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          addToast('error', err.message)
        })
      }
      return false
    }
  }

  const updateUsedBoardStatus = async (
    usedBoardId: string,
    signal?: AbortSignal
  ) => {
    try {
      const response = await fetch('/api/used-board', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: usedBoardId,
          status: 'RECYCLED_TO_PRODUCT',
        }),
        signal: signal,
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut de la planche')
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        throw error
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!validateFormData()) {
      setIsSubmitting(false)
      return
    }

    const controller = new AbortController()

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('type', formData.type)
      formDataToSend.append('priceEuro', formData.priceEuro.toString())
      formDataToSend.append('pricePoints', formData.pricePoints.toString())
      formDataToSend.append('usedBoardId', formData.usedBoardId)

      selectedFiles.forEach((file) => {
        if (file) {
          formDataToSend.append('images', file)
        }
      })

      const response = await fetch('/api/product', {
        method: 'POST',
        body: formDataToSend,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach((detail: string) => {
            addToast('error', detail)
          })
        } else {
          addToast('error', errorData.error || 'Erreur lors de la soumission')
        }
        return
      }

      if (formData.usedBoardId) {
        await updateUsedBoardStatus(formData.usedBoardId, controller.signal)
      }

      addToast(
        'success',
        'Produit ajouté avec succès ! La planche a été marquée comme recyclée.'
      )

      setFormData({
        name: '',
        description: '',
        type: '',
        priceEuro: 0,
        pricePoints: 0,
        usedBoardId: '',
      })
      setSelectedFiles([])
      setPreviewImages([])

      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        addToast('error', error.message || 'Une erreur est survenue')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-80 max-w-md ${
              toast.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            ) : (
              <XCircle size={20} className="text-red-600 flex-shrink-0" />
            )}
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="mb-12">
          <div className="flex items-start gap-6">
            <div className="bg-[#0a3d3f] p-3 rounded-full text-white">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-normal mb-6">
                Ajouter un nouveau produit
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Remplissez ce formulaire pour ajouter un nouveau produit au
                catalogue. La planche sélectionnée sera automatiquement marquée
                comme recyclée.
              </p>
            </div>
          </div>
        </div>

        {availableUsedBoards.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <Info size={20} className="text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-800">
                  Aucune planche disponible
                </h3>
                <p className="text-orange-700 text-sm">
                  Il n&apos;y a actuellement aucune planche avec le statut
                  &quot;Reçue&quot; disponible pour être recyclée en produit.
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-16"
          encType="multipart/form-data"
        >
          <div>
            <h3 className="text-2xl font-normal mb-8">
              Informations sur le produit
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm text-gray-600 mb-3">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {Object.values(ProductType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">
                  Prix en Euros <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="priceEuro"
                  value={formData.priceEuro}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">
                  Prix en Points <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="pricePoints"
                  value={formData.pricePoints}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-gray-600 mb-3">
                  Photos du produit <span className="text-red-500">*</span>
                </label>
                <div className="bg-[#f8f7f4] p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <Info size={16} className="text-gray-600" />
                    <p className="text-sm text-gray-600">
                      Ajoutez au moins une photo montrant le produit. Vous
                      pouvez ajouter jusqu&apos;à 3 photos (max 5MB chacune).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className={`border border-dashed ${
                          previewImages[index]
                            ? 'border-[#0a3d3f]'
                            : 'border-gray-300'
                        } rounded-lg bg-white p-4 flex flex-col items-center justify-center h-40 relative`}
                      >
                        {previewImages[index] ? (
                          <>
                            <Image
                              src={previewImages[index] || '/placeholder.svg'}
                              alt={`Aperçu ${index + 1}`}
                              fill
                              className="object-contain p-2 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-black text-white w-6 h-6 flex items-center justify-center z-10 rounded-full"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <p className="text-sm text-center text-gray-600 mb-2">
                              {index === 0
                                ? 'Photo principale'
                                : 'Photo supplémentaire'}
                            </p>
                            <p className="text-xs text-center text-gray-500">
                              {index === 0 ? 'Obligatoire' : 'Optionnel'}
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          name={`image-${index}`}
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleImageUpload(e, index)}
                        />
                      </div>
                    ))}
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                      {selectedFiles.length} image(s) sélectionnée(s)
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm text-gray-600 mb-3"
                >
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez l'état du produit, son histoire, les défauts éventuels..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label
                  htmlFor="usedBoardId"
                  className="block text-sm text-gray-600 mb-3"
                >
                  Planche d&apos;occasion à recycler{' '}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="usedBoardId"
                  name="usedBoardId"
                  value={formData.usedBoardId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                  required
                  disabled={availableUsedBoards.length === 0}
                >
                  <option value="">
                    {availableUsedBoards.length === 0
                      ? 'Aucune planche disponible pour recyclage'
                      : 'Sélectionnez la planche réhabilitée'}
                  </option>
                  {availableUsedBoards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
                {availableUsedBoards.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Cette planche sera automatiquement marquée comme
                    &quot;Recyclée en produit&quot; après création.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={
                !formData.type ||
                !formData.name ||
                !formData.usedBoardId ||
                selectedFiles.length === 0 ||
                isSubmitting ||
                availableUsedBoards.length === 0
              }
              className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full font-normal text-lg hover:bg-[#0a4d4f] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Création en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  {availableUsedBoards.length === 0
                    ? 'Aucune planche disponible'
                    : 'Recycler en produit'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
