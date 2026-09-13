import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const base = 'http://localhost:3000'
const adminPassword = readFileSync('.dev.vars', 'utf8').split('\n').find(s => s.startsWith('ADMIN_PASSWORD='))!.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')
const marker = 'browserqa' + Date.now()
test.setTimeout(90000)

test('mobile portraits/pricing and actual signup/reservation forms', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('dialog', dialog => dialog.accept().catch(() => {}))
  await page.setViewportSize({ width: 390, height: 844 })
  for (const path of ['/doctors', '/doctors/cho-wonik', '/pricing']) {
    await page.goto(base + path)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => (globalThis as any).document.documentElement.scrollWidth <= (globalThis as any).innerWidth)).toBeTruthy()
    if (path === '/pricing') {
      await expect(page.locator('#pricing-status')).toContainText('잠정수가')
      await expect(page.locator('.price-table').first()).toContainText('89만원')
    } else {
      const img = page.locator(path === '/doctors' ? '.team-portrait img' : '#doctor-hero img')
      await expect(img).toBeVisible()
      expect(await img.evaluate((el: any) => el.naturalWidth > 0)).toBeTruthy()
    }
    await page.screenshot({ path: '.test-artifacts/' + path.replaceAll('/', '-') + '-mobile.png', fullPage: true })
  }
  await page.goto(base + '/auth/register')
  await page.locator('[name=name]').fill(marker)
  await page.locator('[name=email]').fill(marker + '@example.com')
  await page.locator('[name=phone]').fill('010-2222-3333')
  await page.locator('[name=password]').fill('Browser-test-password')
  await page.locator('[name=privacy_consent]').check()
  await page.locator('[name=marketing_consent]').check()
  const registration = page.waitForResponse(r => r.url().includes('/api/auth/register') && r.request().method() === 'POST')
  await page.locator('[type=submit]').click()
  expect((await registration).status()).toBe(200)
  await expect(page).toHaveURL(base + '/auth/mypage')
  await expect(page.locator('.form-card')).toContainText(marker)
  await page.goto(base + '/reservation')
  await page.locator('[name=name]').fill(marker)
  await page.locator('[name=phone]').fill('010-2222-3333')
  await page.locator('[name=category]').selectOption({ label: '임플란트' })
  await page.locator('[name=privacy_consent]').check()
  const reservation = page.waitForResponse(r => r.url().includes('/api/reservation'))
  await page.locator('[type=submit]').click()
  expect((await reservation).status()).toBe(200)
  await expect(page.locator('[name=name]')).toHaveValue('')
  expect(errors).toEqual([])
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'gosudental-production', '--local', '--command', `DELETE FROM users WHERE name='${marker}'; DELETE FROM reservations WHERE name='${marker}';`], { stdio: 'pipe' })
})

test('admin browser creates, reloads and edits all content types', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('dialog', dialog => dialog.accept().catch(() => {}))
  await page.goto(base + '/admin/login')
  await page.locator('[name=password]').fill(adminPassword)
  await page.locator('[type=submit]').click()
  await expect(page).toHaveURL(base + '/admin')
  for (const kind of ['cases', 'posts', 'notices']) {
    await page.goto(base + '/admin/' + kind)
    const form = page.locator('form[data-content-kind]')
    await form.locator('[name=title]').fill(marker + '-' + kind)
    if (kind === 'cases') {
      await form.locator('[name=description]').fill('브라우저에서 작성한 설명')
      await form.locator('[name=photo_after]').setInputFiles('public/static/img/favicon-32.png')
    }
    if (kind === 'posts') {
      await form.locator('[name=slug]').fill(marker + '-post')
      await form.locator('#editor').fill('원장 칼럼 본문입니다.')
    }
    if (kind === 'notices') await form.locator('[name=content]').fill('공지사항 본문입니다.')
    const saved = page.waitForResponse(r => r.url().endsWith('/api/admin/' + kind) && r.request().method() === 'POST')
    await form.locator('[type=submit]').click()
    const response = await saved
    expect(response.status()).toBe(200)
    const createdRow = page.locator('tr').filter({ hasText: marker + '-' + kind })
    await expect(createdRow).toBeVisible()
    const id = await createdRow.locator('[data-edit]').getAttribute('data-id')
    await expect(page.locator(`[data-edit="${kind}"][data-id="${id}"]`)).toBeVisible()
    await page.locator(`[data-edit="${kind}"][data-id="${id}"]`).click()
    await expect(form).toHaveAttribute('data-edit-id', String(id))
    await expect(form.locator('[name=title]')).toHaveValue(marker + '-' + kind)
    if (kind === 'cases') await expect(form.locator('[data-preview=photo_after] img')).toBeVisible()
    await form.locator('[name=title]').fill(marker + '-' + kind + '-수정')
    if (kind === 'posts') await form.locator('#editor').fill('수정한 칼럼 본문입니다.')
    if (kind === 'notices') await form.locator('[name=content]').fill('수정한 공지사항 본문입니다.')
    const updated = page.waitForResponse(r => r.url().endsWith('/api/admin/' + kind + '/' + id) && r.request().method() === 'PUT')
    await form.locator('[type=submit]').click()
    const updateResponse = await updated
    expect(updateResponse.status()).toBe(200)
    const row = page.locator('tr').filter({ has: page.locator(`[data-edit="${kind}"][data-id="${id}"]`) })
    await expect(row).toContainText(marker + '-' + kind + '-수정')
    await page.locator(`[data-edit="${kind}"][data-id="${id}"]`).click()
    await expect(form).toHaveAttribute('data-edit-id', String(id))
    await form.locator('.cancel-edit').click()
    await expect(form.locator('[name=title]')).toHaveValue('')
    const deleted = page.waitForResponse(r => r.url().endsWith('/api/admin/' + kind + '/' + id) && r.request().method() === 'DELETE')
    await page.locator(`[data-delete="${kind}"][data-id="${id}"]`).click()
    expect((await deleted).status()).toBe(200)
    await expect(page.locator(`[data-edit="${kind}"][data-id="${id}"]`)).toHaveCount(0)
  }
  expect(errors).toEqual([])
})
