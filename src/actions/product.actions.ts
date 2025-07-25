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
    const product = await productService.createProduct(validation.data!, images);

    revalidatePath('/admin/produits');
    revalidatePath('/catalogue');
    revalidatePath('/');

    return {
      success: true,
      data: product,
      message: 'Produit créé avec succès',
    };
  } catch (error) {
    console.error('Erreur création produit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}

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
    await productService.deleteProduct(productId);

    revalidatePath('/admin/produits');
    revalidatePath('/catalogue');
    revalidatePath('/');

    return {
      success: true,
      message: 'Produit supprimé avec succès',
    };
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}

export async function purchaseProductAction(productId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return {
      success: false,
      error: 'Non connecté',
    };
  }

  try {
    const result = await productService.purchaseProduct({
      productId,
      userId: session.user.id,
    });

    revalidatePath('/catalogue');
    revalidatePath('/compte/favoris');
    revalidatePath(`/produit/${productId}`);

    return {
      success: true,
      data: result,
      message: 'Produit acheté avec succès',
    };
  } catch (error) {
    console.error('Erreur achat produit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}