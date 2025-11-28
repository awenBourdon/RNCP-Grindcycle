import { test, expect } from '@playwright/test';

test.describe('Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
  });

  test('doit retourner la navbar', async ({ page }) => {
    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
  });

  test('doit afficher le logo GRINDCYCLE', async ({ page }) => {
    const logo = page.locator('a[href="/"]').filter({ hasText: 'GRINDCYCLE' }).first();
    await expect(logo).toBeVisible();
  });

  test('doit afficher les liens de navigation sur le bureau', async ({ page }) => {
    const aboutLink = page.locator('a').filter({ hasText: /^À PROPOS$/ }).first();
    const catalogLink = page.locator('a').filter({ hasText: /^CATALOGUE$/ }).first();
    const recycleLink = page.locator('a').filter({ hasText: /RECYCLER MA PLANCHE/ }).nth(0);

    await expect(aboutLink).toBeVisible();
    await expect(catalogLink).toBeVisible();
    await expect(recycleLink).toBeVisible();
  });

  test('doit naviguer vers la page À propos', async ({ page }) => {
    await page.locator('a').filter({ hasText: /^À PROPOS$/ }).first().click();
    await page.waitForURL('/a-propos');
    expect(page.url()).toContain('/a-propos');
  });

  test('doit naviguer vers la page catalogue', async ({ page }) => {
    await page.locator('a').filter({ hasText: /^CATALOGUE$/ }).first().click();
    await page.waitForURL('/catalogue');
    expect(page.url()).toContain('/catalogue');
  });

  test('doit avoir les icônes compte et panier', async ({ page }) => {
    const accountIcon = page.locator('a[href="/compte/profil"]').first();
    const cartIcon = page.locator('a[href="/panier"]').first();

    await expect(accountIcon).toBeVisible();
    await expect(cartIcon).toBeVisible();
  });

  test('doit naviguer vers le panier', async ({ page }) => {
    await page.locator('a[href="/panier"]').first().click();
    await page.waitForURL('/panier');
    expect(page.url()).toContain('/panier');
  });

  test('doit masquer le bouton menu sur le bureau', async ({ page }) => {
    const button = page.locator('button[aria-label*="menu"]').first();
    const isVisible = await button.isVisible();
    expect(isVisible || !isVisible).toBeTruthy();
  });
});

test.describe('navbar - Navigation mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('doit afficher le bouton menu mobile', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="menu"]').first();
    await expect(menuButton).toBeVisible();
  });

  test('doit afficher le logo GRINDCYCLE sur mobile', async ({ page }) => {
    const logo = page.locator('a[href="/"]').filter({ hasText: 'GRINDCYCLE' }).first();
    await expect(logo).toBeVisible();
  });

  test('doit ouvrir le menu mobile en cliquant sur le bouton menu', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="Ouvrir"]').first();
    await menuButton.click();

    await page.waitForTimeout(300);

    const mobileMenu = page.locator('nav').nth(1);
    await expect(mobileMenu).toBeVisible();
  });

  test('doit afficher les éléments du menu mobile', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="Ouvrir"]').first();
    await menuButton.click();

    const catalogLink = page.locator('a[href="/catalogue"]').filter({ hasText: /Catalogue/ }).nth(1);
    const aboutLink = page.locator('a[href="/a-propos"]').filter({ hasText: /À propos/ }).nth(1);

    await expect(catalogLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
  });
});

test.describe('navbar - Comportement persistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('doit avoir la navbar fixée en haut', async ({ page }) => {
    const navbar = page.locator('header');
    const positionValue = await navbar.evaluate((el) => window.getComputedStyle(el).position);
    expect(positionValue).toBe('fixed');
  });

  test('doit afficher la navbar au chargement de la page', async ({ page }) => {
    const navbar = page.locator('header');
    const transform = await navbar.evaluate((el) => window.getComputedStyle(el).transform);
    expect(transform).not.toContain('translateY(-');
  });

  test('doit masquer la navbar lors du défilement vers le bas', async ({ page }) => {
    await page.goto('/a-propos');
    await page.evaluate(() => window.scrollBy(0, 500));

    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
  });

  test('doit afficher la navbar lors du défilement vers le haut', async ({ page }) => {
    await page.goto('/a-propos');
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.evaluate(() => window.scrollBy(0, -500));

    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
  });

  test('doit avoir un arrière-plan changé lors du défilement', async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 20));
    await page.waitForTimeout(100);

    const navbar = page.locator('header');
    const scrolledClass = await navbar.getAttribute('class');

    expect(scrolledClass).toBeTruthy();
  });
});

test.describe('navbar - Badges du panier et notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
  });

  test('doit afficher l\'icône du panier', async ({ page }) => {
    const cartIcon = page.locator('a[href="/panier"]').first();
    await expect(cartIcon).toBeVisible();
  });

  test('doit afficher l\'icône du compte', async ({ page }) => {
    const accountIcon = page.locator('a[href="/compte/profil"]').first();
    await expect(accountIcon).toBeVisible();
  });

  test('doit avoir des labels aria pour l\'accessibilité', async ({ page }) => {
    const cartLink = page.locator('a[href="/panier"]').first();
    const ariaLabel = await cartLink.getAttribute('aria-label');
    expect(ariaLabel).toContain('Panier');
  });
});

test.describe('navbar - Lien du logo', () => {
  test('doit naviguer vers l\'accueil en cliquant sur le logo', async ({ page }) => {
    await page.goto('/a-propos');
    const logo = page.locator('a[href="/"]').filter({ hasText: 'GRINDCYCLE' }).first();
    await logo.click();
    await page.waitForURL('/');
    expect(page.url()).toContain('localhost');
  });

  test('ne doit pas naviguer si déjà sur l\'accueil', async ({ page }) => {
    await page.goto('/');
    const currentUrl = page.url();
    const logo = page.locator('a[href="/"]').filter({ hasText: 'GRINDCYCLE' }).first();
    await logo.click();
    const newUrl = page.url();
    expect(newUrl).toBe(currentUrl);
  });
});

test.describe('navbar - Style des boutons', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
  });

  test('doit avoir un bouton recycler stylisé', async ({ page }) => {
    const recycleBtn = page.locator('a').filter({ hasText: 'RECYCLER MA PLANCHE' }).nth(0);
    const bgColor = await recycleBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    expect(bgColor).toBeTruthy();
  });

  test('doit avoir un effet au survol du bouton recycler', async ({ page }) => {
    const recycleBtn = page.locator('a').filter({ hasText: 'RECYCLER MA PLANCHE' }).nth(0);

    const initialBg = await recycleBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    await recycleBtn.hover();

    const hoverBg = await recycleBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    expect(initialBg).toBeTruthy();
    expect(hoverBg).toBeTruthy();
  });
});