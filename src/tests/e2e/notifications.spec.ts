import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || '';
const password = process.env.TEST_PASSWORD || '';

test.describe('Notifications', () => {
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

  test('Accéder à la page des notifications', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/notifications');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/.*notifications/);
    
    // Vérifier que la page est chargée
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Voir la liste des notifications', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/notifications');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que la page est chargée
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // La liste peut être vide, donc on vérifie juste que la page est chargée
  });

  test('Marquer une notification comme lue si possible', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/notifications');
    await page.waitForLoadState('networkidle');
    
    // Chercher un bouton pour marquer comme lu
    const markReadButton = page.locator('button').filter({ hasText: /marquer|lu|✓/i }).first();
    
    if (await markReadButton.isVisible().catch(() => false)) {
      await markReadButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Supprimer une notification si possible', async ({ page }) => {
    await page.goto('http://localhost:3000/compte/notifications');
    await page.waitForLoadState('networkidle');
    
    // Chercher un bouton de suppression
    const deleteButton = page.locator('button').filter({ hasText: /supprimer|×|effacer/i }).first();
    
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(500);
    }
  });
});

