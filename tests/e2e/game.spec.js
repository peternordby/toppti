import { test, expect } from '@playwright/test'

const setupTeams = async (page, names) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Nytt spill' }).click()
  for (let i = 1; i < names.length; i++) await page.getByRole('button', { name: '+ Legg til lag' }).click()
  for (const [i, name] of names.entries()) await page.getByLabel(`Navn på lag ${i + 1}`, { exact: true }).fill(name)
  await page.getByRole('button', { name: 'Start' }).click()
  // Measurements depend on the bundled font, so wait until it has loaded.
  await page.evaluate(() => document.fonts.ready)
}

const answerRows = (page) => page.locator('.answerRow')

const standings = async (page) => {
  await page.getByRole('button', { name: 'Stilling' }).click()
  const rows = await page.locator('.standingsDialog li').evaluateAll((items) =>
    items.map((li) => [li.firstElementChild.textContent, Number(li.querySelector('strong').textContent)])
  )
  await page.getByRole('button', { name: 'Lukk' }).click()
  return rows
}

test('home screen links to rules and editions', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Topp 10' })).toBeVisible()
  await page.getByRole('button', { name: 'Regler' }).click()
  await expect(page.getByRole('heading', { name: 'Regler' })).toBeVisible()
  await page.getByRole('button', { name: 'Hjem' }).click()
  await page.getByRole('button', { name: /Utgave: Normal/ }).click()
  await page.getByRole('button', { name: /VM 2026/ }).click()
  await expect(page.getByRole('button', { name: /Utgave: VM 2026/ })).toBeVisible()
})

test('team setup needs at least one named team', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Nytt spill' }).click()
  const start = page.getByRole('button', { name: 'Start' })
  await expect(start).toBeDisabled()
  await page.getByLabel('Navn på lag 1').fill('Røde')
  await expect(start).toBeEnabled()
  await page.getByRole('button', { name: '+ Legg til lag' }).click()
  await page.getByRole('button', { name: 'Fjern lag 2' }).click()
  await expect(page.getByLabel("Navn på lag 2", { exact: true })).toHaveCount(0)
})

test('host scores each team by tapping their answer', async ({ page }) => {
  await setupTeams(page, ['Røde', 'Blå', 'Grønne'])
  await page.getByRole('button', { name: 'Vis fasit' }).click()

  // Tapping an answer scores the active team and moves on to the next one.
  await expect(page.locator('.activeTeam strong')).toHaveText('Røde')
  await answerRows(page).nth(6).click()
  await expect(page.locator('.activeTeam strong')).toHaveText('Blå')
  await answerRows(page).nth(2).click()
  await page.getByRole('button', { name: /Ikke på listen/ }).click()

  expect(await standings(page)).toEqual([['Røde', 7], ['Blå', 3], ['Grønne', 0]])
  await expect(answerRows(page).nth(6)).toContainText('Røde')

  // Correct a mistake: switch back to Blå and pick another answer.
  await page.getByRole('button', { name: 'Forrige lag' }).click()
  await expect(page.locator('.activeTeam strong')).toHaveText('Blå')
  await answerRows(page).nth(9).click()
  expect(await standings(page)).toEqual([['Blå', 10], ['Røde', 7], ['Grønne', 0]])

  // Going back to a scored round keeps the fasit and points.
  await page.getByRole('button', { name: 'Neste ›' }).click()
  await expect(page.getByRole('button', { name: 'Vis fasit' })).toBeVisible()
  await page.getByRole('button', { name: '‹ Forrige' }).click()
  await expect(answerRows(page).nth(9)).toContainText('Blå')
})

test('finished screen announces the winner', async ({ page }) => {
  await setupTeams(page, ['Røde', 'Blå'])
  await page.getByRole('button', { name: 'Vis fasit' }).click()
  await answerRows(page).nth(1).click()
  await answerRows(page).nth(4).click()
  for (let i = 1; i < 20; i++) await page.getByRole('button', { name: 'Neste ›' }).click()
  await page.getByRole('button', { name: 'Se resultat' }).click()
  await expect(page.getByRole('heading', { name: 'Blå vant!' })).toBeVisible()
  await expect(page.locator('.standings li').first()).toContainText('5 poeng')
})

test('the whole list fits above the navigation for every question with 10 teams', async ({ page }) => {
  await setupTeams(page, Array.from({ length: 10 }, (_, i) => `Lag ${i + 1}`))
  for (let q = 1; q <= 20; q++) {
    await page.getByRole('button', { name: 'Vis fasit' }).click()
    const overflow = await page.evaluate(() => {
      const rows = document.querySelectorAll('.answerRow')
      return rows[rows.length - 1].getBoundingClientRect().bottom - document.querySelector('.navigation').getBoundingClientRect().top
    })
    expect(overflow, `question ${q} («${await page.locator('h1').innerText()}») overflows the bottom nav by ${Math.round(overflow)}px`).toBeLessThanOrEqual(0)
    if (q < 20) await page.getByRole('button', { name: 'Neste ›' }).click()
  }
})

test('Stilling button is centred in the top bar', async ({ page }) => {
  await setupTeams(page, ['Røde'])
  const bar = await page.locator('.topbar').boundingBox()
  const button = await page.getByRole('button', { name: 'Stilling' }).boundingBox()
  expect(Math.abs(button.x + button.width / 2 - (bar.x + bar.width / 2))).toBeLessThan(1)
})

test('can play without teams or scoring', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Nytt spill' }).click()
  await page.getByRole('button', { name: 'Spill uten poeng' }).click()
  await expect(page.getByRole('button', { name: 'Stilling' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Vis fasit' }).click()
  await expect(page.locator('.answers li')).toHaveCount(10)
  await expect(page.locator('.teamSwitcher')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Ikke på listen/ })).toHaveCount(0)
  for (let i = 1; i < 20; i++) await page.getByRole('button', { name: 'Neste ›' }).click()
  await page.getByRole('button', { name: 'Se resultat' }).click()
  await expect(page.getByRole('heading', { name: 'Takk for at dere spilte!' })).toBeVisible()
  await expect(page.locator('.standings')).toHaveCount(0)
  // «Spill igjen» keeps the no-score mode.
  await page.getByRole('button', { name: 'Spill igjen' }).click()
  await expect(page.getByRole('button', { name: 'Stilling' })).toHaveCount(0)
})
