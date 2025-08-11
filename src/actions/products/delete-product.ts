'use server';
import { revalidatePath } from 'next/cache';
import { ProductService } from '@/lib/server/services/productService';
import { ZodHelper } from '@/lib/server/utils/zodHelper';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const productService = new ProductService();

const deleteSchema = z.object({
  productId: z.string(),
});

export async function deleteProductAction(productId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== 'ADMIN') {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  try {
    const validation = ZodHelper.validate(deleteSchema, { productId });
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.errors,
      };
    }

    await productService.deleteProduct(productId);

    revalidatePath('/admin/produits');
    revalidatePath('/catalogue');
    revalidatePath('/');

    return {
      success: true,
      message: 'Produit supprimé avec succès',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
