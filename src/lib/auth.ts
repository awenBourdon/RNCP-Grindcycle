import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { PrismaClient, UserRole } from '@/generated/prisma/client';
import { hashPassword, verifyPassword } from '@/lib/argon2';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { getValidDomains, normalizeName } from './utils';
import { admin, magicLink } from 'better-auth/plugins';
import { ac, roles } from './permissions';
import { sendEmailAction } from '@/actions/emails/send-email.action';
import {
  getClientIP,
  checkRateLimit,
  RATE_LIMIT_MESSAGES,
  type RateLimitAction,
} from './rateLimit';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  socialProviders: {
    google: {
      clientId: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    autoSignIn: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmailAction({
        to: user.email,
        subject: 'Réinitialiser ton mot de passe',
        meta: {
          description: 'Clique ici pour réinitialiser ton mot de passe.',
          link: String(url),
        },
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set('callbackURL', '/authentification/verifier-email');

      await sendEmailAction({
        to: user.email,
        subject: 'Test email smtp',
        meta: {
          description: 'Test email smtp',
          link: String(link),
        },
      });
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.request) {
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              name:
                ctx.body && ctx.body.name
                  ? normalizeName(ctx.body.name)
                  : undefined,
            },
          },
        };
      }

      const ip = getClientIP(ctx.request);

      const rateLimitMap: Record<string, RateLimitAction> = {
        '/sign-in/magic-link': 'magicLink',
        '/sign-in/email': 'signIn',
        '/sign-up/email': 'signUp',
        '/forget-password': 'resetPassword',
        '/verify-email': 'verifyEmail',
      };

      const action = rateLimitMap[ctx.path];
      if (action && !checkRateLimit(ip, action)) {
        throw new APIError('TOO_MANY_REQUESTS', {
          message: RATE_LIMIT_MESSAGES[action],
        });
      }

      if (ctx.path === '/sign-up/email') {
        const email = String(ctx.body.email);
        const domain = email.split('@')[1].toLowerCase();

        const VALID_DOMAINS = getValidDomains();
        if (!VALID_DOMAINS.includes(domain)) {
          throw new APIError('BAD_REQUEST', {
            message:
              "Nom de domaine non-valable. Merci d'utiliser une adresse email valide",
          });
        }
      }

      const name =
        ctx.body && ctx.body.name ? normalizeName(ctx.body.name) : undefined;

      return {
        context: {
          ...ctx,
          body: {
            ...ctx.body,
            name,
          },
        },
      };
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.split(',') ?? [];

          // TODO : Pourquoi Better Auth attend maintenant un tableau pour l'image ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const processedUser: any = { ...user }; // TODO : Typer si ça doit rester comme ça à l'avenir
          if (user.image && typeof user.image === 'string') {
            processedUser.image = [user.image];
          } else if (!user.image) {
            processedUser.image = [];
          }

          if (ADMIN_EMAIL.includes(user.email)) {
            return { data: { ...processedUser, role: UserRole.ADMIN } };
          }

          return { data: processedUser };
        },
      },
    },
  },

  user: {
    additionalFields: {
      role: {
        type: ['USER', 'ADMIN'] as Array<UserRole>,
        input: false,
      },
    },
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60,
  },

  account: {
    accountLinking: {
      enabled: false,
    },
  },

  advanced: {
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      secure: false, // Mettre true en prod'
      httpOnly: true,
      sameSite: 'lax', // Mettre strict en prod'
      partitioned: false,
    },
  },

  plugins: [
    nextCookies(),
    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
      ac,
      roles,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmailAction({
          to: email,
          subject: 'Magic Link Login',
          meta: {
            description: 'Please click the link below to log in.',
            link: String(url),
          },
        });
      },
    }),
  ],
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'Inconnu';
