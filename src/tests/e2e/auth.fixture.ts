/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';
import { Session } from '@/lib/utils/types/types';
import { UserRole } from '@/lib/utils/enums/enums';

type AuthFixtures = {
  authenticatedPage: void;
  adminPage: void;
  testUser: { id: string; email: string; role: string };
  adminUser: { id: string; email: string; role: string };
};

const TEST_USER = {
  id: 'test-user-123',
  email: 'test@test.com',
  role: 'USER',
};

const ADMIN_USER = {
  id: 'admin-user-123',
  email: 'admin@test.com',
  role: 'ADMIN',
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    const mockSession: Session = {
      user: {
        id: TEST_USER.id,
        name: 'User Test',
        email: TEST_USER.email,
        role: UserRole.USER,
        createdAt: new Date(),
      },
    };

    await context.addCookies([
      {
        name: 'authjs.session-token',
        value: Buffer.from(JSON.stringify(mockSession)).toString('base64'),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await use();
  },

  adminPage: async ({ page, context }, use) => {
    const mockSession: Session = {
      user: {
        id: ADMIN_USER.id,
        name: 'Admin Test',
        email: ADMIN_USER.email,
        role: UserRole.ADMIN,
        createdAt: new Date(),
      },
    };

    await context.addCookies([
      {
        name: 'authjs.session-token',
        value: Buffer.from(JSON.stringify(mockSession)).toString('base64'),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await use();
  },

  testUser: async ({}, use) => {
    await use(TEST_USER);
  },

  adminUser: async ({}, use) => {
    await use(ADMIN_USER);
  },
});

export { expect };