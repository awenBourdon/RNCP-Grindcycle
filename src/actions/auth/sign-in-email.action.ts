'use server';
import { auth, ErrorCode } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { redirect } from 'next/navigation';
import { signInSchema } from '@/lib/validations/authValidation';

export async function signInEmailAction(formData: FormData) {
  const raw = {
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  };

  const result = signInSchema.safeParse(raw);

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

  const { email, password } = result.data;

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: { email, password },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : 'Inconnu';

      // TODO : Implémenter un switch complet pour tous les cas possibles
      switch (errCode) {
        case 'EMAIL_NOT_VERIFIED':
          redirect('/authentification/verifier-email?error=email_not_verified');
        default:
          return {
            error: 'Oups ! Une erreur est survenue pendant la connexion.',
          };
      }
    }

    return { error: 'Oups ! Une erreur inattendue est survenue.' };
  }
}
