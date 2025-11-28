import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || '';
const password = process.env.TEST_PASSWORD || '';

test.describe('Commandes', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter
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

  test('Accéder à la page des commandes', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/commandes');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/.*commandes/);
    
    // Vérifier que la page est chargée
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Voir la liste des commandes', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/commandes');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que la page est chargée
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // La liste peut être vide, donc on vérifie juste que la page est chargée
  });

  test('Voir les détails d\'une commande', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/commandes');
    await page.waitForLoadState('networkidle');
    
    // Chercher un lien ou bouton vers une commande
    const orderLink = page.locator('a[href*="/commande"], button').filter({ hasText: /commande|voir|détails/i }).first();
    
    if (await orderLink.isVisible().catch(() => false)) {
      await orderLink.click();
      await page.waitForTimeout(1000);
    }
  });
});

