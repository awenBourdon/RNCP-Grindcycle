'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { UsedBoardService } from '@/lib/server/used-boards/used-boards.service';
import { UsedBoardStatus, UserRole } from '@/lib/utils/enums/enums';

const usedBoardService = new UsedBoardService();

const updateSchema = z.object({
  boardId: z.string(),
  status: z.nativeEnum(UsedBoardStatus).optional(),
  pointsAwarded: z.number().optional(),
});

export async function updateUsedBoardAction(
  boardId: string,
  status?: UsedBoardStatus,
  pointsAwarded?: number
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session || session.user.role !== UserRole.ADMIN) {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  try {
    const validation = updateSchema.safeParse({
      boardId,
      status,
      pointsAwarded,
    });

    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.error.errors.map(err => err.message),
      };
    }

    const { boardId: validatedBoardId, ...updateData } = validation.data;

    const result = await usedBoardService.updateUsedBoardStatus(
      validatedBoardId,
      updateData
    );

    revalidatePath('/admin/planches');
    revalidatePath('/compte/planches');
    revalidatePath('/compte/notifications');

    return {
      success: true,
      data: result,
      message: 'Planche mise à jour avec succès',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}