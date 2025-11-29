import { test } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || "";
const password = process.env.TEST_PASSWORD || "";

test('Accéder aux différentes parties du compte', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'En savoir plus' }).click();
  await page.getByRole('link', { name: 'Mon compte' }).click();
  
  await page.waitForURL('**/authentification/connexion**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');
  
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  
  await emailInput.fill(email);
  await passwordInput.fill(password);
  
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.waitForURL('**/compte**', { timeout: 20000 });
  await page.waitForURL('**/compte/profil', { timeout: 5000 }).catch(async () => {
    const currentUrl = page.url();
    if (currentUrl.includes('/compte') && !currentUrl.includes('/compte/profil')) {
      await page.waitForURL('**/compte/profil', { timeout: 10000 });
    }
  });
  
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Sécurité' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Planches envoyés' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Mes commandes' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Mes points' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Notifications' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Favoris' }).click();
  await page.waitForLoadState('networkidle');
  
  const discoverLink = page.getByRole('link', { name: 'Découvrir nos planches' });
  if (await discoverLink.isVisible().catch(() => false)) {
    await discoverLink.click();
    await page.waitForLoadState('networkidle');
  }
});