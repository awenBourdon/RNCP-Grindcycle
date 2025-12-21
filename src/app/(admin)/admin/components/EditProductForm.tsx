'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Save, X, ImageIcon, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { updateProductDetailsAction } from '@/actions/products/update-product-details';
import { UsedBoardStatus } from '@/lib/utils/enums/enums';
import { UsedBoard, Product } from '@/lib/utils/types/types';
import { ImageFileGuardValidation } from '@/lib/validations/images.validations';
import { ProductFormFields } from './ProductFormFields';
import Image from 'next/image';

interface ProductWithRelations extends Product {
  usedBoardId?: string | null;
  usedBoard?: UsedBoard | null;
}

interface EditProductFormProps {
  product: ProductWithRelations;
  usedBoards: UsedBoard[];
}

interface FormDataState {
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

export const EditProductForm = ({
  product,
  usedBoards,
}: EditProductFormProps) => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormDataState>({
    name: product.name,
    description: product.description || '',
    type: product.type,
    priceEuro: product.priceEuro,
    pricePoints: product.pricePoints,
    usedBoardId: product.usedBoardId || '',
  });

  const [keptImages, setKeptImages] = useState<string[]>(product.imageUrl);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const availableUsedBoards = usedBoards.filter(
    board =>
      board.status === UsedBoardStatus.RECEIVED ||
      board.id === product.usedBoardId
  );

  const validateFormData = () => {
    setErrors({});
    if (keptImages.length === 0 && newFiles.length === 0) {
      setErrors({ images: 'Au moins une image est requise' });
      return false;
    }

    try {
      if (!formData.name) throw { path: ['name'], message: 'Nom requis' };
      if (!formData.type) throw { path: ['type'], message: 'Type requis' };
      if (formData.priceEuro < 0)
        throw { path: ['priceEuro'], message: 'Prix invalide' };

      return true;
    } catch (error: any) {
      setErrors({ [error.path[0]]: error.message });
      return false;
    }
  };

  const handleNewImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (keptImages.length + newFiles.length >= 3) {
      toast.error('Maximum 3 images');
      return;
    }

    const validation = await ImageFileGuardValidation.validateImage(file);
    if (!validation.isValid) {
      toast.error(validation.errors[0] || 'Image invalide');
      return;
    }

    setNewFiles([...newFiles, file]);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPreviews([...newPreviews, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removeKeptImage = (index: number) => {
    setKeptImages(keptImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    if (!validateFormData()) {
      setIsPending(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('productId', product.id);
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('priceEuro', formData.priceEuro.toString());
      data.append('pricePoints', formData.pricePoints.toString());
      if (formData.usedBoardId) {
        data.append('usedBoardId', formData.usedBoardId);
      }

      keptImages.forEach(url => data.append('keptImages', url));
      newFiles.forEach(file => data.append('newImages', file));

      const result = await updateProductDetailsAction(data);

      if (result.success) {
        toast.success('Produit mis à jour avec succès');
        router.refresh();
        router.push('/admin/produits');
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur inattendue');
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const allImages = [
    ...keptImages.map((src, i) => ({ type: 'kept', src, index: i })),
    ...newPreviews.map((src, i) => ({ type: 'new', src, index: i })),
  ];

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="bg-[#0a3d3f] p-3 rounded-full text-white">
          <Upload size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-normal text-[#010101] mb-2">
            Modifier le produit
          </h2>
          <p className="text-gray-600">
            Mets à jour les informations du produit ou ses images.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium text-[#010101] mb-6">
            Informations
          </h3>
          <ProductFormFields
            formData={formData}
            availableUsedBoards={availableUsedBoards}
            errors={errors}
            onChange={handleChange}
          />

          <div className="mt-8">
            <legend className="block text-sm text-gray-600 mb-3">
              Photos du produit <span className="text-red-500">*</span>
            </legend>
            <div className="bg-[#f8f7f4] p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-6">
                <Info size={16} className="text-gray-600" />
                <p className="text-sm text-gray-600">
                  Gére les images existantes ou ajoutez-en de nouvelles (Max 3).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map(slotIndex => {
                  const image = allImages[slotIndex];
                  const isSlotEmpty = !image;

                  return (
                    <div
                      key={slotIndex}
                      className={`border border-dashed rounded-lg bg-white p-4 flex flex-col items-center justify-center h-40 relative ${
                        !isSlotEmpty ? 'border-[#0a3d3f]' : 'border-gray-200'
                      }`}
                    >
                      {image ? (
                        <>
                          <Image
                            src={image.src}
                            alt={`Produit ${slotIndex}`}
                            fill
                            className="object-contain p-2 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              image.type === 'kept'
                                ? removeKeptImage(image.index)
                                : removeNewImage(image.index)
                            }
                            className="absolute top-2 right-2 bg-black text-white w-6 h-6 flex items-center justify-center z-10 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="text-gray-300 mb-2" />
                          <span className="text-sm text-gray-400">
                            Emplacement libre
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleNewImageUpload}
                            disabled={allImages.length >= 3}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 bg-white border border-gray-200 cursor-pointer text-gray-700 rounded-full font-normal text-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer font-normal text-lg hover:bg-[#0a4d4f] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Spinner />
                <span className="ml-2">Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
