'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { ProductStatus } from '@/generated/prisma';
import { ProductService } from '@/lib/server/products/products.service';

const productService = new ProductService();

const updateStatusSchema = z.object({
  productId: z.string(),
  status: z.nativeEnum(ProductStatus),
});

export async function updateProductStatusAction(
  productId: string, 
  status: ProductStatus
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session || session.user.role !== 'ADMIN') {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  try {
    const validation = updateStatusSchema.safeParse({ productId, status });
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.error.errors.map(err => err.message),
      };
    }

    const product = await productService.updateProductStatus(
      validation.data.productId, 
      validation.data.status
    );

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