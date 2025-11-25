'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { ImageUpload } from '@/app/(shop)/recycler-planche/components/ImageUpload';
import { UPLOAD_CONFIG } from '@/lib/server/upload-images/upload';
import { productSchema } from '@/lib/validations/boards.validation';
import { ProductFormFields } from './ProductFormFields';
import { createProductAction } from '@/actions/products/add-product';
import { updateUsedBoardAction } from '@/actions/used-boards/update-used-board';
import { UsedBoardStatus } from '@/lib/utils/enums/enums';
import { UsedBoard } from '@/lib/utils/types/types';

interface AddProductFormProps {
  usedBoards: UsedBoard[];
}

interface FormErrors {
  [key: string]: string;
}

export const AddProductForm = ({ usedBoards }: AddProductFormProps) => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('');
  const [priceEuro, setPriceEuro] = useState(0);
  const [pricePoints, setPricePoints] = useState(0);
  const [usedBoardId, setUsedBoardId] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const availableUsedBoards = usedBoards.filter(
    board => board.status === UsedBoardStatus.RECEIVED
  );

  const validateFile = (file: File): string | null => {
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return `Fichier trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)}MB) - Maximum ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`;
    }
    const acceptedTypes = UPLOAD_CONFIG.allowedMimeTypes as readonly string[];
    if (!acceptedTypes.includes(file.type)) {
      return `Format non supporté. Formats acceptés: JPG, PNG, WebP`;
    }
    return null;
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const validation = productSchema.safeParse({
      name,
      description,
      type,
      priceEuro,
      pricePoints,
      usedBoardId: usedBoardId || null,
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('description', description);
      formDataToSend.append('type', type);
      formDataToSend.append('priceEuro', priceEuro.toString());
      formDataToSend.append('pricePoints', pricePoints.toString());

      if (usedBoardId) {
        formDataToSend.append('usedBoardId', usedBoardId);
      }

      selectedFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const productResult = await createProductAction(formDataToSend);

      if (!productResult.success) {
        toast.error(productResult.error);
        setIsPending(false);
        return;
      }

      if (usedBoardId) {
        const updateResult = await updateUsedBoardAction(
          usedBoardId,
          UsedBoardStatus.RECYCLED_TO_PRODUCT
        );

        if (!updateResult.success) {
          toast.error(
            `Produit créé mais erreur mise à jour planche: ${updateResult.error}`
          );
          setIsPending(false);
          return;
        }

        toast.success(
          'Produit créé avec succès ! La planche a été marquée comme recyclée.'
        );
      } else {
        toast.success('Produit créé avec succès !');
      }

      setName('');
      setDescription('');
      setType('');
      setPriceEuro(0);
      setPricePoints(0);
      setUsedBoardId('');
      setSelectedFiles([]);
      setPreviewImages([]);
      setErrors({});

      (e.target as HTMLFormElement).reset();

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="bg-[#0a3d3f] p-3 rounded-full text-white">
          <Upload size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-normal text-[#010101] mb-2">
            Ajouter un nouveau produit
          </h2>
          <p className="text-gray-600 max-w-3xl">
            Remplis ce formulaire pour ajouter un nouveau produit au catalogue.
            Tu peux créer un produit indépendant ou recycler une planche reçue.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        encType="multipart/form-data"
        autoComplete="off"
      >
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium text-[#010101] mb-6">
            Informations sur le produit
          </h3>
          <div className="space-y-6">
            <ProductFormFields
              name={name}
              description={description}
              type={type}
              priceEuro={priceEuro}
              pricePoints={pricePoints}
              usedBoardId={usedBoardId}
              availableUsedBoards={availableUsedBoards}
              errors={errors}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onTypeChange={setType}
              onPriceEuroChange={(value: string) =>
                setPriceEuro(value ? parseFloat(value) : 0)
              }
              onPricePointsChange={(value: string) =>
                setPricePoints(value ? parseFloat(value) : 0)
              }
              onUsedBoardIdChange={setUsedBoardId}
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
            disabled={!type || !name || selectedFiles.length === 0 || isPending}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full font-normal text-lg hover:bg-[#0a4d4f] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Spinner />
                <span className="ml-2">Création en cours...</span>
              </>
            ) : (
              <div className="flex items-center cursor-pointer">
                <Upload className="mr-2 h-5 w-5" />
                Ajouter au catalogue
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
