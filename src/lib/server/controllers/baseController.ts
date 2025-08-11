import { ResponseHelper } from '@/lib/server/utils/responseHelper';

export abstract class BaseController {
  protected handleError(error: unknown) {

    if (error instanceof Error) {
      return ResponseHelper.error(error.message);
    }

    return ResponseHelper.serverError();
  }
}
