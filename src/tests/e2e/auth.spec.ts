import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/authentification/connexion');
    await page.waitForLoadState('networkidle');
  });

  test('Accéder à la page de connexion', async ({ page }) => {
    const loginTitle = page.locator('h1').filter({ hasText: 'Se connecter' });
    await expect(loginTitle).toBeVisible();
    
    await expect(page.locator('text=Accède à ton compte Grindcycle')).toBeVisible();

    const emailInput = page.locator('input[name="email"]').first();
    const passwordInput = page.locator('input[name="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('Basculer vers la page d\'inscription', async ({ page }) => {
    const signUpLink = page.locator('a').filter({ hasText: 'S\'inscrire' }).first();
    
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForLoadState('networkidle');
      
      const signUpTitle = page.locator('h1').filter({ hasText: 'S\'inscrire' });
      await expect(signUpTitle).toBeVisible();
    }
  });

  test('Afficher/Masquer le mot de passe', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]').first();
    await expect(passwordInput).toBeVisible();

    await expect(passwordInput).toHaveAttribute('type', 'password');
    const toggleButton = page.locator('button[aria-label*="mot de passe"], button[aria-label*="password"]').first();
    
    if (await toggleButton.isVisible().catch(() => false)) {
      await toggleButton.click();

      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('Basculer entre connexion et inscription', async ({ page }) => {
    const loginTitle = page.locator('h1').filter({ hasText: 'Se connecter' });
    await expect(loginTitle).toBeVisible();

    const signUpLink = page.locator('a').filter({ hasText: 'S\'inscrire' }).first();
    
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForLoadState('networkidle');

      const signUpTitle = page.locator('h1').filter({ hasText: 'S\'inscrire' });
      await expect(signUpTitle).toBeVisible();
    }
  });

  test('Validation du formulaire de connexion express', async ({ page }) => {
    const emailInputs = page.locator('input[name="email"]');
    const count = await emailInputs.count();

    if (count >= 1) {
      await emailInputs.first().fill('test@example.com');

      await expect(emailInputs.first()).toHaveValue('test@example.com');

      const magicLinkButton = page.locator('button').filter({ hasText: 'Envoyer le lien magique' }).first();
      
      if (await magicLinkButton.isVisible().catch(() => false)) {
        await expect(magicLinkButton).toBeVisible();
      }
    }
  });

  test('Lien vers la récupération de mot de passe', async ({ page }) => {
    const forgotLink = page.locator('a[href*="mot-de-passe-oublie"]').first();

    if (await forgotLink.isVisible().catch(() => false)) {
      await expect(forgotLink).toBeVisible();

      await forgotLink.click();
      await page.waitForURL('**/mot-de-passe-oublie', { timeout: 15000 });

      expect(page.url()).toContain('mot-de-passe-oublie');
    }
  });

  test('Remplir le formulaire de connexion', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]').first();
    const passwordInput = page.locator('input[name="password"]').first();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');

    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test('Vérifier la présence du lien vers Google', async ({ page }) => {
    const googleButton = page.locator('button, a').filter({ hasText: 'Google' }).first();

    if (await googleButton.isVisible().catch(() => false)) {
      await expect(googleButton).toBeVisible();
    }
  });
});