import { test } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const email = process.env.TEST_EMAIL || "";
const password = process.env.TEST_PASSWORD || "";

test('Envoi d\'une planche usagée', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'RECYCLER MA PLANCHE', exact: true }).click();
  
  await page.getByRole('link', { name: 'Se connecter' }).click();
  
  // Attendre la navigation vers la page de connexion
  await page.waitForURL('**/authentification/connexion**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  // Attendre que les champs soient visibles et interactifs
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');
  
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  
  // Utiliser fill() au lieu de type() pour plus de fiabilité
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
  
  // Naviguer vers recycler-planche en utilisant le lien de la navbar
  await page.getByRole('link', { name: 'RECYCLER MA PLANCHE' }).click();
  await page.waitForURL('**/recycler-planche', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').clear();
  await page.locator('input[name="name"]').type('Skate Zero taille 8', { delay: 50 });
  
  await page.getByRole('button', { name: 'Skate' }).click();
  await page.waitForTimeout(300);
  
  await page.getByRole('button', { name: 'Bon état' }).click();
  await page.waitForTimeout(300);
  
  await page.getByRole('textbox', { name: 'Description (optionnel)' }).click();
  await page.getByRole('textbox', { name: 'Description (optionnel)' }).clear();
  await page.getByRole('textbox', { name: 'Description (optionnel)' }).type('Légèrement fissuré', { delay: 50 });
  
const fileInput = page.locator('input[type="file"]').first();
await fileInput.setInputFiles('public/aboutHero.webp');
await page.waitForTimeout(500);
  
  await page.getByRole('button', { name: 'Soumettre ma planche' }).click();
  await page.waitForLoadState('networkidle');
  
  // Scroller vers le haut pour s'assurer que le lien est visible
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  
  // Utiliser le sélecteur direct pour le lien "Mon compte"
  const accountLink = page.locator('a[href="/compte/profil"]').first();
  await accountLink.waitFor({ state: 'visible', timeout: 5000 });
  await accountLink.scrollIntoViewIfNeeded();
  await accountLink.click();
  await page.waitForURL('**/compte/profil', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Planches envoyés' }).click();
  await page.waitForLoadState('networkidle');
});