"use client";

import { useState } from "react";
import { toast } from "sonner";
import { changePasswordAction, passwordSchema } from "@/actions/change-password.action";
import { z } from "zod";
import { Lock } from "lucide-react";

const passwordSchemaZod = passwordSchema;

export const ChangePasswordForm = () => {
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: "",
  });

  const validatePassword = (password: string) => {
    try {
      passwordSchemaZod.parse(password);
      setErrors({ newPassword: "" });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ newPassword: err.errors[0].message });
      }
      return false;
    }
  };

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    const newPassword = formData.get("newPassword") as string;
    if (!validatePassword(newPassword)) {
      return;
    }

    setIsPending(true);

    const { error } = await changePasswordAction(formData);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Mot de passe modifié avec succès.");
      (evt.target as HTMLFormElement).reset();
    }

    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
          Mot de passe actuel
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            autoComplete="off"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-2 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors ${
          isPending ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isPending ? "Modification en cours..." : "Valider"}
      </button>
    </form>
  );
};
