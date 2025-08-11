'use server';
import { revalidatePath } from 'next/cache';
import { ProductService } from '@/lib/server/services/productService';
import { productSchema } from '@/lib/validations/boardsValidation';
import { ZodHelper } from '@/lib/server/utils/zodHelper';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const productService = new ProductService();

export async function createProductAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  try {
    const validation = ZodHelper.validateFormData(productSchema, formData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.errors,
      };
    }

    const images = formData.getAll('images') as File[];
    const product = await productService.createProduct(
      validation.data!,
      images
    );

    revalidatePath('/admin/produits');
    revalidatePath('/catalogue');
    revalidatePath('/');

    return {
      success: true,
      data: product,
      message: 'Produit créé avec succès',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
