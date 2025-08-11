'use server';
import { revalidatePath } from 'next/cache';
import { UsedBoardService } from '@/lib/server/services/usedBoardService';
import { recycleSchema } from '@/lib/validations/boardsValidation';
import { ZodHelper } from '@/lib/server/utils/zodHelper';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMIT_MESSAGES,
} from '@/lib/rateLimit';

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
    const validation = ZodHelper.validateFormData(recycleSchema, formData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.errors,
      };
    }

    if (validation.data!.userId !== session.user.id) {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    const images = formData.getAll('image') as File[];
    const board = await usedBoardService.createUsedBoard(
      validation.data!,
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
    console.error('Erreur création planche:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
