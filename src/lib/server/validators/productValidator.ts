// // TODO : faire du DRY avec Zod -> overkill
import { BoardType } from '@/generated/prisma'
import { BaseValidator } from '@/lib/server/utils/baseValidator'
import { ValidationResult } from '@/lib/server/types/api'
import { CreateProductData, PurchaseProductData } from '@/lib/server/types/product'

export class ProductValidator extends BaseValidator {
  static validateCreateData(formData: FormData): ValidationResult & { data?: Omit<CreateProductData, 'imageUrl'> } {
    const errors: string[] = []
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const priceEuroStr = formData.get('priceEuro') as string
    const pricePointsStr = formData.get('pricePoints') as string
    const usedBoardId = formData.get('usedBoardId') as string


    const nameError = this.validateRequired(name, 'Nom')
    if (nameError) errors.push(nameError)

    const typeError = this.validateEnum(type, BoardType, 'Type de planche')
    if (typeError) errors.push(typeError)

    let priceEuro = 0
    if (!priceEuroStr || priceEuroStr.trim() === '') {
      errors.push('Prix en euros est requis')
    } else {
      priceEuro = parseFloat(priceEuroStr)
      if (isNaN(priceEuro)) {
        errors.push('Prix en euros doit être un nombre valide')
      } else if (priceEuro < 0) {
        errors.push('Prix en euros doit être positif')
      }
    }

    let pricePoints = 0
    if (!pricePointsStr || pricePointsStr.trim() === '') {
      errors.push('Prix en points est requis')
    } else {
      pricePoints = parseInt(pricePointsStr)
      if (isNaN(pricePoints)) {
        errors.push('Prix en points doit être un nombre entier valide')
      } else if (pricePoints < 0) {
        errors.push('Prix en points doit être positif')
      } else if (!Number.isInteger(pricePoints)) {
        errors.push('Prix en points doit être un nombre entier')
      }
    }

    const usedBoardIdError = this.validateRequired(usedBoardId, 'ID de la planche d\'occasion')
    if (usedBoardIdError) {
      errors.push(usedBoardIdError)
    } else {
      const uuidError = this.validateUUID(usedBoardId, 'ID de la planche d\'occasion')
      if (uuidError) errors.push(uuidError)
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      ...(isValid && {
        data: {
          name: name.trim(),
          description: description?.trim() || undefined,
          type: type as BoardType,
          priceEuro,
          pricePoints,
          usedBoardId: usedBoardId.trim(),
        }
      })
    }
  }

  static validatePurchaseData(body: unknown): ValidationResult & { data?: PurchaseProductData } {
    const errors: string[] = []

    if (!body || typeof body !== 'object') {
      errors.push('Corps de la requête invalide')
      return { isValid: false, errors }
    }

    const { productId, userId } = body as Record<string, unknown>

    const productIdError = this.validateRequired(productId, 'ID du produit')
    if (productIdError) {
      errors.push(productIdError)
    } else {
      const uuidError = this.validateUUID(productId, 'ID du produit')
      if (uuidError) errors.push(uuidError)
    }

    const userIdError = this.validateRequired(userId, 'ID de l\'utilisateur')
    if (userIdError) {
      errors.push(userIdError)
    } else {
      const uuidError = this.validateUUID(userId, 'ID de l\'utilisateur')
      if (uuidError) errors.push(uuidError)
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      ...(isValid && {
        data: {
          productId: productId as string,
          userId: userId as string
        }
      })
    }
  }

  static validateDeleteData(body: unknown): ValidationResult & { data?: { productId: string } } {
    const errors: string[] = []

    if (!body || typeof body !== 'object') {
      errors.push('Corps de la requête invalide')
      return { isValid: false, errors }
    }

    const { productId } = body as Record<string, unknown>

    const productIdError = this.validateRequired(productId, 'ID du produit')
    if (productIdError) {
      errors.push(productIdError)
    } else {
      const uuidError = this.validateUUID(productId, 'ID du produit')
      if (uuidError) errors.push(uuidError)
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      ...(isValid && {
        data: { productId: productId as string }
      })
    }
  }
}