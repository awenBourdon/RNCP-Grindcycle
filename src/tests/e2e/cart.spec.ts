import { test, expect } from '@playwright/test'

test("doit chercher un skate à moins de 50€ taille 8.2, aller sur la page du produit, l'ajouter au panier puis enlever l'article du panier sur la page panier", async ({ page }) => {
  await page.goto('/catalogue')

  await page.getByRole('button', { name: 'Type de planche' }).click()
  await page.locator('label:has-text("skate") input[type="checkbox"]').check()
  await page.getByRole('button', { name: 'Type de planche' }).click()

  await page.getByRole('button', { name: 'Prix (€)' }).click()
  const prixMaxInput = page.locator('.dropdown input[type="number"]').nth(1)
  await prixMaxInput.fill('50')
  await page.getByRole('button', { name: 'Prix (€)' }).click()

  await page.getByRole('button', { name: 'Taille' }).click()
  await page.locator('.dropdown button:has-text("8.2")').click()
  await page.getByRole('button', { name: 'Taille' }).click()

  await page.locator('a[href^="/produit/"]').first().click()


  await page.getByRole('button', { name: /ajouter/i }).click()


  await page.goto('/panier')


  await expect(page.locator('text=Skate')).toBeVisible()
  await expect(page.locator('text=8.2')).toBeVisible()


  await page.getByRole('button', { name: /supprimer/i }).click()


  const emptyCartHeading = page.locator('h2').filter({ hasText: 'Ton panier est vide' })
  await expect(emptyCartHeading).toBeVisible()
})
