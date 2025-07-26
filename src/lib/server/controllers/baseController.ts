import { ResponseHelper } from '@/lib/server/utils/responseHelper';

export abstract class BaseController {
  protected handleError(error: unknown, context: string) {
    console.error(`Erreur dans ${context}:`, error);

    if (error instanceof Error) {
      return ResponseHelper.error(error.message);
    }

    return ResponseHelper.serverError();
  }
}
