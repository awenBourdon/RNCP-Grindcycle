'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { ProductService } from '@/lib/server/products/products.service';
import { ImageService } from '@/lib/server/upload-images/images.service';
import { UserRole, BoardType } from '@/generated/prisma';

const productService = new ProductService();
const imageService = new ImageService('products');

const updateProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(BoardType),
  priceEuro: z.number().min(0.01),
  pricePoints: z.number().min(1),
  usedBoardId: z.string().optional().nullable(),
});

export async function updateProductDetailsAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== UserRole.ADMIN) {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  const productId = formData.get('productId') as string;
  if (!productId) {
    return { success: false, error: 'ID produit manquant' };
  }

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    type: formData.get('type'),
    priceEuro: Number(formData.get('priceEuro')),
    pricePoints: Number(formData.get('pricePoints')),
    usedBoardId: formData.get('usedBoardId'),
  };

  const validation = updateProductSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: 'Données invalides',
      details: validation.error.errors.map((e) => e.message),
    };
  }


  const keptImages = formData.getAll('keptImages') as string[];
  
  const newFiles = formData.getAll('newImages') as File[];
  const validNewFiles = newFiles.filter(f => f.size > 0 && f.name !== 'undefined');

  if (keptImages.length + validNewFiles.length === 0) {
    return { success: false, error: 'Au moins une image est requise' };
  }
  if (keptImages.length + validNewFiles.length > 3) {
    return { success: false, error: 'Maximum 3 images au total' };
  }

  try {
    let finalImageUrls = [...keptImages];

    if (validNewFiles.length > 0) {
      const uploadResult = await imageService.uploadMultiple(validNewFiles);
      if (!uploadResult.success) {
        return { success: false, error: `Erreur upload: ${uploadResult.errors.join(', ')}` };
      }
      finalImageUrls = [...finalImageUrls, ...uploadResult.urls];
    }

    await productService.updateProduct(productId, {
      ...validation.data,
      imageUrl: finalImageUrls,
    });

    revalidatePath('/admin/produits');
    revalidatePath(`/admin/produits/${productId}`);
    revalidatePath(`/produit/${productId}`);
    revalidatePath('/catalogue');

    return {
      success: true,
      message: 'Produit mis à jour avec succès',
    };
  } catch (error) {
    console.error('Update Product Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    };
  }
}
