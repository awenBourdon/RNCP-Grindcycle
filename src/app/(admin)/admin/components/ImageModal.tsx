'use client';
import { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

interface ImageModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  name?: string;
  userName?: string;
  description?: string;
}

export const ImageModal = ({
  images,
  isOpen,
  onClose,
  boardId,
  name,
  description,
}: ImageModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (!isOpen || images.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(images[currentImageIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `planche_${boardId}_${currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(images[currentImageIndex], '_blank');
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#f8f7f4]">
          <div>
            <h3 className="text-lg font-medium text-[#010101]">
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
              className="p-2 text-gray-600 hover:text-[#0a3d3f] hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Télécharger la photo"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-[#0a3d3f] hover:bg-white rounded-lg transition-color cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="relative bg-gray-100 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-hidden">
          {imageErrors.has(currentImageIndex) ? (
            <div className="flex flex-col items-center justify-center text-gray-400 z-10">
              <ImageIcon size={64} />
              <p className="mt-2 text-sm">Erreur de chargement</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={images[currentImageIndex] || '/placeholder.webp'}
                alt={`Image ${currentImageIndex + 1} de la planche`}
                className="max-w-full max-h-full object-contain"
                fill={false}
                width={800}
                height={600}
                priority={currentImageIndex === 0}
                quality={90}
                onError={() => handleImageError(currentImageIndex)}
                onLoad={() => {
                  setImageErrors(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentImageIndex);
                    return newSet;
                  });
                }}
              />
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 z-20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 z-20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="p-4 border-t border-gray-200 bg-[#f8f7f4]">
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
                  {imageErrors.has(index) ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon size={20} className="text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={image || '/placeholder.webp'}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={64}
                      height={64}
                      onError={() => handleImageError(index)}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="p-4 border-t border-gray-200 bg-[#f8f7f4]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Image {currentImageIndex + 1} sur {images.length}
              </p>
              {description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#0a3d3f] text-white rounded-full hover:bg-[#0a4d4f] transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
