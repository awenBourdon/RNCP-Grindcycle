'use server';
import { auth, ErrorCode } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { redirect } from 'next/navigation';
import { signInSchema } from '@/lib/validations/authValidation';
import { getClientIP, hasExcessiveFailures, recordFailedSignIn, resetSignInAttempts } from '@/lib/rateLimit';

export async function signInEmailAction(formData: FormData) {
  const headersList = await headers();
  const ip = getClientIP({
    headers: {
      get: (name: string) => headersList.get(name)
    }
  } as Request);

  const raw = {
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  };

  const email = raw.email;
  const excessiveCheck = hasExcessiveFailures(ip, email);
  
  if (excessiveCheck.blocked) {
    return {
      error: excessiveCheck.reason || 'Trop de tentatives de connexion, réessaye plus tard.',
      rateLimited: true,
    };
  }

  const result = signInSchema.safeParse(raw);

  if (!result.success) {
    recordFailedSignIn(ip, email);
    
    const errorMessages = result.error.format();
    const firstFieldError = Object.values(errorMessages)[0];
// let firstError = 'Erreur de validation.';
    let firstError = 'Identifiant et/ou mot de passe incorrect.';
    
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

  const { email: validEmail, password } = result.data;

  try {
    await auth.api.signInEmail({
      headers: headersList,
      body: { email: validEmail, password },
    });

    resetSignInAttempts(ip, validEmail);
    
    return { error: null };
    
  } catch (err) {
    recordFailedSignIn(ip, validEmail);
    
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
