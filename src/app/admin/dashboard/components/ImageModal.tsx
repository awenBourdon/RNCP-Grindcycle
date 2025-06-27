'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import Image from 'next/image'

interface ImageModalProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
  boardId: string
  name?: string
  userName?: string
  description?: string
}

export const ImageModal = ({
  images,
  isOpen,
  onClose,
  boardId,
  name,
  description,
}: ImageModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen || images.length === 0) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = images[currentImageIndex]
    link.download = `planche_${boardId}_${currentImageIndex + 1}`
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {name ? `Photos de ${name}` : 'Photos de la planche'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {images.length > 1 && (
              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md">
                {currentImageIndex + 1} / {images.length}
              </span>
            )}
            <button
              onClick={downloadImage}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              title="Télécharger la photo"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="relative bg-gray-100 flex items-center justify-center min-h-[400px] max-h-[70vh]">
          <Image
            src={images[currentImageIndex]}
            alt={`Image ${currentImageIndex + 1} de la planche`}
            className="max-w-full max-h-full object-contain"
            width={800}
            height={500}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-image.jpg'
            }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-[#0a3d3f] ring-2 ring-[#0a3d3f]/20'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.jpg'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500 mt-1 line-clamp-4 flex-1">
              {description}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}

export const useImageModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [currentBoardId, setCurrentBoardId] = useState('')
  const [currentBoardName, setCurrentBoardName] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')

  const openModal = (
    images: string[],
    boardId: string,
    boardName?: string,
    userName?: string,
    description?: string
  ) => {
    setCurrentImages(images)
    setCurrentBoardId(boardId)
    setCurrentBoardName(boardName || '')
    setCurrentUserName(userName || '')
    setCurrentDescription(description || '')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentImages([])
    setCurrentBoardId('')
    setCurrentBoardName('')
    setCurrentUserName('')
  }

  return {
    isOpen,
    images: currentImages,
    boardId: currentBoardId,
    name: currentBoardName,
    userName: currentUserName,
    description: currentDescription,
    openModal,
    closeModal,
  }
}
