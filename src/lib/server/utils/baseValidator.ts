export abstract class BaseValidator {
  /**
   * Valide qu'un champ est requis
   */
  protected static validateRequired(value: unknown, fieldName: string): string | null {
    if (value === null || value === undefined) {
      return `${fieldName} est requis`;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName} ne peut pas être vide`;
    }

    return null;
  }

  /**
   * Valide un nombre
   */
  protected static validateNumber(
    value: unknown,
    fieldName: string,
    options: {
      min?: number;
      max?: number;
      integer?: boolean;
    } = {}
  ): string | null {
    if (typeof value !== 'number') {
      return `${fieldName} doit être un nombre valide`;
    }

    const numValue = value;

    if (options.integer && !Number.isInteger(numValue)) {
      return `${fieldName} doit être un nombre entier`;
    }

    if (options.min !== undefined && numValue < options.min) {
      return `${fieldName} doit être supérieur ou égal à ${options.min}`;
    }

    if (options.max !== undefined && numValue > options.max) {
      return `${fieldName} doit être inférieur ou égal à ${options.max}`;
    }

    return null;
  }

  /**
   * Valide une énumération
   */
  protected static validateEnum<T extends object>(
    value: unknown,
    enumObject: T,
    fieldName: string
  ): string | null {
    const enumValues = Object.values(enumObject) as unknown as string[];
    if (typeof value !== 'string' || !enumValues.includes(value)) {
      const validValues = enumValues.join(', ');
      return `${fieldName} invalide. Valeurs autorisées: ${validValues}`;
    }
    return null;
  }

  /**
   * Valide une chaîne de caractères
   */
  protected static validateString(
    value: unknown,
    fieldName: string,
    options: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      allowEmpty?: boolean;
    } = {}
  ): string | null {
    if (typeof value !== 'string') {
      return `${fieldName} doit être une chaîne de caractères`;
    }

    if (!options.allowEmpty && value.trim().length === 0) {
      return `${fieldName} ne peut pas être vide`;
    }

    if (options.minLength && value.length < options.minLength) {
      return `${fieldName} doit contenir au moins ${options.minLength} caractères`;
    }

    if (options.maxLength && value.length > options.maxLength) {
      return `${fieldName} ne peut pas dépasser ${options.maxLength} caractères`;
    }

    if (options.pattern && !options.pattern.test(value)) {
      return `${fieldName} n'a pas le bon format`;
    }

    return null;
  }

  /**
   * Valide un tableau
   */
  protected static validateArray(
    value: unknown,
    fieldName: string,
    options: {
      minItems?: number;
      maxItems?: number;
      itemValidator?: (item: unknown, index: number) => string | null;
      allowEmpty?: boolean;
    } = {}
  ): string[] {
    const errors: string[] = [];

    if (!Array.isArray(value)) {
      errors.push(`${fieldName} doit être un tableau`);
      return errors;
    }

    if (!options.allowEmpty && value.length === 0) {
      errors.push(`${fieldName} ne peut pas être vide`);
    }

    if (options.minItems && value.length < options.minItems) {
      errors.push(`${fieldName} doit contenir au moins ${options.minItems} élément(s)`);
    }

    if (options.maxItems && value.length > options.maxItems) {
      errors.push(`${fieldName} ne peut pas contenir plus de ${options.maxItems} élément(s)`);
    }

    if (options.itemValidator) {
      value.forEach((item, index) => {
        const itemError = options.itemValidator!(item, index);
        if (itemError) {
          errors.push(`${fieldName}[${index}]: ${itemError}`);
        }
      });
    }

    return errors;
  }

  /**
   * Collecte toutes les erreurs de validation
   */
  protected static collectErrors(validators: (() => string | null)[]): string[] {
    return validators
      .map((validator) => validator())
      .filter((error): error is string => error !== null);
  }

  /**
   * Collecte les erreurs de validation de tableaux
   */
  protected static collectArrayErrors(validators: (() => string[])[]): string[] {
    return validators.flatMap((validator) => validator());
  }

  /**
   * Nettoie et normalise une chaîne
   */
  protected static sanitizeString(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Valide un UUID
   */
  protected static validateUUID(value: unknown, fieldName: string): string | null {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (typeof value !== 'string' || !uuidRegex.test(value)) {
      return `${fieldName} doit être un UUID valide`;
    }

    return null;
  }

  /**
   * Valide une adresse email
   */
  protected static validateEmail(value: unknown, fieldName: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof value !== 'string' || !emailRegex.test(value)) {
      return `${fieldName} doit être une adresse email valide`;
    }

    return null;
  }

  /**
   * Valide une URL
   */
  protected static validateUrl(value: unknown, fieldName: string): string | null {
    try {
      new URL(value as string);
      return null;
    } catch {
      return `${fieldName} doit être une URL valide`;
    }
  }

  /**
   * Valide une date
   */
  protected static validateDate(
    value: unknown,
    fieldName: string,
    options: {
      minDate?: Date;
      maxDate?: Date;
      futureOnly?: boolean;
      pastOnly?: boolean;
    } = {}
  ): string | null {
    const dateValue = new Date(value as string);
    if (isNaN(dateValue.getTime())) {
      return `${fieldName} doit être une date valide`;
    }

    const now = new Date();

    if (options.futureOnly && dateValue <= now) {
      return `${fieldName} doit être une date future`;
    }

    if (options.pastOnly && dateValue >= now) {
      return `${fieldName} doit être une date passée`;
    }

    if (options.minDate && dateValue < options.minDate) {
      return `${fieldName} doit être postérieure au ${options.minDate.toLocaleDateString()}`;
    }

    if (options.maxDate && dateValue > options.maxDate) {
      return `${fieldName} doit être antérieure au ${options.maxDate.toLocaleDateString()}`;
    }

    return null;
  }
}
