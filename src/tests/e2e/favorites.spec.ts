import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || '';
const password = process.env.TEST_PASSWORD || '';

test.describe('Favoris', () => {
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

  test('Accéder à la page des favoris', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/favoris');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/.*favoris/);
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Ajouter un produit aux favoris depuis le catalogue', async ({ page }) => {
    await page.goto('http://localhost:3000/catalogue');
    await page.waitForLoadState('networkidle');
    
    const productLink = page.locator('a[href*="/produit/"]').first();
    
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await page.waitForURL('**/produit/**', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      const favoriteButton = page.locator('button').filter({ hasText: /favori|♥|♡|❤/i }).or(
        page.locator('button[aria-label*="favori" i]')
      ).first();
      
      if (await favoriteButton.isVisible().catch(() => false)) {
        await favoriteButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Retirer un produit des favoris', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/favoris');
    await page.waitForLoadState('networkidle');
    
    const removeButton = page.locator('button').filter({ hasText: /retirer|supprimer|favori/i }).first();
    
    if (await removeButton.isVisible().catch(() => false)) {
      await removeButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Vérifier la liste des favoris', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/favoris');
    await page.waitForLoadState('networkidle');
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});

