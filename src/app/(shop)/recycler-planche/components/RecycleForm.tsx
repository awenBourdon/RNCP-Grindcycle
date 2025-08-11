'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Recycle } from 'lucide-react';
import { toast } from 'sonner';
import { FormFields } from './FormFields';
import { ImageUpload } from '../../../../components/form/ImageUpload';
import { Spinner } from '@/components/ui/Spinner';
import { BoardCondition, BoardType } from '@/lib/types';
import {
  recycleSchema,
  IMAGE_CONFIG,
} from '@/lib/validations/boardsValidation';
import { createUsedBoardAction } from '@/actions/used-boards/add-used-board.action';

interface RecycleFormProps {
  userId: string;
}

interface FormErrors {
  [key: string]: string;
}

export const RecycleForm = ({ userId }: RecycleFormProps) => {
  const [selectedCondition, setSelectedCondition] = useState<
    BoardCondition | ''
  >('');
  const [selectedType, setSelectedType] = useState<BoardType | ''>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateFile = (file: File): string | null => {
    if (file.size > IMAGE_CONFIG.maxSize) {
      return `Image trop volumineuse (${(file.size / (1024 * 1024)).toFixed(1)}MB) - Max: ${IMAGE_CONFIG.maxSize / (1024 * 1024)}MB`;
    }
    const acceptedTypes = IMAGE_CONFIG.acceptedFormats as readonly string[];
    if (!acceptedTypes.includes(file.type)) {
      return `Format non supporté. Formats acceptés : ${IMAGE_CONFIG.acceptedFormatsDisplay}`;
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileError = validateFile(file);
      if (fileError) {
        const newErrors = { ...errors };
        newErrors[`image-${index}`] = fileError;

        if (file.size > IMAGE_CONFIG.maxSize) {
          newErrors[`image-${index}`] =
            `Fichier trop volumineux (${formatFileSize(file.size)}) - Maximum ${IMAGE_CONFIG.maxSize / (1024 * 1024)}MB`;
        }
        setErrors(newErrors);
        return;
      }

      const newFiles = [...selectedFiles];
      newFiles[index] = file;
      setSelectedFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newImages = [...previewImages];
          newImages[index] = reader.result as string;
          setPreviewImages(newImages);
        }
      };
      reader.readAsDataURL(file);

      const newErrors = { ...errors };
      delete newErrors[`image-${index}`];
      delete newErrors.images;
      setErrors(newErrors);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    const newImages = [...previewImages];
    newImages[index] = '';
    setPreviewImages(newImages);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrors({});
    setIsRateLimited(false);

    const formData = new FormData(e.currentTarget);
    formData.append('userId', userId);
    formData.append('boardType', selectedType);
    formData.append('boardCondition', selectedCondition);

    selectedFiles.forEach(file => {
      formData.append('image', file);
    });

    const validation = recycleSchema.safeParse({
      userId,
      name: formData.get('name') as string,
      boardType: selectedType,
      boardCondition: selectedCondition,
      description: (formData.get('description') as string) || undefined,
      images: selectedFiles,
    });

    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      validation.error.errors.forEach(err => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      setIsPending(false);
      return;
    }

    const result = await createUsedBoardAction(formData);

    if (result.success) {
      toast.success(result.message || 'Planche soumise avec succès !');
      setSelectedCondition('');
      setSelectedType('');
      setSelectedFiles([]);
      setPreviewImages([]);
      setErrors({});
      setDescriptionLength(0);
      setIsRateLimited(false);
      (e.target as HTMLFormElement).reset();
    } else {
      if (result.error?.toLowerCase().includes('limite')) {
        setIsRateLimited(true);
      }
      toast.error('Erreur lors de la soumission');
    }

    setIsPending(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
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

      {isRateLimited && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            Tu as atteint la limite d&apos;envoi de planche. Attends 10 minutes
            avant de pouvoir en renvoyer.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-16"
        encType="multipart/form-data"
      >
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium text-[#010101] mb-6">
            Informations sur ta planche
          </h3>
          <div className="space-y-6">
            <FormFields
              selectedType={selectedType}
              selectedCondition={selectedCondition}
              errors={errors}
              descriptionLength={descriptionLength}
              onTypeSelect={setSelectedType}
              onConditionSelect={setSelectedCondition}
              onDescriptionChange={setDescriptionLength}
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
              !selectedCondition ||
              !selectedType ||
              selectedFiles.length === 0 ||
              isPending ||
              isRateLimited
            }
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full font-normal text-lg hover:bg-[#0a4d4f] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer "
          >
            {isPending ? (
              <>
                <Spinner />
                <span className="ml-2">Envoi en cours...</span>
              </>
            ) : isRateLimited ? (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Limite atteinte
              </>
            ) : (
              <div className="flex items-center">
                <Recycle className="mr-2 h-5 w-5" />
                Soumettre ma planche
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
