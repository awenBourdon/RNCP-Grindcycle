import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || '';
const password = process.env.TEST_PASSWORD || '';

test.describe('Admin Panel', () => {
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

  test('Accéder au tableau de bord admin', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    await page.waitForURL('**/admin/tableau-de-bord', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const adminTitle = page.locator('text=Tableau de bord').first();
    await expect(adminTitle).toBeVisible();
  });

  test('Naviguer dans les différentes sections admin', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/tableau-de-bord', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForLoadState('domcontentloaded');

    const usersLink = page.getByRole('link', { name: 'Utilisateurs' });
    if (await usersLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await usersLink.click();
      await page.waitForURL('**/admin/utilisateurs', { timeout: 20000, waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/.*utilisateurs/);
    }

    await page.goto('http://localhost:3000/admin/tableau-de-bord', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForLoadState('domcontentloaded');
    const productsLink = page.getByRole('link', { name: 'Produits' });
    if (await productsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productsLink.click();
      await page.waitForURL('**/admin/produits', { timeout: 20000, waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/.*produits/);
    }

    await page.goto('http://localhost:3000/admin/tableau-de-bord', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForLoadState('domcontentloaded');
    const boardsLink = page.getByRole('link', { name: 'Planches' });
    if (await boardsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await boardsLink.click();
      await page.waitForURL('**/admin/planches', { timeout: 20000, waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/.*planches/);
    }

    await page.goto('http://localhost:3000/admin/tableau-de-bord', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForLoadState('domcontentloaded');
    const ordersLink = page.getByRole('link', { name: 'Commandes' });
    if (await ordersLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ordersLink.click();
      await page.waitForURL('**/admin/commandes', { timeout: 20000, waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/.*commandes/);
    }

    await page.goto('http://localhost:3000/admin/tableau-de-bord', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForLoadState('domcontentloaded');
    const notificationsLink = page.getByRole('link', { name: 'Notifications' });
    if (await notificationsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await notificationsLink.click();
      await page.waitForURL('**/admin/notifications', { timeout: 20000, waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/.*notifications/);
    }

    await page.goto('http://localhost:3000/admin/tableau-de-bord');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Ajouter produit' }).click();
    await page.waitForURL('**/admin/ajouter-produit', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });
});

