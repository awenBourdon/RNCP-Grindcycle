import { NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/server/types/api'
import { HTTP_STATUS, API_MESSAGES } from '@/lib/server/config/constants'

export class ResponseHelper {
  /**
   * Réponse de succès avec données
   */
  static success<T>(
    data: T, 
    message?: string, 
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message })
    }
    return NextResponse.json(response, { status })
  }

  /**
   * Réponse de succès simple avec message
   */
  static successMessage(
    message: string, 
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response: ApiResponse = {
      success: true,
      message
    }
    return NextResponse.json(response, { status })
  }

  /**
   * Réponse d'erreur générique
   */
  static error(
    error: string, 
    status: number = HTTP_STATUS.BAD_REQUEST, 
    details?: string[]
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error,
      ...(details && { details })
    }
    return NextResponse.json(response, { status })
  }

  /**
   * Erreur de validation
   */
  static validationError(errors: string[]): NextResponse {
    return this.error(
      API_MESSAGES.INVALID_DATA, 
      HTTP_STATUS.UNPROCESSABLE_ENTITY, 
      errors
    )
  }

  /**
   * Erreur serveur
   */
  static serverError(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.SERVER_ERROR, 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }

  /**
   * Ressource non trouvée
   */
  static notFound(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.NOT_FOUND, 
      HTTP_STATUS.NOT_FOUND
    )
  }

  /**
   * Non autorisé
   */
  static unauthorized(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.UNAUTHORIZED, 
      HTTP_STATUS.UNAUTHORIZED
    )
  }

  /**
   * Accès interdit
   */
  static forbidden(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.FORBIDDEN, 
      HTTP_STATUS.FORBIDDEN
    )
  }

  /**
   * Conflit (ressource déjà existante)
   */
  static conflict(message: string): NextResponse {
    return this.error(message, HTTP_STATUS.CONFLICT)
  }

  /**
   * Création réussie
   */
  static created<T>(data: T, message?: string): NextResponse {
    return this.success(data, message, HTTP_STATUS.CREATED)
  }

  /**
   * Réponse vide (No Content)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  /**
   * Redirection
   */
  static redirect(url: string, permanent: boolean = false): NextResponse {
    const status = permanent ? 301 : 302
    return NextResponse.redirect(url, status)
  }

  /**
   * Réponse avec headers personnalisés
   */
  static withHeaders<T>(
    data: T,
    headers: Record<string, string>,
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response = NextResponse.json({
      success: true,
      data
    }, { status })

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

//   /**
//    * Réponse de téléchargement de fichier
//    */
//   static download(
//     data: Buffer | Uint8Array,
//     filename: string,
//     mimeType: string = 'application/octet-stream'
//   ): NextResponse {
//     const response = new NextResponse(data, {
//       status: HTTP_STATUS.OK,
//       headers: {
//         'Content-Type': mimeType,
//         'Content-Disposition': `attachment; filename="${filename}"`,
//         'Cache-Control': 'no-cache'
//       }
//     })

//     return response
//   }
 }