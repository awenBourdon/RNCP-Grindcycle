'use client';
import { Spinner } from '@/components/ui/Spinner';
import { forgetPassword } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Mail, ArrowRight } from 'lucide-react';
import type React from 'react';

export const ForgotPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get('email'));

    if (!email) {
      toast.error('Merci de renseigner ton adresse email.');
      return;
    }

    startTransition(async () => {
      try {
        await forgetPassword({
          email,
          redirectTo: '/authentification/reinitialiser-mot-de-passe',
          fetchOptions: {
            onRequest: () => {},
            onResponse: () => {},
            onError: ctx => {
              toast.error(ctx.error.message);
            },
            onSuccess: () => {
              toast.success('Le lien de réinitialisation a été envoyé.');
              router.push('/authentification/mot-de-passe-oublie/succes');
            },
          },
        });
      } catch {
        toast.error("Erreur lors de l'envoi de l'email.");
      }
    });
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={16} className="text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="ton@email.com"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-[#0a3d3f] text-white cursor-pointer hover:bg-[#0a4d4f] transition-colors ${
          isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isPending ? (
          <>
            <Spinner />
            <span className="ml-2">Envoi en cours...</span>
          </>
        ) : (
          <>
            <ArrowRight size={16} className="mr-2" />
            Envoyer le lien de réinitialisation
          </>
        )}
      </button>
    </form>
  );
};
