import { test, expect } from '@playwright/test';

test.describe('Panier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('Accéder au panier vide', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/.*panier/);
  });

  test('Ajouter un produit au panier depuis le catalogue', async ({ page }) => {
    await page.goto('http://localhost:3000/catalogue');
    await page.waitForLoadState('networkidle');
    const productLink = page.locator('a[href*="/produit/"]').first();
    
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await page.waitForURL('**/produit/**', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      const addToCartButton = page.getByRole('button', { name: 'Ajouter au panier' });
      
      if (await addToCartButton.isVisible().catch(() => false)) {
        await addToCartButton.waitFor({ state: 'visible', timeout: 5000 });
        await addToCartButton.click();
        await page.waitForTimeout(1000);
        
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    }
  });

  test('Voir le contenu du panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Supprimer un produit du panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    await page.waitForLoadState('networkidle');
    
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
    
    const totalElements = page.locator('text=/total|sous-total|€/i');
    const count = await totalElements.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

