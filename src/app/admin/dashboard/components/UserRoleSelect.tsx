"use client";
import Spinner from "@/components/ui/Spinner";
import type { UserRole } from "@/generated/prisma";
import { admin } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
}

interface ErrorContext {
  error: {
    message: string;
  };
}

export const UserRoleSelect = ({ userId, role }: UserRoleSelectProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = evt.target.value as UserRole;
    
    startTransition(async () => {
      try {
        const canChangeRole = await admin.hasPermission({
          permissions: {
            user: ["set-role"],
          },
        });
        
        if (!canChangeRole || canChangeRole.error) {
          toast.error("Interdit");
          return;
        }
        
        await admin.setRole({
          userId,
          role: newRole,
          fetchOptions: {
            onError: (ctx: ErrorContext) => {
              toast.error(ctx.error.message);
            },
            onSuccess: () => {
              toast.success("Rôle mis à jour.");
              router.refresh();
            },
          },
        });
      } catch {
        toast.error("Une erreur s'est produite.");
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={role}
        onChange={handleChange}
        disabled={role === "ADMIN" || isPending}
        className="px-3 py-2 text-sm disabled:opacity-50"
      >
        <option value="ADMIN">Administrateur</option>
        <option value="USER">Utilisateur</option>
      </select>
      {isPending && (
        <div className="absolute right-8">
          <Spinner />
        </div>
      )}
    </div>
  );
};