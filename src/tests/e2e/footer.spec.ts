import { test, expect } from '@playwright/test';

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('devrait afficher le footer avec toutes les sections', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('devrait afficher tous les titres de section', async ({ page }) => {
    await expect(page.locator('text=Plan du site')).toBeVisible();
    await expect(page.locator('text=Juridique')).toBeVisible();
    await expect(page.locator('text=Réseaux sociaux')).toBeVisible();
    await expect(page.locator('text=Nous contacter')).toBeVisible();
  });

  test('devrait avoir tous les liens de navigation dans la section Plan du site', async ({ page }) => {
    const footer = page.locator('footer');
    const planDuSiteLinks = [
      { text: 'Accueil', href: '/' },
      { text: 'Catalogue', href: '/catalogue' },
      { text: 'À propos', href: '/a-propos' },
      { text: 'Panier', href: '/panier' },
      { text: 'Compte', href: '/compte' },
    ];
    for (const link of planDuSiteLinks) {
      const element = footer.locator(`a[href="${link.href}"]`).filter({ hasText: link.text }).first();
      await expect(element).toBeVisible();
    }
  });

  test('devrait avoir tous les liens juridiques dans la section Juridique', async ({ page }) => {
    const footer = page.locator('footer');
    const legalLinks = [
      { text: 'Mentions légales', href: '/mentions-legales' },
      { text: 'Politique de confidentialité', href: '/politique-confidentialite' },
      { text: 'Conditions générales de vente', href: '/conditions-generales-vente' },
    ];
    for (const link of legalLinks) {
      const element = footer.locator(`a[href="${link.href}"]`).filter({ hasText: link.text }).first();
      await expect(element).toBeVisible();
    }
  });

  test('devrait avoir tous les liens des réseaux sociaux', async ({ page }) => {
    const footer = page.locator('footer');
    const socialLinks = [
      { text: 'LinkedIn', href: 'https://linkedin.com' },
      { text: 'Instagram', href: 'https://instagram.com' },
      { text: 'Facebook', href: 'https://facebook.com' },
      { text: 'X', href: 'https://x.com' },
    ];
    for (const link of socialLinks) {
      const element = footer.locator(`a[href="${link.href}"]`).filter({ hasText: link.text }).first();
      await expect(element).toBeVisible();
    }
  });

  test('devrait afficher les informations de contact', async ({ page }) => {
    await expect(page.locator('text=hellogrindcycle@gmail.com')).toBeVisible();
    await expect(page.locator('text=02 40 41 42 43')).toBeVisible();
    await expect(page.locator('text=9h - 18h')).toBeVisible();
  });

  test('devrait afficher le texte de copyright avec l\'année en cours', async ({ page }) => {
    const currentYear = new Date().getFullYear();
    await expect(page.locator(`text=© ${currentYear} GRINDCYCLE. Tous droits réservés.`)).toBeVisible();
  });

  test('devrait afficher le nom de marque GRINDCYCLE', async ({ page }) => {
    const brandName = page.locator('h1', { hasText: 'GRINDCYCLE' });
    await expect(brandName).toBeVisible();
  });

  test('devrait avoir le bon style pour l\'arrière-plan du pied de page', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toHaveClass(/bg-\[#f8f7f4\]/);
  });

  test('les liens internes devraient naviguer correctement', async ({ page }) => {
    await page.click('a[href="/catalogue"]');
    await expect(page).toHaveURL(/.*\/catalogue/);
  });

  test('les liens externes des réseaux sociaux devraient avoir l\'attribut target', async ({ page }) => {
    const linkedinLink = page.locator('a[href="https://linkedin.com"]');
    await expect(linkedinLink).toBeVisible();
  });
});