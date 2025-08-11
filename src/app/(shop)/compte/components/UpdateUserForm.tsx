'use client';
import type React from 'react';
import { useState } from 'react';
import { updateUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

interface UpdateUserFormProps {
  name: string;
}

export const UpdateUserForm = ({ name }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);
    const name = String(formData.get('name'));
    let image = String(formData.get('image')) || null;

    if (!image || image === 'null') {
      image = null;
    }

    if (!name) {
      return toast.error('Veuillez entrer un nom');
    }

    await updateUser({
      ...(name && { name }),
      ...(image !== null && { image }),
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: ctx => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success('Utilisateur mis à jour avec succès');
          (evt.target as HTMLFormElement).reset();
          router.refresh();
        },
      },
    });
  }

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <User size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Informations personnelles
        </h2>
      </div>

      <div className="max-w-md">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Nom d&apos;utilisateur
            </label>
            <input
              id="name"
              name="name"
              defaultValue={name}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
              placeholder="Ton nom d'utilisateur"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full px-6 py-3 bg-[#0a3d3f] text-white rounded-lg font-medium hover:bg-[#0a4d4f] transition-colors ${
              isPending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isPending ? 'Mise à jour en cours...' : 'Mettre à jour'}
          </button>
        </form>
      </div>
    </div>
  );
};
