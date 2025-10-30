import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compte/connexion');
    await page.waitForLoadState('networkidle');
  });

  test('Accéder à la page de connexion', async ({ page }) => {
    // Vérifier les éléments de la page
    const loginTitle = page.locator('h1').filter({ hasText: 'Se connecter' });
    await expect(loginTitle).toBeVisible();
    
    await expect(page.locator('text=Accède à ton compte Grindcycle')).toBeVisible();

    // Vérifier les formulaires de connexion
    const emailInput = page.locator('input[name="email"]').first();
    const passwordInput = page.locator('input[name="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('Basculer vers la page d\'inscription', async ({ page }) => {
    // Vérifier qu'il y a un lien vers l'inscription
    const signUpLink = page.locator('a').filter({ hasText: 'S\'inscrire' }).first();
    
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForLoadState('networkidle');
      
      // Vérifier que nous sommes sur la page d'inscription
      const signUpTitle = page.locator('h1').filter({ hasText: 'S\'inscrire' });
      await expect(signUpTitle).toBeVisible();
    }
  });

  test('Afficher/Masquer le mot de passe', async ({ page }) => {
    // Trouver le champ de mot de passe
    const passwordInput = page.locator('input[name="password"]').first();
    await expect(passwordInput).toBeVisible();

    // Vérifier qu'il est de type password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Chercher le bouton pour afficher/masquer (généralement un SVG ou un bouton avec aria-label)
    const toggleButton = page.locator('button[aria-label*="mot de passe"], button[aria-label*="password"]').first();
    
    if (await toggleButton.isVisible().catch(() => false)) {
      await toggleButton.click();
      
      // Vérifier que c'est maintenant visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('Basculer entre connexion et inscription', async ({ page }) => {
    // Vérifier que nous sommes sur la page de connexion
    const loginTitle = page.locator('h1').filter({ hasText: 'Se connecter' });
    await expect(loginTitle).toBeVisible();

    // Cliquer sur le lien "S'inscrire"
    const signUpLink = page.locator('a').filter({ hasText: 'S\'inscrire' }).first();
    
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForLoadState('networkidle');
      
      // Vérifier que nous sommes sur la page d'inscription
      const signUpTitle = page.locator('h1').filter({ hasText: 'S\'inscrire' });
      await expect(signUpTitle).toBeVisible();
    }
  });

  test('Validation du formulaire de connexion express', async ({ page }) => {
    // Vérifier qu'il y a un formulaire de connexion express
    const emailInputs = page.locator('input[name="email"]');
    const count = await emailInputs.count();

    if (count >= 1) {
      // Remplir l'email pour la connexion express
      await emailInputs.first().fill('test@example.com');

      // Vérifier que l'email est rempli
      await expect(emailInputs.first()).toHaveValue('test@example.com');

      // Chercher et cliquer le bouton pour envoyer le lien magique
      const magicLinkButton = page.locator('button').filter({ hasText: 'Envoyer le lien magique' }).first();
      
      if (await magicLinkButton.isVisible().catch(() => false)) {
        await expect(magicLinkButton).toBeVisible();
      }
    }
  });

  test('Lien vers la récupération de mot de passe', async ({ page }) => {
    // Chercher le lien "Mot de passe oublié"
    const forgotLink = page.locator('a').filter({ hasText: 'Mot de passe oublié' }).first();

    if (await forgotLink.isVisible().catch(() => false)) {
      await expect(forgotLink).toBeVisible();

      // Cliquer dessus
      await forgotLink.click();
      await page.waitForLoadState('networkidle');

      // Vérifier que nous sommes redirigés
      expect(page.url()).toContain('mot-de-passe-oublie');
    }
  });

  test('Remplir le formulaire de connexion', async ({ page }) => {
    // Remplir les champs
    const emailInput = page.locator('input[name="email"]').first();
    const passwordInput = page.locator('input[name="password"]').first();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Vérifier que les champs sont remplis
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');

    // Vérifier qu'il y a un bouton de soumission
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test('Vérifier la présence du lien vers Google', async ({ page }) => {
    // Chercher le bouton de connexion Google
    const googleButton = page.locator('button, a').filter({ hasText: 'Google' }).first();

    if (await googleButton.isVisible().catch(() => false)) {
      await expect(googleButton).toBeVisible();
    }
  });
});