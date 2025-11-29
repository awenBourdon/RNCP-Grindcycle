'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { resetPassword } from '@/lib/utils/auth-client';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordSchema } from '@/lib/validations/auth.validation';
import { PasswordValidation } from './PasswordValidation';
import { z } from 'zod';

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const router = useRouter();

  const validatePassword = () => {
    try {
      resetPasswordSchema.parse(formData);
      setErrors({ password: '', confirmPassword: '' });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = { password: '', confirmPassword: '' };
        err.errors.forEach(error => {
          if (error.path && typeof error.path[0] === 'string') {
            const field = error.path[0] as keyof typeof newErrors;
            newErrors[field] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsPending(true);

    try {
      await resetPassword({
        newPassword: formData.password,
        token,
        fetchOptions: {
          onRequest: () => {},
          onResponse: () => {},
          onError: ctx => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success('Mot de passe changé avec succès.');
            router.push('/authentification/connexion');
          },
        },
      });
    } catch {
      toast.error('Erreur lors du changement du mot de passe.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="w-full space-y-6"
      autoComplete="off"
      onSubmit={handleSubmit}
      aria-label="Formulaire de réinitialisation du mot de passe"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <div
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            aria-hidden="true"
          >
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent"
            aria-label="Nouveau mot de passe"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={
              showPassword
                ? 'Masquer le mot de passe'
                : 'Afficher le mot de passe'
            }
          >
            {showPassword ? (
              <EyeOff
                size={16}
                className="text-gray-400 hover:text-gray-600"
                aria-hidden="true"
              />
            ) : (
              <Eye
                size={16}
                className="text-gray-400 hover:text-gray-600"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            className="text-red-500 text-xs mt-1"
            id="password-error"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-gray-700"
        >
          Confirmer le nouveau mot de passe
        </label>
        <div className="relative">
          <div
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            aria-hidden="true"
          >
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent"
            aria-label="Confirmation du nouveau mot de passe"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={
              errors.confirmPassword ? 'confirmPassword-error' : undefined
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={
              showConfirmPassword
                ? 'Masquer la confirmation du mot de passe'
                : 'Afficher la confirmation du mot de passe'
            }
          >
            {showConfirmPassword ? (
              <EyeOff
                size={16}
                className="text-gray-400 hover:text-gray-600"
                aria-hidden="true"
              />
            ) : (
              <Eye
                size={16}
                className="text-gray-400 hover:text-gray-600"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            className="text-red-500 text-xs mt-1"
            id="confirmPassword-error"
            role="alert"
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <PasswordValidation
        password={formData.password}
        confirmPassword={formData.confirmPassword}
      />

      <button
        type="submit"
        disabled={isPending}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-[#0a3d3f] text-white cursor-pointer hover:bg-[#0a4d4f] transition-colors ${
          isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        aria-label={
          isPending
            ? 'Réinitialisation du mot de passe en cours...'
            : 'Réinitialiser le mot de passe'
        }
      >
        {isPending ? (
          <>
            <Spinner />
            <span className="ml-2">Chargement ...</span>
          </>
        ) : (
          <>
            <ArrowRight size={16} className="mr-2" aria-hidden="true" />
            Réinitialiser ton mot de passe
          </>
        )}
      </button>
    </form>
  );
};
