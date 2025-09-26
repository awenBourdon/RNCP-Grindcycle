'use server';
import { revalidatePath } from 'next/cache';
import { recycleSchema } from '@/lib/validations/boards.validation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMIT_MESSAGES,
} from '@/lib/rateLimit';
import { UsedBoardService } from '@/lib/server/used-boards/used-boards.service';

const usedBoardService = new UsedBoardService();

export async function createUsedBoardAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
 
  if (!session) {
    redirect('/authentification/connexion');
  }
  
  const request = new Request('http://localhost', { headers: headersList });
  const ip = getClientIP(request);

  if (!checkRateLimit(ip, 'createUsedBoard')) {
    return {
      success: false,
      error: RATE_LIMIT_MESSAGES.createUsedBoard,
    };
  }
  
  try {
    const data: Record<string, unknown> = {};
    const images = formData.getAll('image') as File[];
    
   for (const [key, value] of formData.entries()) {
      if (key === 'image') {
        continue;
      } else {
        data[key] = value;
      }
    }
    

    data.images = images;
    
    const validation = recycleSchema.safeParse(data);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.error.errors.map(err => err.message),
      };
    } 
    
    if (validation.data.userId !== session.user.id) {
       return {
        success: false,
        error: 'Non autorisé',
      };
    }
    
    const board = await usedBoardService.createUsedBoard(
      validation.data,
      images
    );
    
    revalidatePath('/compte/planches');
    revalidatePath('/admin/planches');
    
     return {
      success: true,
      data: board,
      message: 'Planche soumise avec succès',
    };
  } catch (error) {
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}