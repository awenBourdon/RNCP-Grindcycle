'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  Recycle,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react'

enum BoardType {
  SKATE = 'SKATE',
  CRUISER = 'CRUISER',
  LONG = 'LONG',
}

interface RecycleFormProps {
  userId: string
}

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

export const RecycleForm = ({ userId }: RecycleFormProps) => {
  const [selectedCondition, setSelectedCondition] = useState<
    'GOOD' | 'AVERAGE' | 'BAD' | ''
  >('')
  const [selectedType, setSelectedType] = useState<BoardType | ''>('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

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
      setSelectedFiles(newFiles)

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
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)

    const newImages = [...previewImages]
    newImages[index] = ''
    setPreviewImages(newImages)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('boardCondition', selectedCondition)
      formData.append('boardType', selectedType)

      const name = (
        e.currentTarget.elements.namedItem('name') as HTMLInputElement
      ).value
      if (name) {
        formData.append('name', name)
      }

      const description = (
        e.currentTarget.elements.namedItem('description') as HTMLTextAreaElement
      ).value
      if (description) {
        formData.append('description', description)
      }

      if (selectedFiles.length === 0) {
        throw new Error('Veuillez télécharger au moins une image')
      }

      selectedFiles.forEach((file) => {
        formData.append('image', file)
      })

      const response = await fetch('/api/used-board', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log(errorData)
        throw new Error(errorData.error || 'Erreur lors de la soumission')
      }

      addToast(
        'success',
        "Planche soumise avec succès ! Notre équipe va l'évaluer et te contacter bientôt."
      )

      setSelectedCondition('')
      setSelectedType('')
      setSelectedFiles([])
      setPreviewImages([])
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Erreur soumission:', error)
      addToast(
        'error',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
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
        <Link
          href="/"
          className="inline-flex items-center mb-12 text-gray-600 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="border-b border-transparent group-hover:border-gray-600 pb-1 transition-colors">
            Retour à l&apos;accueil
          </span>
        </Link>

        <div className="mb-12">
          <div className="flex items-start gap-6">
            <div className="bg-[#0a3d3f] p-3 rounded-full text-white">
              <Recycle size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-normal mb-6">
                Donne une seconde vie à ta planche
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Remplis ce formulaire pour nous aider à évaluer ta planche. Une
                fois soumis, nous te contacterons pour organiser la collecte et
                t&apos;informer des points que tu recevras en échange.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-16"
          encType="multipart/form-data"
        >
          <input type="hidden" name="userId" value={userId} />

          <div>
            <h3 className="text-2xl font-normal mb-8">
              Informations sur ta planche
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm text-gray-600 mb-3">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">
                  Type de planche <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(BoardType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`py-3 px-2 rounded-md text-center transition-colors ${
                        selectedType === type
                          ? 'bg-[#0a3d3f] text-white'
                          : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="boardType"
                  value={selectedType}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-3">
                  État de la planche <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'GOOD', label: 'Bon état' },
                    { value: 'AVERAGE', label: 'État moyen' },
                    { value: 'BAD', label: 'Mauvais état' },
                  ].map((condition) => (
                    <button
                      key={condition.value}
                      type="button"
                      onClick={() =>
                        setSelectedCondition(
                          condition.value as 'GOOD' | 'AVERAGE' | 'BAD'
                        )
                      }
                      className={`py-3 px-2 rounded-md text-center transition-colors ${
                        selectedCondition === condition.value
                          ? 'bg-[#0a3d3f] text-white'
                          : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {condition.label}
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="boardCondition"
                  value={selectedCondition}
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-gray-600 mb-3">
                  Photos de ta planche <span className="text-red-500">*</span>
                </label>
                <div className="bg-[#f8f7f4] p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <Info size={16} className="text-gray-600" />
                    <p className="text-sm text-gray-600">
                      Ajoute au moins une photo montrant l&apos;état général de
                      ta planche. Tu peux ajouter jusqu&apos;à 3 photos.
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
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleImageUpload(e, index)}
                          required={index === 0}
                        />
                      </div>
                    ))}
                  </div>
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
                  placeholder="Décris l'état de ta planche, son histoire, les défauts éventuels..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#0a3d3f] focus:ring-1 focus:ring-[#0a3d3f]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!selectedCondition || !selectedType || isSubmitting}
              className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full font-normal text-lg hover:bg-[#0a4d4f] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Recycle className="mr-2 h-5 w-5" />
                  Soumettre ma planche
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-16">
          <h3 className="text-2xl font-normal mb-8">Comment ça fonctionne ?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8f7f4] p-6 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
                1
              </div>
              <p className="text-lg font-medium mb-3">Soumets ta planche</p>
              <p className="text-gray-600">
                Remplis ce formulaire avec les détails de ta planche usée
              </p>
            </div>

            <div className="bg-[#f8f7f4] p-6 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
                2
              </div>
              <p className="text-lg font-medium mb-3">Nous l&rsquo;évaluons</p>
              <p className="text-gray-600">
                Notre équipe évalue ta planche et te propose des points
              </p>
            </div>

            <div className="bg-[#f8f7f4] p-6 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full mb-4">
                3
              </div>
              <p className="text-lg font-medium mb-3">Échange tes points</p>
              <p className="text-gray-600">
                Utilise tes points pour acheter une planche recyclée
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
