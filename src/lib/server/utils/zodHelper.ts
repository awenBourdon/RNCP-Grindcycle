import { ZodSchema, ZodError } from 'zod';

export class ZodHelper {
  static validate<T>(schema: ZodSchema<T>, data: unknown) {
    try {
      const validatedData = schema.parse(data);
      return {
        isValid: true,
        errors: [],
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => err.message);
        return {
          isValid: false,
          errors,
          data: undefined,
        };
      }

      return {
        isValid: false,
        errors: ['Erreur de validation'],
        data: undefined,
      };
    }
  }

  static validateFormData<T>(schema: ZodSchema<T>, formData: FormData) {
    const data: Record<string, unknown> = {};

    const allImages = [
      ...formData.getAll('images'),
      ...formData.getAll('image'),
    ].filter(item => item instanceof File);

    if (allImages.length > 0) {
      data.images = allImages;
    }

    for (const [key, value] of formData.entries()) {
      if (key === 'images' || key === 'image') {
        continue;
      } else if (key === 'priceEuro' || key === 'pricePoints') {
        const numValue = parseFloat(value as string);
        data[key] = isNaN(numValue) ? value : numValue;
      } else {
        data[key] = value;
      }
    }

    return this.validate(schema, data);
  }
}
