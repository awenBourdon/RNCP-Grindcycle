import Image from 'next/image';
import { Upload, Info } from 'lucide-react';
import { UPLOAD_CONFIG } from '@/lib/server/upload-images/upload';

interface FormErrors {
  [key: string]: string;
}

interface ImageUploadProps {
  selectedFiles: File[];
  previewImages: string[];
  errors: FormErrors;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void | Promise<void>;
  onRemoveImage: (index: number) => void;
}

export const ImageUpload = ({
  selectedFiles,
  previewImages,
  errors,
  onImageUpload,
  onRemoveImage,
}: ImageUploadProps) => {
  const canUploadImage = (index: number): boolean => {
    if (index === 0) return true;
    return selectedFiles.length > index - 1 && previewImages[index - 1] !== '';
  };

  const acceptedFormats = UPLOAD_CONFIG.allowedMimeTypes.join(',');

  return (
    <fieldset className="col-span-1 md:col-span-2">
      <legend className="block text-sm text-gray-600 mb-3">
        Photos de ta planche{' '}
        <span className="text-red-500" aria-label="requis">
          *
        </span>
      </legend>
      <div
        className={`bg-[#f8f7f4] p-6 rounded-lg ${errors.images ? 'border border-red-500' : ''}`}
      >
        <div className="flex items-center gap-2 mb-6">
          <Info size={16} className="text-gray-600" aria-hidden="true" />
          <p className="text-sm text-gray-600">
            Ajoute au moins une photo montrant entièrement la planche. Tu peux
            ajouter jusqu&apos;à {UPLOAD_CONFIG.maxFiles.usedBoards} photos.
            <br />
            <strong>Format accepté :</strong> JPG, PNG, WebP |{' '}
            <strong>Poids max :</strong>{' '}
            {UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB par image
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(index => {
            const canUpload = canUploadImage(index);
            const isMainImage = index === 0;
            const imageLabel = isMainImage
              ? 'Photo principale'
              : `Photo supplémentaire ${index}`;

            return (
              <div
                key={index}
                className={`border border-dashed rounded-lg bg-white p-4 flex flex-col items-center justify-center h-40 relative ${
                  previewImages[index]
                    ? 'border-[#0a3d3f]'
                    : canUpload
                      ? 'border-gray-300'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                {previewImages[index] ? (
                  <>
                    <Image
                      src={previewImages[index] || '/placeholder.webp'}
                      alt={imageLabel}
                      fill
                      className="object-contain p-2 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black text-white w-6 h-6 flex items-center justify-center z-10 rounded-full"
                      aria-label={`Supprimer ${imageLabel.toLowerCase()}`}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <Upload
                      size={24}
                      className={
                        canUpload ? 'text-gray-400 mb-2' : 'text-gray-300 mb-2'
                      }
                      aria-hidden="true"
                    />
                    <p
                      className={`text-sm text-center mb-2 ${canUpload ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      {imageLabel}
                    </p>
                    <p
                      className={`text-xs text-center ${canUpload ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {isMainImage
                        ? 'Obligatoire'
                        : index === 1
                          ? "Ajoutez d'abord la photo principale"
                          : "Ajoutez la 2ème photo d'abord"}
                    </p>
                  </>
                )}
                {canUpload && (
                  <input
                    type="file"
                    id={`image-${index}`}
                    name={`image-${index}`}
                    accept={acceptedFormats}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => onImageUpload(e, index)}
                    aria-label={`Ajouter ${imageLabel.toLowerCase()}`}
                    disabled={!canUpload}
                  />
                )}
              </div>
            );
          })}
        </div>
        {errors.images && (
          <p className="text-red-500 text-sm mt-2" role="alert">
            {errors.images}
          </p>
        )}

        {[0, 1, 2].map(
          index =>
            errors[`image-${index}`] && (
              <p key={index} className="text-red-500 text-sm mt-1" role="alert">
                Photo {index + 1}: {errors[`image-${index}`]}
              </p>
            )
        )}
      </div>
    </fieldset>
  );
};
