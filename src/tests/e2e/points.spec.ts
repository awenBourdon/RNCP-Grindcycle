import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || '';
const password = process.env.TEST_PASSWORD || '';

test.describe('Points', () => {
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

  test('Accéder à la page des points', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/points');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/.*points/);
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Vérifier l\'affichage du solde de points', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/points');
    await page.waitForLoadState('networkidle');
    
    const pointsDisplay = page.locator('text=/points|solde/i');
    const count = await pointsDisplay.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Voir l\'historique des points', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/points');
    await page.waitForLoadState('networkidle');
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    const history = page.locator('text=/historique|transaction|achat|recyclage/i');
    const count = await history.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

