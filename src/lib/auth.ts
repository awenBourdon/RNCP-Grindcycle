import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

// import { PrismaClient } from "@prisma/client"; Avec Docker
import { PrismaClient, UserRole } from "@/generated/prisma/client"; // Sans Docker
import { hashPassword, verifyPassword } from "@/lib/argon2";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { getValidDomains, normalizeName } from "./utils";
import { admin } from "better-auth/plugins";
import { ac, roles } from "./permissions";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
          clientId: String(process.env.GOOGLE_CLIENT_ID),
          clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
    }},
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 12,
        autoSignIn: false,
        password: {
            hash: hashPassword,
            verify: verifyPassword
        },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/sign-up/email") {
                const email = String(ctx.body.email);
                const domain = email.split("@")[1].toLowerCase();

                const VALID_DOMAINS = getValidDomains();
                if (!VALID_DOMAINS.includes(domain)) {
                  throw new APIError("BAD_REQUEST", {
                    message: "Nom de domaine non-valable. Merci d'utiliser une adresse email valide",
                  });
                }
            }

            const name = ctx.body && ctx.body.name ? normalizeName(ctx.body.name) : undefined;

            return {
                context: {
                    ...ctx,
                    body: {
                        ...ctx.body,
                        name
                    }
                }
            }
        }),
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.split(',') ?? [];

                    if (ADMIN_EMAIL.includes(user.email)) {
                        return { data: { ...user, role: UserRole.ADMIN}}
                    }

                    return { data: user };
                }
            }
        }
    },
    user: {
        additionalFields: {
            role: {
                type: ["USER", "ADMIN"] as Array<UserRole>,
                input: false
            },
        },
    },
    session: {
        expiresIn: 7 * 24 * 60 * 60,
      },
    advanced: {
        database: {
          generateId: false,
        },
        defaultCookieAttributes: {
            secure: false, // Mettre true en prod'
            httpOnly: true,
            sameSite: "strict",
            partitioned: false,
        }
    },
    plugins: [
        nextCookies(),
        admin({
            defaultRole: UserRole.USER,
            adminRoles: [UserRole.ADMIN],
            ac,
            roles,
        }),
    ],
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | "Inconnu";
