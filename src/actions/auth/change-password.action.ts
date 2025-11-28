'use server';
import { auth } from '@/lib/utils/auth';
import {
  checkRateLimit,
  RATE_LIMIT_MESSAGES,
} from '@/lib/utils/rateLimit';
import { passwordSchema } from '@/lib/validations/auth.validation';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

const passwordSchemaZod = passwordSchema;

export async function changePasswordAction(formData: FormData) {
  const headersList = await headers();

  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ??
    headersList.get('x-real-ip') ??
    '0.0.0.0';

  if (!checkRateLimit(ip, 'changePassword')) {
    return { error: RATE_LIMIT_MESSAGES.changePassword };
  }

  const currentPassword = String(formData.get('currentPassword'));
  if (!currentPassword)
    return { error: 'Rentre ton mot de passe actuel' };

  const newPassword = String(formData.get('newPassword'));
  if (!newPassword)
    return { error: 'Rentre ton nouveau mot de passe' };

  try {
    passwordSchemaZod.parse(newPassword);
  } catch {
    return {
      error:
        'Le mot de passe doit contenir au moins 12 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial',
    };
  }

  try {
    await auth.api.changePassword({
      headers: headersList,
      body: {
        currentPassword,
        newPassword,
      },
    });
    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }

    return { error: 'Erreur interne du serveur' };
  }
}
