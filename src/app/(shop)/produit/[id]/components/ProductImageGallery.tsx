'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export const ProductImageGallery = ({
  images,
  productName,
}: ProductImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const displayImages =
    images.length > 0 ? images : ['/placeholder.svg?height=400&width=400'];

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      prev => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  return (
    <div className="space-y-4">
      <div
        className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-lg"
        role="region"
        aria-label="Galerie d'images du produit"
        aria-live="polite"
      >
        <Image
          src={displayImages[currentImageIndex] || '/placeholder.webp'}
          alt={`${productName} - Image ${currentImageIndex + 1} sur ${displayImages.length}`}
          fill
          className="object-cover transition-all duration-300"
          priority={currentImageIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
        />
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Afficher l'image précédente"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
              aria-label="Afficher l'image suivante"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
              aria-hidden="true"
            >
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>
      {displayImages.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          role="tablist"
          aria-label="Sélectionner une image"
        >
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                index === currentImageIndex
                  ? 'border-[#0a3d3f] ring-2 ring-[#0a3d3f]/30 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Image ${index + 1} sur ${displayImages.length}`}
              aria-selected={index === currentImageIndex}
              role="tab"
            >
              <Image
                src={image || '/placeholder.webp'}
                alt={`${productName} - Miniature ${index + 1}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
