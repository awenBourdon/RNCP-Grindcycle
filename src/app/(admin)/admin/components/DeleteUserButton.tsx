'use client';
import { deleteUserAction } from '@/actions/auth/delete-user.action';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface DeleteUserButtonProps {
  userId: string;
}

export const DeleteUserButton = ({ userId }: DeleteUserButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await deleteUserAction({ userId });
    });
  };

  return (
    <button
      className="bg-white hover:bg-gray-50 text-gray-600 hover:text-[#0a3d3f] border border-gray-200 rounded-full h-9 w-9 p-0 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isPending}
      onClick={handleClick}
    >
      <span className="sr-only">Supprimer utilisateur</span>
      {isPending ? <Spinner /> : <Trash2 size={16} />}
    </button>
  );
};

export const PlaceholderDeleteUserButton = () => {
  return (
    <button
      className="bg-gray-100 text-gray-300 border border-gray-200 rounded-full h-9 w-9 p-0 cursor-not-allowed opacity-50 flex items-center justify-center"
      disabled
    >
      <span className="sr-only">Supprimer utilisateur</span>
      <Trash2 size={16} />
    </button>
  );
};
