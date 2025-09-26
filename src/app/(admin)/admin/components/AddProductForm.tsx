'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ZodError } from 'zod';
import {
  IMAGE_CONFIG,
  productSchema,
} from '@/lib/validations/boards.validation';
import { ProductFormFields } from './ProductFormFields';
import { createProductAction } from '@/actions/products/add-product';
import { updateUsedBoardAction } from '@/actions/used-boards/update-used-board';
import { UsedBoardStatus } from '@/generated/prisma';
import { ImageUpload } from '@/app/components/form/ImageUpload';
import { Spinner } from '@/app/components/ui/Spinner';

interface UsedBoard {
  id: string;
  name: string;
  status: string;
}

interface AddProductFormProps {
  usedBoards: UsedBoard[];
}

interface FormData {
  name: string;
  description: string;
  type: string;
  priceEuro: number;
  pricePoints: number;
  usedBoardId: string;
}

interface FormErrors {
  [key: string]: string;
}

export const AddProductForm = ({ usedBoards }: AddProductFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: '',
    priceEuro: 0,
    pricePoints: 0,
    usedBoardId: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const availableUsedBoards = usedBoards.filter(
    board => board.status === 'RECEIVED'
  );

  const validateFile = (file: File): string | null => {
    if (file.size > IMAGE_CONFIG.maxSize) {
      return `Fichier trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)}MB) - Maximum ${IMAGE_CONFIG.maxSizeMB}MB`;
    }
    if (
      !(IMAGE_CONFIG.acceptedFormats as readonly string[]).includes(file.type)
    ) {
      return `Format non supporté. Utilisez ${IMAGE_CONFIG.acceptedFormatsDisplay}`;
    }
    return null;
  };

  const validateFormData = () => {
    setErrors({});
    try {
      const completeFormData = {
        ...formData,
        images: selectedFiles,
        usedBoardId: formData.usedBoardId || null,
      };
      productSchema.parse(completeFormData);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: FormErrors = {};
        error.errors.forEach(err => {
          const field = err.path.join('.');
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
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
      setSelectedFiles(newFiles.filter(Boolean));

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
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);

    const newErrors = { ...errors };
    delete newErrors[`image-${index}`];
    setErrors(newErrors);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'priceEuro' || name === 'pricePoints' ? Number(value) : value,
    }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    if (!validateFormData()) {
      setIsPending(false);
      toast.error('Erreurs dans le formulaire');
      return;
    }

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'usedBoardId' && !value) {
          return;
        }
        formDataToSend.append(key, value.toString());
      });

      selectedFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const productResult = await createProductAction(formDataToSend);

      if (!productResult.success) {
        toast.error(productResult.error);
        return;
      }

      if (formData.usedBoardId) {
        const updateResult = await updateUsedBoardAction(
          formData.usedBoardId,
          UsedBoardStatus.RECYCLED_TO_PRODUCT
        );

        if (!updateResult.success) {
          toast.error(
            `Produit créé mais erreur mise à jour planche: ${updateResult.error}`
          );
          return;
        }

        toast.success(
          'Produit créé avec succès ! La planche a été marquée comme recyclée.'
        );
      } else {
        toast.success('Produit créé avec succès !');
      }

      setFormData({
        name: '',
        description: '',
        type: '',
        priceEuro: 0,
        pricePoints: 0,
        usedBoardId: '',
      });
      setSelectedFiles([]);
      setPreviewImages([]);
      setErrors({});

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
            Remplissez ce formulaire pour ajouter un nouveau produit au
            catalogue. Vous pouvez créer un produit indépendant ou recycler une
            planche reçue.
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
              selectedFiles.length === 0 ||
              isPending
            }
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
