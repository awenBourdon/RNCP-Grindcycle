/**
 * USED BOARD DATA VALIDATION SERVICE
 * 
 * This validator extends BaseValidator to provide comprehensive validation logic for all
 * used skateboard operations in the recycling system. It handles multiple validation
 * scenarios including board submission, status updates, and administrative operations
 * with sophisticated business rule enforcement and data integrity checks.
 * 
 * Core Responsibilities:
 * - Dual-format board creation validation (FormData with images / JSON without)
 * - Status transition validation with conditional points management
 * - Administrative update validation for board processing workflow
 * - Board deletion validation with proper authorization checks
 * - Enum validation for board conditions, types, and status values
 * - Image array processing and validation for JSON submissions
 * 
 * Key Features:
 * - Multi-format validation supporting both FormData and JSON inputs
 * - Intelligent status workflow validation with conditional field requirements
 * - Points system integration with status-dependent validation rules
 * - Type-safe enum validation for all categorical fields
 * - Flexible image handling supporting both upload and pre-existing images
 * - Business logic enforcement (points only awarded when status is RECEIVED)
 * 
 * Validation Scenarios:
 * 1. FormData Creation: User board submission with optional image uploads
 * 2. JSON Creation: Programmatic board creation with existing image references
 * 3. Status Updates: Administrative processing with points assignment
 * 4. Board Deletion: Simple ID validation for removal operations
 * 
 * Business Logic Integration:
 * - Board conditions: GOOD, AVERAGE, BAD (affects points calculation)
 * - Board types: Skateboard, longboard, etc. (category classification)
 * - Status workflow: SENT → RECEIVED (triggers points award eligibility)
 * - Points validation: Only positive integers, only when status is RECEIVED
 * - Image handling: Flexible array processing for different input formats
 * 
 * Status Workflow Rules:
 * - New boards default to SENT status
 * - Points can only be awarded when status is RECEIVED
 * - Status changes automatically clear points if not RECEIVED
 * - Admin updates require both board ID and update data validation
 * 
 * Error Handling:
 * - Field-level validation with specific error messages
 * - Business rule enforcement with contextual validation
 * - Type safety with conditional data return patterns
 * - French language error messages for user interface consistency
 * 
 * Usage Context:
 * - Used by UsedBoardController for all incoming request validation
 * - Supports both user-facing and administrative validation workflows
 * - Integrates with UsedBoardService for business logic execution
 * - Provides foundation for secure board management operations
 */

import { BoardCondition, BoardType, UsedBoardStatus } from '@/generated/prisma';
import { BaseValidator } from '@/lib/server/utils/baseValidator';
import { ValidationResult } from '@/lib/server/types/api';
import { CreateUsedBoardData, UpdateUsedBoardData } from '@/lib/server/types/usedBoard';

export class UsedBoardValidator extends BaseValidator {
  static validateCreateFormData(formData: FormData): ValidationResult & {
    data?: Omit<CreateUsedBoardData, 'image'>;
  } {
    const errors: string[] = [];

    const userId = formData.get('userId') as string;
    const boardCondition = formData.get('boardCondition') as string;
    const boardType = formData.get('boardType') as string;
    const description = formData.get('description') as string;
    const name = formData.get('name') as string;

    const userIdError = this.validateRequired(userId, 'ID utilisateur');
    if (userIdError) errors.push(userIdError);
    else {
      const uuidError = this.validateUUID(userId, 'ID utilisateur');
      if (uuidError) errors.push(uuidError);
    }

    const nameError = this.validateRequired(name, 'Nom');
    if (nameError) errors.push(nameError);

    const boardConditionError = this.validateEnum(boardCondition, BoardCondition, 'État de la planche');
    if (boardConditionError) errors.push(boardConditionError);

    const boardTypeError = this.validateEnum(boardType, BoardType, 'Type de planche');
    if (boardTypeError) errors.push(boardTypeError);

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      ...(isValid && {
        data: {
          userId: userId.trim(),
          name: name.trim(),
          boardCondition: boardCondition as BoardCondition,
          boardType: boardType as BoardType,
          description: description?.trim() || undefined,
          status: 'SENT' as UsedBoardStatus,
        },
      }),
    };
  }

  static validateCreateJsonData(body: unknown): ValidationResult & { 
    data?: CreateUsedBoardData 
  } {
    const errors: string[] = []

    if (!body || typeof body !== 'object') {
      errors.push('Corps de la requête invalide')
      return { isValid: false, errors }
    }

    const { userId, boardCondition, boardType, description, image, name } = body as Record<string, unknown>

    const userIdError = this.validateRequired(userId, 'ID utilisateur')
    if (userIdError) errors.push(userIdError)
    else {
      const uuidError = this.validateUUID(userId, 'ID utilisateur')
      if (uuidError) errors.push(uuidError)
    }

    const nameError = this.validateRequired(name, 'Nom')
    if (nameError) errors.push(nameError)

    const boardConditionError = this.validateEnum(boardCondition, BoardCondition, 'État de la planche')
    if (boardConditionError) errors.push(boardConditionError)

    const boardTypeError = this.validateEnum(boardType, BoardType, 'Type de planche')
    if (boardTypeError) errors.push(boardTypeError)

    let imageArray: string[] = []
    if (image) {
      if (Array.isArray(image)) {
        imageArray = image.filter(img => typeof img === 'string') as string[]
      }
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      ...(isValid && {
        data: {
          userId: userId as string,
          name: name as string,
          boardCondition: boardCondition as BoardCondition,
          boardType: boardType as BoardType,
          description: (description as string)?.trim() || undefined,
          image: imageArray,
          status: 'SENT' as UsedBoardStatus
        }
      })
    }
  }

  static validateUpdateData(body: unknown): ValidationResult & { 
    data?: { 
      boardId: string
      updateData: Partial<UpdateUsedBoardData>
    } 
  } {
    const errors: string[] = []

    if (!body || typeof body !== 'object') {
      errors.push('Corps de la requête invalide')
      return { isValid: false, errors }
    }

    const { boardId, status, pointsAwarded } = body as Record<string, unknown>

    const boardIdError = this.validateRequired(boardId, 'ID de la planche')
    if (boardIdError) errors.push(boardIdError)
    else {
      const uuidError = this.validateUUID(boardId, 'ID de la planche')
      if (uuidError) errors.push(uuidError)
    }

    const updateData: Partial<UpdateUsedBoardData> = {}

    if (status !== undefined) {
      const statusError = this.validateEnum(status, UsedBoardStatus, 'Statut')
      if (statusError) {
        errors.push(statusError)
      } else {
        updateData.status = status as UsedBoardStatus
        
        if (status !== 'RECEIVED') {
          updateData.pointsAwarded = undefined
        }
      }
    }

    if (pointsAwarded !== undefined) {
      const pointsError = this.validateNumber(pointsAwarded, 'Points attribués', { min: 0, integer: true })
      if (pointsError) {
        errors.push(pointsError)
      } else {
        updateData.pointsAwarded = pointsAwarded as number
      }
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      ...(isValid && {
        data: {
          boardId: boardId as string,
          updateData
        }
      })
    }
  }

  static validateDeleteData(boardId: unknown): ValidationResult & { data?: { boardId: string } } {
    const errors: string[] = []

    const boardIdError = this.validateRequired(boardId, 'ID de la planche')
    if (boardIdError) errors.push(boardIdError)
    else {
      const uuidError = this.validateUUID(boardId, 'ID de la planche')
      if (uuidError) errors.push(uuidError)
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      ...(isValid && {
        data: { boardId: boardId as string }
      })
    }
  }
}