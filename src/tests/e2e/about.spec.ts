import { test, expect } from '@playwright/test';

test.describe('Page À Propos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/a-propos');
    await page.waitForLoadState('networkidle');
  });


  test('Afficher la section Notre Mission', async ({ page }) => {
    const missionTitle = page.locator('h2').filter({ hasText: 'Notre Mission' });
    await expect(missionTitle).toBeVisible();
    await expect(page.locator('text=Chez Grindcycle, nous sommes passionnés')).toBeVisible();
    
    const image = page.locator('img[alt="Atelier grindcycle"]');
    await expect(image).toBeVisible();
  });

  test('Afficher la section Notre Impact', async ({ page }) => {
    const impactSection = page.locator('h2').filter({ hasText: 'Notre Impact' });
    await impactSection.scrollIntoViewIfNeeded();
    
    await expect(impactSection).toBeVisible();
    
    await expect(page.locator('text=500+')).toBeVisible();
    await expect(page.locator('text=2 tonnes')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible();
  });

  test('Afficher la section FAQ', async ({ page }) => {
    const faqSection = page.locator('h2').filter({ hasText: 'Questions Fréquentes' });
    await faqSection.scrollIntoViewIfNeeded();
    
    await expect(faqSection).toBeVisible();
    
    await expect(page.locator('h3').first()).toBeVisible();
  });

  test('Lire une réponse FAQ', async ({ page }) => {
    const faqSection = page.locator('h2').filter({ hasText: 'Questions Fréquentes' });
    await faqSection.scrollIntoViewIfNeeded();
    

    const firstAnswer = page.locator('text=Non ! L\'envoi de ta planche usée est totalement gratuit');
    await expect(firstAnswer).toBeVisible();
  });

  test('Afficher les questions courantes', async ({ page }) => {
    const faqSection = page.locator('h2').filter({ hasText: 'Questions Fréquentes' });
    await faqSection.scrollIntoViewIfNeeded();
    
    const questions = [
      'Y a-t-il des frais de port pour envoyer ma planche',
      'Combien de temps faut-il pour que ma planche soit validée',
      "Ma planche n'a pas été acceptée, pourquoi",
      'Comment fonctionne le système de points'
    ];
    
    for (const question of questions) {
      await expect(page.locator(`h3:has-text("${question}")`)).toBeVisible();
    }
  });

  test('Afficher la section Contact', async ({ page }) => {
    const lastH2 = page.locator('h2').last();
    await lastH2.scrollIntoViewIfNeeded();
    
    await expect(page.locator('h2').filter({ hasText: 'Questions Fréquentes' })).toBeVisible();
  });

  test('Vérifier plusieurs réponses FAQ spécifiques', async ({ page }) => {
    const faqSection = page.locator('h2').filter({ hasText: 'Questions Fréquentes' });
    await faqSection.scrollIntoViewIfNeeded();
    
    await expect(page.locator('text=Non ! L\'envoi de ta planche usée est totalement gratuit')).toBeVisible();
    await expect(page.locator('text=Absolument ! Nous utilisons des techniques de fabrication avancées')).toBeVisible();
    await expect(page.locator('text=Tu gagnes en moyenne 50 points par planche')).toBeVisible();
  });
});