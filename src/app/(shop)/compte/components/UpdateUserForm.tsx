'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { updateProfileAction } from '@/actions/auth/update-profile.action';

interface UpdateUserFormProps {
  name: string;
  email: string;
}

export const UpdateUserForm = ({ name, email }: UpdateUserFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);

    startTransition(async () => {
      try {
        const result = await updateProfileAction(formData);

        if (result.success) {
          toast.success(result.message || 'Profil mis à jour avec succès');
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error('Une erreur est survenue');
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="flex items-center mb-8">
          <User size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">
            Informations personnelles
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="space-y-6 max-w-md"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Nom d&apos;utilisateur
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={name}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                placeholder="Ton nom d'utilisateur"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={email}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                placeholder="ton@email.com"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={`w-full px-6 py-3 bg-[#0a3d3f] text-white rounded-full font-medium cursor-pointer hover:bg-[#0a4d4f] transition-colors flex items-center justify-center ${
              isPending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isPending ? (
              <>
                <Spinner />
                <span className="ml-2">Mise à jour...</span>
              </>
            ) : (
              'Mettre à jour'
            )}
          </button>
        </form>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-blue-600 mt-0.5 flex-shrink-0"
            />
            <div className="text-blue-800 text-sm">
              <p className="font-medium mb-1">Information importante</p>
              <p>
                Le changement d&apos;email de connexion ne sera pas appliqué si
                tu te connectes via le service Google. Les comptes Google
                utilisent l&apos;authentification de Google et donc
                n&apos;utilisent pas d&apos;adresse email local.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
