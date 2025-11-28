import { test } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || "";
const password = process.env.TEST_PASSWORD || "";

test('Accéder aux différentes parties du compte', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'En savoir plus' }).click();
  await page.getByRole('link', { name: 'Mon compte' }).click();
  
  // Attendre la navigation vers la page de connexion
  await page.waitForURL('**/authentification/connexion**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  // Attendre que les champs soient visibles et interactifs
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');
  
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  
  await emailInput.fill(email);
  await passwordInput.fill(password);
  
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  
  // Attendre d'abord /compte, puis la redirection vers /compte/profil
  // La page /compte redirige automatiquement vers /compte/profil côté serveur
  await page.waitForURL('**/compte**', { timeout: 20000 });
  // Attendre que la redirection vers /compte/profil se fasse (peut être instantanée)
  await page.waitForURL('**/compte/profil', { timeout: 5000 }).catch(async () => {
    // Si on est toujours sur /compte après 5s, forcer le rechargement ou attendre plus
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
  
  // Le lien "Découvrir nos planches" peut ne pas exister, vérifier d'abord
  const discoverLink = page.getByRole('link', { name: 'Découvrir nos planches' });
  if (await discoverLink.isVisible().catch(() => false)) {
    await discoverLink.click();
    await page.waitForLoadState('networkidle');
  }
});