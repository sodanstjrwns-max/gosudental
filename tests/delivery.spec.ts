import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const base = 'http://localhost:3000'
test.setTimeout(180000)

test('delivery: public/mobile accessibility and local font dependencies', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const reports: object[] = []
  for (const path of ['/', '/reservation', '/auth/register', '/auth/login', '/cases', '/pricing', '/encyclopedia', '/directions', '/admin/login']) {
    const errors: string[] = []
    const onError = (error: Error) => errors.push(error.message)
    page.on('pageerror', onError)
    await page.goto(base + path)
    await page.evaluate(() => (globalThis as any).document.fonts.ready)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    reports.push({ path, violations: result.violations })
    expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), path).toEqual([])
    expect(await page.evaluate(() => (globalThis as any).document.documentElement.scrollWidth <= (globalThis as any).innerWidth), path + ' horizontal overflow').toBeTruthy()
    expect(await page.locator('link[rel=stylesheet]').evaluateAll(nodes => nodes.map(node => (node as any).href).filter(href => !href.startsWith((globalThis as any).location.origin))), path).toEqual([])
    expect(errors, path).toEqual([])
    page.off('pageerror', onError)
  }
  writeFileSync('.test-artifacts/axe-after.json', JSON.stringify(reports, null, 2))
})

test('delivery: SEO headers, malformed path and sitemap notice inclusion', async ({ page, request }) => {
  for (const path of ['/auth/login', '/auth/register', '/not-a-real-page', '/encyclopedia/%E0%A4%A']) {
    const response = await page.goto(base + path)
    expect(response!.status()).toBe(path.startsWith('/auth/') ? 200 : 404)
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/)
    expect(response!.headers()['cache-control']).toBe('no-store')
    expect(response!.headers()['x-robots-tag']).toContain('noindex')
  }
  const home = await request.get(base)
  expect(home.headers()['content-security-policy']).toContain("object-src 'none'")
  const xml = await (await request.get(base + '/sitemap.xml')).text()
  await page.goto(base + '/notice')
  const noticeLinks = await page.locator('.notice-row').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))
  for (const link of noticeLinks) expect(xml).toContain('https://gosudental.pages.dev' + link)
  const root = xml.match(/<url><loc>https:\/\/gosudental.pages.dev\/<\/loc>(.*?)<\/url>/s)?.[1]
  expect(root).toBeDefined()
  expect(root).not.toContain('lastmod')
  const robots = await (await request.get(base + '/robots.txt')).text()
  expect(robots).toContain('Disallow: /auth/')
  expect(robots).toContain('Disallow: /api/')
})

test('delivery: mobile menu keyboard and inline submission recovery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(base + '/reservation')
  const toggle = page.locator('.mobile-toggle')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(await page.locator('main').evaluate(el => (el as any).inert)).toBeTruthy()
  await page.keyboard.press('Tab')
  await expect(page.locator('#mobile-menu > a').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(await page.locator('main').evaluate(el => (el as any).inert)).toBeFalsy()
  await page.route('**/api/reservation', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: '일시적인 접수 오류입니다.' }) }))
  await page.getByRole('textbox', { name: '성함 *', exact: true }).fill('오류복구테스트')
  await page.getByRole('textbox', { name: '연락처 *', exact: true }).fill('010-1234-5678')
  await page.locator('[name=privacy_consent]').check()
  await page.getByRole('button', { name: '예약 신청하기' }).click()
  await expect(page.getByRole('status')).toHaveText('일시적인 접수 오류입니다.')
  await expect(page.getByRole('textbox', { name: '성함 *', exact: true })).toHaveValue('오류복구테스트')
  await expect(page.getByRole('button', { name: '예약 신청하기' })).toBeEnabled()
  await page.goto(base + '/cases')
  await page.getByRole('button', { name: '임플란트', exact: true }).click()
  await expect(page.getByRole('button', { name: '임플란트', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: '전체', exact: true })).toHaveAttribute('aria-pressed', 'false')
})

test('delivery: no-JavaScript content stays visible with truthful statistics', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto(base)
  await expect(page.locator('#stats-section')).toContainText('26')
  await expect(page.locator('#stats-section')).toContainText('7')
  await expect(page.locator('.reveal').first()).toHaveCSS('opacity', '1')
  await expect(page.locator('#mobile-menu')).toBeVisible()
  await context.close()
})

test('delivery: comparison slider has keyboard controls', async ({ page }) => {
  await page.setContent('<div class="ba-slider" style="width:300px"><div class="ba-after"></div><div class="ba-handle" role="slider" tabindex="0" aria-label="전후 비교" aria-valuemin="2" aria-valuemax="98" aria-valuenow="50"></div></div>')
  await page.addScriptTag({ content: readFileSync('public/static/app.js', 'utf8') })
  const slider = page.getByRole('slider')
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveAttribute('aria-valuenow', '55')
  await page.keyboard.press('Home')
  await expect(slider).toHaveAttribute('aria-valuenow', '2')
  await page.keyboard.press('End')
  await expect(slider).toHaveAttribute('aria-valuenow', '98')
})

test('delivery: authenticated admin screens meet automated accessibility checks', async ({ page }) => {
  const password = readFileSync('.dev.vars', 'utf8').split('\n').find(s => s.startsWith('ADMIN_PASSWORD='))!.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')
  await page.goto(base + '/admin/login')
  await page.locator('[name=password]').fill(password)
  await page.getByRole('button', { name: '로그인', exact: true }).click()
  await expect(page).toHaveURL(base + '/admin')
  const reports: object[] = []
  for (const path of ['/admin', '/admin/cases', '/admin/posts', '/admin/notices', '/admin/users', '/admin/reservations']) {
    await page.goto(base + path)
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      reports.push({ path, width, violations: result.violations })
      expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), path + ' ' + width).toEqual([])
      expect(await page.evaluate(() => (globalThis as any).document.documentElement.scrollWidth <= (globalThis as any).innerWidth), path + ' ' + width).toBeTruthy()
    }
  }
  writeFileSync('.test-artifacts/axe-admin-after.json', JSON.stringify(reports, null, 2))
})
