import { z } from 'zod';

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/;

export const passwordSchema = z
  .string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
  .regex(
    passwordRegex,
    'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
  );

const emailSchema = z.string().email('Adresse email invalide');

export const signUpSchema = z.object({
  name: z.string().min(1, "Merci de définir un nom d'utilisateur"),
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const emailVerificationSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
