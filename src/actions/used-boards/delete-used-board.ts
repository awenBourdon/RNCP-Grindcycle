'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UsedBoardService } from '@/lib/server/src/used-boards/used-boards.service';

const usedBoardService = new UsedBoardService();

export async function deleteUsedBoardAction(boardId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== 'ADMIN') {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  try {
    await usedBoardService.deleteUsedBoard(boardId);

    revalidatePath('/admin/planches');
    revalidatePath('/compte/planches');

    return {
      success: true,
      message: 'Planche supprimée avec succès',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
