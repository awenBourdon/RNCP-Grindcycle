'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Key, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { changePasswordAction } from '@/actions/auth/change-password.action';
import { passwordSchema } from '@/lib/validations/auth.validation';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { PasswordValidation } from '../../authentification/components/PasswordValidation';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    data => {
      return data.newPassword === data.confirmPassword;
    },
    {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    }
  );

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const ChangePasswordForm = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch('newPassword', '');
  const confirmPassword = watch('confirmPassword', '');

  async function onSubmit(data: ChangePasswordInput) {
    const formData = new FormData();
    formData.append('currentPassword', data.currentPassword);
    formData.append('newPassword', data.newPassword);

    try {
      const { error } = await changePasswordAction(formData);

      if (error) {
        toast.error(error);
      } else {
        toast.success('Mot de passe modifié avec succès.');
        reset();
      }
    } catch {
      toast.error("Une erreur inattendue s'est produite");
    }
  }

  return (
    <div
      className="bg-[#f8f7f4] rounded-xl p-8"
      aria-label="Section de sécurité du compte"
    >
      <div className="flex items-center mb-8">
        <Key size={24} className="text-[#0a3d3f] mr-3" aria-hidden="true" />
        <h2 className="text-2xl font-normal text-[#010101]">Sécurité</h2>
      </div>

      <div className="max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          className="w-full space-y-4"
          aria-label="Formulaire de changement de mot de passe"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="currentPassword"
              className="text-sm font-medium text-gray-700"
            >
              Mot de passe actuel
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 flex items-center pl-3"
                aria-hidden="true"
              >
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                {...register('currentPassword')}
                autoComplete="current-password"
                className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                aria-label="Mot de passe actuel"
                aria-invalid={errors.currentPassword ? 'true' : 'false'}
                aria-describedby={
                  errors.currentPassword ? 'currentPassword-error' : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={
                  showCurrentPassword
                    ? 'Masquer le mot de passe actuel'
                    : 'Afficher le mot de passe actuel'
                }
              >
                {showCurrentPassword ? (
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
            {errors.currentPassword && (
              <p
                className="text-red-500 text-xs mt-1"
                id="currentPassword-error"
                role="alert"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 flex items-center pl-3"
                aria-hidden="true"
              >
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                {...register('newPassword')}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                aria-label="Nouveau mot de passe"
                aria-invalid={errors.newPassword ? 'true' : 'false'}
                aria-describedby={
                  errors.newPassword ? 'newPassword-error' : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={
                  showNewPassword
                    ? 'Masquer le nouveau mot de passe'
                    : 'Afficher le nouveau mot de passe'
                }
              >
                {showNewPassword ? (
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
            {errors.newPassword && (
              <p
                className="text-red-500 text-xs mt-1"
                id="newPassword-error"
                role="alert"
              >
                {errors.newPassword.message}
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
                className="absolute inset-y-0 left-0 flex items-center pl-3"
                aria-hidden="true"
              >
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                {...register('confirmPassword')}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
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
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <PasswordValidation
            password={newPassword}
            confirmPassword={confirmPassword}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-[#0a3d3f] text-white cursor-pointer hover:bg-[#0a4d4f] transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            aria-label={
              isSubmitting
                ? 'Modification du mot de passe en cours...'
                : 'Modifier le mot de passe'
            }
          >
            {isSubmitting ? <Spinner /> : <p>Modifier le mot de passe</p>}
          </button>
        </form>
      </div>

      <div
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
        role="alert"
        aria-label="Information importante sur les comptes Google"
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-blue-600 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <div className="text-blue-800 text-sm">
            <p className="font-medium mb-1">Information importante</p>
            <p>
              Si tu t&apos;es connecté avec le service Google, cette
              fonctionnalité de changement de mot de passe ne s&apos;applique
              pas. Les comptes Google utilisent l&apos;authentification de
              Google et n&apos;ont pas de mot de passe local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
