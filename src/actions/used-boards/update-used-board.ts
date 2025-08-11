'use server';
import { revalidatePath } from 'next/cache';
import { UsedBoardService } from '@/lib/server/services/usedBoardService';
import { ZodHelper } from '@/lib/server/utils/zodHelper';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { UsedBoardStatus } from '@/generated/prisma';

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

  if (!session || session.user.role !== 'ADMIN') {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  try {
    const validation = ZodHelper.validate(updateSchema, {
      boardId,
      status,
      pointsAwarded,
    });

    if (!validation.isValid) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.errors,
      };
    }

    const { boardId: validatedBoardId, ...updateData } = validation.data!;

    const result = await usedBoardService.updateUsedBoard(
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
