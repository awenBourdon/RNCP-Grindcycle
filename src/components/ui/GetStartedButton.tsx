"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "./button";
import Link from "next/link";

export const GetStartedButton = () => {
    const { data: session, isPending } = useSession();

    if (isPending) {
    return (
        <Button size="lg" className="opacity-50" asChild>
            Commencer
        </Button>
    )
};

const href = session ? "/compte" : "/authentification/connexion";

  return (
  <div className="flex flex-col items-center">
    <Button size="lg" asChild>
        <Link href={href}>
        Commencer
        </Link>
    </Button>

    {session && (
        <p className="flex items-center gap-2">
          <span
            data-role={session.user.role}
            className="size-4 rounded-full animate-pulse data-[role=USER]:bg-blue-600 data-[role=ADMIN]:bg-red-600"
          />
          Welcome back, {session.user.name}! 👋
        </p>
      )}
    </div>
  );
};

