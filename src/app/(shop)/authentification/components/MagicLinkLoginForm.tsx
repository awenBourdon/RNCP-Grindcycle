'use client';
import { useEffect, useState } from 'react';
import type React from 'react';
import { signIn, useSession } from '@/lib/utils/auth-client';
import { toast } from 'sonner';
import type { ErrorContext } from '@/lib/utils/types/types';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const MagicLinkLoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push('/compte');
    }
  }, [session, router]);

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get('email'));

    if (!email) return toast.error('Entre ton email.');

    await signIn.magicLink({
      email,
      name: email.split('@')[0],
      callbackURL: '/compte',
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx: ErrorContext) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success('Vérifie ton email pour le lien magique !');
          setIsOpen(false);
        },
      },
    });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="space-y-4"
        aria-label="Formulaire de connexion par lien magique"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="magic-email"
            className="text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="relative">
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <Mail size={16} className="text-gray-400" />
            </div>
            <input
              type="email"
              id="magic-email"
              name="email"
              placeholder="ton@email.com"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
              aria-label="Adresse email pour la connexion par lien magique"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-[#0a3d3f] text-white cursor-pointer hover:bg-[#0a4d4f] transition-colors ${
            isPending ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          aria-label={
            isPending
              ? 'Envoi du lien magique en cours...'
              : 'Envoyer le lien magique'
          }
        >
          {isPending ? (
            'Envoi en cours...'
          ) : (
            <>
              <Mail size={16} className="mr-2" aria-hidden="true" />
              Envoyer le lien magique
            </>
          )}
        </button>
      </form>
    </div>
  );
};
