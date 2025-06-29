import { NextRequest } from 'next/server'
import { ResponseHelper } from '@/lib/server/utils/responseHelper'

export abstract class BaseController {
  protected handleError(error: unknown, context: string) {
    console.error(`Erreur dans ${context}:`, error)
    
    if (error instanceof Error) {
      return ResponseHelper.error(error.message)
    }
    
    return ResponseHelper.serverError()
  }

  protected extractFormData(req: NextRequest): Promise<FormData> {
    return req.formData()
  }

  protected extractJsonData(req: NextRequest): Promise<unknown> {
    return req.json()
  }

  protected isFormDataRequest(req: NextRequest): boolean {
    const contentType = req.headers.get('content-type') || ''
    return contentType.includes('multipart/form-data')
  }
}