'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { ProductService } from '@/lib/server/products/products.service';

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
    const validation = deleteSchema.safeParse({ productId });
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.error.errors.map(err => err.message),
      };
    }

    await productService.deleteProduct(validation.data.productId);

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