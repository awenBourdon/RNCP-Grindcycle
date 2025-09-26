'use server';
import { revalidatePath } from 'next/cache';
import { ProductService } from '@/server/products/products.service';
import { productSchema } from '@/lib/validations/boards.validation';
import { auth } from '@/lib/utils/auth';
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
    const data: Record<string, unknown> = {};
    const images = formData.getAll('images') as File[];
    data.images = images;

    for (const [key, value] of formData.entries()) {
      if (key === 'images') {
        continue;
      } else if (key === 'priceEuro' || key === 'pricePoints') {
        const numValue = parseFloat(value as string);
        data[key] = isNaN(numValue) ? value : numValue;
      } else {
        data[key] = value;
      }
    }

    const validation = productSchema.safeParse(data);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.error.errors.map(err => err.message),
      };
    }

    const product = await productService.createProduct(
      validation.data,
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