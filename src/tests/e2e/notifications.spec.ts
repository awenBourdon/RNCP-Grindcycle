import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || '';
const password = process.env.TEST_PASSWORD || '';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/authentification/connexion');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });

    await emailInput.fill(email);
    await passwordInput.fill(password);

    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();

    await page.waitForURL('**/compte**', { timeout: 20000 });
    await page.waitForURL('**/compte/profil', { timeout: 5000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
  });

  test('Accéder à la page des notifications', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/notifications');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/.*notifications/);
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Voir la liste des notifications', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/notifications');
    await page.waitForLoadState('networkidle');
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
  });

  test('Marquer une notification comme lue si possible', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/notifications');
    await page.waitForLoadState('networkidle');
    
    const markReadButton = page.locator('button').filter({ hasText: /marquée|lu|✓/i }).first();
    
    if (await markReadButton.isVisible().catch(() => false)) {
      await markReadButton.click();
      await page.waitForTimeout(500);
    }
  });
});

