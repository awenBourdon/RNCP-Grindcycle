'use client';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { signOut } from '@/lib/utils/auth-client';
import type { ErrorContext } from '@/lib/utils/types/types';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

export const SignOutButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleClick() {
    startTransition(async () => {
      await signOut({
        fetchOptions: {
          onError: (ctx: ErrorContext) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success('À Bientôt !');
            router.push('/authentification/connexion');
            router.refresh();
          },
        },
      });
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        px-6 py-3 border border-gray-300 text-gray-700 rounded-full
        hover:border-[#0a3d3f] hover:text-[#0a3d3f] transition-colors
        text-sm font-medium
        ${isPending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isPending ? 'Déconnexion en cours...' : 'Se déconnecter'}
    >
      {isPending ? (
        <span className="inline-flex items-center">
          <Spinner />
          <span className="ml-2">Déconnexion...</span>
        </span>
      ) : (
        'Se déconnecter'
      )}
    </button>
  );
};
