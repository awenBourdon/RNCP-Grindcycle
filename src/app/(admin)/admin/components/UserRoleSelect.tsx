'use client';
import { Spinner } from '@/app/(shop)/components/Spinner';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Shield, User } from 'lucide-react';
import { UserRole } from '@/lib/utils/enums/enums';
import { updateUserRoleAction } from '@/actions/users/update-user.-role.action';

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
  onRoleChange?: (newRole: UserRole) => void;
}

export const UserRoleSelect = ({ userId, role, onRoleChange }: UserRoleSelectProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = evt.target.value as UserRole;

    if (newRole === role) return;

    startTransition(async () => {
      try {
        const result = await updateUserRoleAction(userId, newRole);

        if (result.success) {
          toast.success(result.message);
          onRoleChange?.(newRole);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Une erreur s'est produite.");
      }
    });
  };

  const getRoleIcon = (userRole: UserRole) => {
    return userRole === UserRole.ADMIN ? (
      <Shield size={14} />
    ) : (
      <User size={14} />
    );
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="relative">
        <select
          value={role}
          onChange={handleChange}
          disabled={role === UserRole.ADMIN || isPending}
          className="appearance-none pl-8 pr-8 py-2 text-sm font-medium border border-gray-200 rounded-full cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a3d3f]/20 focus:border-[#0a3d3f] disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 bg-white text-[#010101]"
        >
          <option value="ADMIN">Administrateur</option>
          <option value="USER">Utilisateur</option>
        </select>
        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#0a3d3f]">
          {getRoleIcon(role)}
        </div>
        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Spinner />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};
