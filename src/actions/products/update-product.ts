'use server';
import { revalidatePath } from 'next/cache';
import { ProductService } from '@/lib/server/services/productService';
import { ZodHelper } from '@/lib/server/utils/zodHelper';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { ProductStatus } from '@/generated/prisma';

const productService = new ProductService();

const updateStatusSchema = z.object({
  productId: z.string(),
  status: z.nativeEnum(ProductStatus),
});

export async function updateProductStatusAction(productId: string, status: ProductStatus) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== 'ADMIN') {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  try {
    const validation = ZodHelper.validate(updateStatusSchema, { productId, status });
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.errors,
      };
    }

    const product = await productService.updateProductStatus(productId, status);

    revalidatePath('/admin/produits');
    revalidatePath('/catalogue');
    revalidatePath('/');

    return {
      success: true,
      data: product,
      message: 'Statut du produit mis à jour avec succès',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}