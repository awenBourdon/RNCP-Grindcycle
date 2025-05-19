"use client";
import { deleteUserAction } from "@/actions/delete-user.action";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { TrashIcon } from "lucide-react";
import React, { useTransition } from "react";

interface DeleteUserButtonProps {
    userId: string
}

export const DeleteUserButton = ({ userId }: DeleteUserButtonProps) => {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            await deleteUserAction({ userId });
        });
    }

  return (
    <Button
    size="icon"
    variant="destructive"
    className="size-7 rounded-sm text-black cursor-pointer"
    disabled={isPending}
    onClick={handleClick}
    >
        <span className="sr-only">
            Supprimer utilisateur
        </span>

        {isPending ? <Spinner /> : <TrashIcon />}
    </Button>
  );
};

export const PlaceholderDeleteUserButton = () => {
  return (
    <Button
    size="icon"
    variant="destructive"
    className="size-7 rounded-sm text-gray-400"
    >
        <span className="sr-only">
            Supprimer utilisateur
        </span>
        <TrashIcon/>
    </Button>
  );
};
