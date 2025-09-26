'use server';
import { auth, ErrorCode } from '@/lib/utils/auth';
import { signUpServerSchema } from '@/lib/validations/auth.validation';
import { APIError } from 'better-auth/api';
import { cookies } from 'next/headers';

export async function signUpEmailAction(formData: FormData) {

  const cookieStore = await cookies();
    cookieStore.set('registration_success', 'true', {
    maxAge: 60 * 5,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  
  const raw = {
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  };

  const result = signUpServerSchema.safeParse(raw);

  if (!result.success) {
    const errorMessages = result.error.format();
    const firstFieldError = Object.values(errorMessages)[0];
    let firstError = 'Erreur de validation.';

    if (
      firstFieldError &&
      typeof firstFieldError === 'object' &&
      '_errors' in firstFieldError
    ) {
      const errors = (firstFieldError as { _errors: string[] })._errors;
      if (errors.length > 0) {
        firstError = errors[0];
      }
    }
    return { error: firstError };
  }

  const { name, email, password } = result.data;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });
    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : 'Inconnu';
      switch (errCode) {
        case 'USER_ALREADY_EXISTS':
          return { error: 'Cette adresse email est déjà utilisée.' };
        default:
          return { error: err.message || 'Erreur inconnue côté API.' };
      }
    }
    return { error: 'Erreur serveur inattendue.' };
  }
}
