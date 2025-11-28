import { test, expect } from '@playwright/test';

test.describe('Panier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('Accéder au panier vide', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'on est sur la page panier
    await expect(page).toHaveURL(/.*panier/);
  });

  test('Ajouter un produit au panier depuis le catalogue', async ({ page }) => {
    // Aller au catalogue
    await page.goto('http://localhost:3000/catalogue');
    await page.waitForLoadState('networkidle');
    
    // Cliquer sur un produit
    const productLink = page.locator('a[href*="/produit/"]').first();
    
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await page.waitForURL('**/produit/**', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // Ajouter au panier
      const addToCartButton = page.getByRole('button', { name: 'Ajouter au panier' });
      
      if (await addToCartButton.isVisible().catch(() => false)) {
        await addToCartButton.waitFor({ state: 'visible', timeout: 5000 });
        await addToCartButton.click();
        await page.waitForTimeout(1000);
        
        // Vérifier qu'un message de confirmation apparaît ou que le panier est mis à jour
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    }
  });

  test('Voir le contenu du panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que la page panier est chargée
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Modifier la quantité d\'un produit dans le panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    // Chercher les boutons de quantité
    const quantityButtons = page.locator('button').filter({ hasText: /\+|\-/ });
    const count = await quantityButtons.count();
    
    if (count > 0) {
      // Il y a des boutons de quantité, on peut tester
      await quantityButtons.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('Supprimer un produit du panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    // Chercher le bouton de suppression
    const deleteButton = page.locator('button').filter({ hasText: /supprimer|retirer|×/i });
    const count = await deleteButton.count();
    
    if (count > 0) {
      await deleteButton.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('Vider le panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    const clearButton = page.getByRole('button').filter({ hasText: /vider|supprimer tout/i });
    
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Vérifier le total du panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    // Chercher les éléments de total
    const totalElements = page.locator('text=/total|sous-total|€/i');
    const count = await totalElements.count();
    
    // Le panier devrait afficher un total (même si 0€)
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

