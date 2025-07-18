'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Info } from 'lucide-react'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import { Spinner } from '@/components/ui/Spinner'
import { ProductFormFields } from './ProductFormFields'
import { ImageUpload } from '@/components/form/ImageUpload'
import {
  IMAGE_CONFIG,
  productSchema,
} from '@/lib/zod-validations/boardsValidation'

interface UsedBoard {
  id: string
  name: string
  status: string
}

interface AddProductFormProps {
  usedBoards: UsedBoard[]
}

interface FormData {
  name: string
  description: string
  type: string
  priceEuro: number
  pricePoints: number
  usedBoardId: string
}

interface FormErrors {
  [key: string]: string
}

export const AddProductForm = ({ usedBoards }: AddProductFormProps) => {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
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
  const [errors, setErrors] = useState<FormErrors>({})

  const availableUsedBoards = usedBoards.filter(
    (board) => board.status === 'RECEIVED'
  )

  const validateFile = (file: File): string | null => {
    if (file.size > IMAGE_CONFIG.maxSize) {
      return `Fichier trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)}MB) - Maximum ${IMAGE_CONFIG.maxSizeMB}MB`
    }
    if (
      !(IMAGE_CONFIG.acceptedFormats as readonly string[]).includes(file.type)
    ) {
      return `Format non supporté. Utilisez ${IMAGE_CONFIG.acceptedFormatsDisplay}`
    }
    return null
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileError = validateFile(file)
      if (fileError) {
        const newErrors = { ...errors }
        newErrors[`image-${index}`] = fileError
        setErrors(newErrors)
        return
      }

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

      const newErrors = { ...errors }
      delete newErrors[`image-${index}`]
      delete newErrors.images
      setErrors(newErrors)
    }
  }

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)

    const newImages = [...previewImages]
    newImages.splice(index, 1)
    setPreviewImages(newImages)

    const newErrors = { ...errors }
    delete newErrors[`image-${index}`]
    setErrors(newErrors)
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

    if (errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }
  }

  const validateFormData = () => {
    setErrors({})

    try {
      const completeFormData = {
        ...formData,
        images: selectedFiles,
      }

      productSchema.parse(completeFormData)

      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: FormErrors = {}
        error.errors.forEach((err) => {
          const field = err.path.join('.')
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const updateUsedBoardStatus = async (
    usedBoardId: string,
    signal?: AbortSignal
  ) => {
    try {
      const response = await fetch('/api/used-boards', {
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
      toast.error('Veuillez corriger les erreurs dans le formulaire')
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

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la soumission')
      }

      if (formData.usedBoardId) {
        await updateUsedBoardStatus(formData.usedBoardId, controller.signal)
      }

      toast.success(
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
      setErrors({})

      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error(error.message || 'Une erreur est survenue')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
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

          <div className="space-y-8">
            <ProductFormFields
              formData={formData}
              availableUsedBoards={availableUsedBoards}
              errors={errors}
              onChange={handleChange}
            />

            <ImageUpload
              selectedFiles={selectedFiles}
              previewImages={previewImages}
              errors={errors}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
            />
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
  )
}
