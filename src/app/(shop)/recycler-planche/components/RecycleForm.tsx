'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Recycle } from 'lucide-react';
import { toast } from 'sonner';
import {
  recycleSchema,
  IMAGE_CONFIG,
} from '@/lib/validations/boardsValidation';
import { FormFields } from './FormFields';
import { ImageUpload } from '../../../../components/form/ImageUpload';
import { Spinner } from '@/components/ui/Spinner';
import { BoardCondition, BoardType } from '@/lib/types';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > IMAGE_CONFIG.maxSize) {
      return `La taille de l'image ne doit pas dépasser ${IMAGE_CONFIG.maxSize / (1024 * 1024)}MB`;
    }

    const acceptedTypes = IMAGE_CONFIG.acceptedFormats as readonly string[];
    if (!acceptedTypes.includes(file.type)) {
      return `Format non supporté. Utilisez ${IMAGE_CONFIG.acceptedFormatsDisplay}`;
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
          newImages[index] = reader.result;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setIsRateLimited(false);

    try {
      const formData = new FormData(e.currentTarget);

      const validationData = {
        userId,
        name: formData.get('name') as string,
        boardType: selectedType,
        boardCondition: selectedCondition,
        description: (formData.get('description') as string) || undefined,
        images: selectedFiles,
      };

      const result = recycleSchema.safeParse(validationData);

      if (!result.success) {
        const fieldErrors: FormErrors = {};
        result.error.errors.forEach(
          (error: { path: unknown[]; message: string }) => {
            const field = error.path.join('.');
            fieldErrors[field] = error.message;
          }
        );
        setErrors(fieldErrors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      const apiFormData = new FormData();
      apiFormData.append('userId', userId);
      apiFormData.append('name', result.data.name);
      apiFormData.append('boardCondition', result.data.boardCondition);
      apiFormData.append('boardType', result.data.boardType);

      if (result.data.description) {
        apiFormData.append('description', result.data.description);
      }

      result.data.images.forEach((file: string | Blob) => {
        apiFormData.append('image', file);
      });

      const response = await fetch('/api/used-boards', {
        method: 'POST',
        body: apiFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setIsRateLimited(true);
          toast.error(
            responseData.message ||
              "Tu as atteint la limite d'envoi de planche. Attends 10 minutes avant de pouvoir en renvoyer.."
          );
          return;
        }

        throw new Error(responseData.message || 'Erreur lors de la soumission');
      }

      toast.success(
        "Planche soumise avec succès ! Notre équipe va l'évaluer et te contacter bientôt."
      );

      setSelectedCondition('');
      setSelectedType('');
      setSelectedFiles([]);
      setPreviewImages([]);
      setErrors({});
      setDescriptionLength(0);
      setIsRateLimited(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Erreur soumission:', error);
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                Tu as atteint la limite d&apos;envoi de planche. Attends 10
                minutes avant de pouvoir en renvoyer.
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
        <input type="hidden" name="userId" value={userId} />

        <div>
          <h3 className="text-2xl font-normal mb-8">
            Informations sur ta planche
          </h3>

          <div className="space-y-8">
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
              isSubmitting ||
              isRateLimited
            }
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full font-normal text-lg hover:bg-[#0a4d4f] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                <p className="ml-2">Envoi en cours...</p>
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
              <>
                <Recycle className="mr-2 h-5 w-5" />
                Soumettre ma planche
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
