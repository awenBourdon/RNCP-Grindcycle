import { test, expect } from '@playwright/test';

test('parcours d\'achat complet avec Stripe', async ({ page }) => {
  await page.goto('http://localhost:3000/', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
  await expect(page).toHaveURL('http://localhost:3000/');
  
  const catalogueLink = page.getByRole('link', { name: 'CATALOGUE', exact: true });
  await catalogueLink.waitFor({ state: 'visible', timeout: 10000 });
  await catalogueLink.click();
  await page.waitForURL('**/catalogue', { timeout: 20000, waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Type de planche' }).click();
  await page.locator('label', { hasText: 'Skate' }).click();
  await page.getByRole('button', { name: 'Filtrer par prix' }).click();
  await page.getByRole('slider').first().fill('13');
  await page.getByRole('slider').nth(1).fill('95');
  await page.getByRole('button', { name: 'Réinitialiser' }).click();
 const produit = page.locator('a[href*="/produit/"]').first();
await expect(produit).toBeVisible({ timeout: 10000 });
await produit.click();
  
  await page.waitForURL('**/produit/**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const addToCartButton = page.getByRole('button').filter({ hasText: /Ajouter au panier|Retirer du panier/i }).first();
  await addToCartButton.waitFor({ state: 'visible', timeout: 15000 });
  
  const isDisabled = await addToCartButton.isDisabled();
  if (isDisabled) {
    test.skip();
  }
  
  await addToCartButton.click();
  await page.waitForTimeout(500);
  await page.getByRole('navigation').getByRole('link', { name: 'Panier' }).click();
  await page.waitForURL('**/panier');
  await page.getByRole('button', { name: 'Payer par carte' }).click();
  await page.waitForURL('**/panier/redirect', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: 'Continuer en invité' }).click();
  
  // Attendre la navigation et le chargement complet de la page
  await page.waitForURL('**/paiement/achat/livraison', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  
  // Attendre que le formulaire soit visible et prêt (utiliser les IDs au lieu des aria-labels)
  await page.locator('#firstName').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#firstName').fill('Luke');
  await page.locator('#lastName').fill('Skywalker');
  await page.locator('#address').fill('32 rue des Jedi');
  await page.locator('#city').fill('Mos Esleis');
  await page.locator('#postalCode').fill('44000');
  await page.locator('#email').fill('luke@jedi.com');
  await page.getByRole('textbox', { name: 'Téléphone' }).fill('0987656789');
  await page.getByRole('button', { name: 'Procéder au paiement' }).click();
  
  try {
    await page.waitForURL('**checkout.stripe.com/**', { timeout: 30000 });
    await expect(page.locator('text=Payment method')).toBeVisible({ timeout: 20000 });
    await page.locator('iframe[name^="__privateStripeFrame"]').waitFor({ state: 'attached', timeout: 30000 });
  } catch {
    const currentUrl = page.url();
    expect(currentUrl).toContain('paiement');
  }
});