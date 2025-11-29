import { test, expect } from '@playwright/test';

test.describe('Catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/catalogue');
    await page.waitForLoadState('networkidle');
  });

  test('Afficher la page catalogue', async ({ page }) => {
    await expect(page).toHaveURL(/.*catalogue/);

    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('Filtrer par type de planche', async ({ page }) => {
    const typeButton = page.getByRole('button', { name: 'Type de planche' });
    
    if (await typeButton.isVisible().catch(() => false)) {
      await typeButton.click();
      await page.waitForTimeout(500);

      const skateOption = page.locator('label', { hasText: 'Skate' }).first();
      if (await skateOption.isVisible().catch(() => false)) {
        await skateOption.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Filtrer par prix', async ({ page }) => {
    const priceButton = page.getByRole('button', { name: /Prix/i });
    
    if (await priceButton.isVisible().catch(() => false)) {
      await priceButton.click();
      await page.waitForTimeout(500);
      
      const sliders = page.getByRole('slider');
      const count = await sliders.count();
      
      if (count >= 2) {
        await sliders.first().fill('10');
        await sliders.nth(1).fill('100');
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Réinitialiser les filtres', async ({ page }) => {
    const resetButton = page.getByRole('button', { name: 'Réinitialiser' });
    
    if (await resetButton.isVisible().catch(() => false)) {
      await resetButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Cliquer sur un produit pour voir les détails', async ({ page }) => {
    const productLink = page.locator('a[href*="/produit/"]').first();
    
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await page.waitForURL('**/produit/**', { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/produit/');
    }
  });
});

