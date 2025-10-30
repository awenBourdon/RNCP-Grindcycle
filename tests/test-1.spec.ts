import { test, expect } from '@playwright/test';

test('parcours d\'achat complet avec Stripe sur la même page', async ({ page }) => {
  test.setTimeout(120_000); // ⏱️ Timeout global étendu

  // --- 🏠 Accueil ---
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveURL('http://localhost:3000/');

  // --- 🛹 Catalogue ---
  await page.getByRole('link', { name: 'CATALOGUE', exact: true }).click();
  await page.waitForURL('**/catalogue');

  // --- 🎛️ Filtres produit ---
  await page.getByRole('button', { name: 'Type de planche' }).click();
  await page.locator('label', { hasText: 'Skate' }).click();

  await page.getByRole('button', { name: 'Prix (€)' }).click();
  await page.getByRole('slider').first().fill('13');
  await page.getByRole('slider').nth(1).fill('95');

  // --- 🧭 Sélection produit ---
  await page.getByRole('button', { name: 'Réinitialiser' }).click();
  const produit = page.getByRole('link', { name: /SKATE 50 €/i }).first();
  await expect(produit).toBeVisible();
  await produit.click();

  // --- 🛒 Ajout au panier ---
  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Panier' }).click();
  await page.waitForURL('**/panier');

  // --- 💳 Paiement ---
  await page.getByRole('button', { name: 'Payer par carte' }).click();
  await page.getByRole('link', { name: 'Continuer en invité' }).click();

  // 🔥 Page livraison
  await page.waitForURL('**/paiement/achat/livraison');
  await page.getByRole('textbox', { name: 'Prénom *' }).waitFor({ state: 'visible' });

  // --- 🧾 Formulaire livraison ---
  await page.getByRole('textbox', { name: 'Prénom *' }).fill('Luke');
  await page.getByRole('textbox', { name: 'Nom *', exact: true }).fill('Skywalker');
  await page.getByRole('textbox', { name: 'Adresse *' }).fill('32 rue des Jedi');
  await page.getByRole('textbox', { name: 'Ville *' }).fill('Mos Esleis');
  await page.getByRole('textbox', { name: 'Code postal *' }).fill('44000');
  await page.getByRole('textbox', { name: 'Email *' }).fill('luke@jedi.com');
  await page.getByRole('textbox', { name: 'Téléphone' }).fill('0987656789');

  // --- 🚀 Étape paiement ---
  await page.getByRole('button', { name: 'Procéder au paiement' }).click();

  // ✅ Attendre redirection Stripe Checkout
  await page.waitForURL('**checkout.stripe.com/**', { timeout: 60000 });
  await expect(page.locator('text=Payment method')).toBeVisible({ timeout: 20000 });

  // --- 💰 Simulation saisie carte ---
  // Wait for Stripe iframe to be attached to DOM
  await page.locator('iframe[name^="__privateStripeFrame"]').waitFor({ state: 'attached', timeout: 30000 });
  
  const stripeIframe = page.frameLocator('iframe[name^="__privateStripeFrame"]');

  // Wait for card number field to be visible within the iframe
  await stripeIframe.getByPlaceholder('1234 1234 1234 1234').waitFor({ state: 'visible', timeout: 30000 });

  // Fill card details
  await stripeIframe.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242');
  await stripeIframe.getByPlaceholder('MM / YY').fill('04 / 44');
  await stripeIframe.getByPlaceholder('CVC').fill('444');
  await stripeIframe.getByPlaceholder('Full name on card').fill('Luke Skywalker');

  // --- ✅ Soumission paiement ---
  await page.getByRole('button', { name: /Pay|Payer|Submit/i }).click({ timeout: 15000 });

  // --- 🎉 Vérifier retour site et succès ---
  await page.waitForURL('**/paiement/achat/succes**', { timeout: 60000 });
  await expect(page.locator('text=Paiement réussi')).toBeVisible({ timeout: 15000 });
});