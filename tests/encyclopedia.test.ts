import { test } from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/index'
import { TERMS, SITE } from '../src/data/site'
import { TERM_ARTICLES, TERM_REFERENCES } from '../src/data/encyclopedia-content'

function articleLength(a: (typeof TERM_ARTICLES)[string]) {
  return a.summary.length + a.sections.reduce((n, s) => n + s.paragraphs.join('').length, 0) + a.faqs.reduce((n, f) => n + f.q.length + f.a.length, 0) + a.checklist.join('').length
}

test('all 103 terms have substantive unique guides and valid source/related links', () => {
  assert.equal(TERMS.length, 103)
  assert.deepEqual(Object.keys(TERM_ARTICLES).sort(), TERMS.map(t => t.name).sort())
  const summaries = new Set<string>()
  const paragraphs = new Map<string, string>()
  for (const term of TERMS) {
    const a = TERM_ARTICLES[term.name]
    assert.equal(a.name, term.name)
    assert.equal(a.sections.length, 5, term.name)
    assert.equal(a.faqs.length, 4, term.name)
    assert.equal(a.checklist.length, 4, term.name)
    assert.ok(articleLength(a) >= 1500, term.name + ' has too little text')
    assert.ok(!summaries.has(a.summary), term.name + ' duplicate summary')
    summaries.add(a.summary)
    for (const s of a.sections) {
      assert.ok(s.heading.length >= 3)
      assert.equal(s.paragraphs.length, 2)
      for (const p of s.paragraphs) {
        assert.ok(p.length >= 60, term.name)
        assert.ok(!paragraphs.has(p), `${term.name}: paragraph reused from ${paragraphs.get(p)}`)
        paragraphs.set(p, term.name)
      }
    }
    assert.doesNotMatch(JSON.stringify(a), /<[^>]+>|\ufffd|```|Lorem|TODO/)
    for (const name of a.relatedNames) assert.ok(TERMS.some(t => t.name === name && name !== term.name), name)
    for (const id of a.referenceIds) {
      const source = TERM_REFERENCES[id]
      assert.ok(source, id)
      assert.ok(/^https:\/\/(www\.)?(fda\.gov|nhs\.uk|nidcr\.nih\.gov|pmc\.ncbi\.nlm\.nih\.gov)\//.test(source.url), source.url)
    }
  }
})

test('every glossary page renders full content server-side and matching FAQ schema', async () => {
  for (const term of TERMS) {
    const response = await app.request(SITE.domain + '/encyclopedia/' + term.slug, {}, {} as any)
    assert.equal(response.status, 200, term.name)
    const html = await response.text()
    assert.equal((html.match(/<h1\b/g) || []).length, 1, term.name)
    assert.equal((html.match(/class="term-chapter prose"/g) || []).length, 5, term.name)
    assert.equal((html.match(/id="term-question-\d+"/g) || []).length, 4, term.name)
    assert.ok(html.includes('href="' + SITE.domain + '/encyclopedia/' + term.slug + '"'))
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]))
    const faq = schemas.find(s => [s['@type']].flat().includes('FAQPage'))
    assert.equal(faq.mainEntity.length, 4)
    assert.deepEqual(faq.mainEntity.map((q: any) => q.name), TERM_ARTICLES[term.name].faqs.map(f => f.q))
    const definition = schemas.find(s => s['@type'] === 'DefinedTerm')
    assert.equal(definition.description, TERM_ARTICLES[term.name].summary)
    assert.doesNotMatch(JSON.stringify(schemas), /reviewedBy|lastReviewed/)
    assert.ok(html.includes('진료실에서 확인하면 좋은 질문'))
    assert.ok(html.includes('함께 읽을 참고자료'))
  }
})

// 구글 전용 검색 제외(2026-11-10, src/google-hide.ts): 구글 크롤러 + 백과 구역 + 200 HTML 에만 헤더가 붙고,
// 네이버·일반 방문자 응답과 백과 밖의 페이지는 달라지지 않는다.
test('encyclopedia is hidden from Google crawlers only, by response header', async () => {
  const GOOGLE = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  const INSPECT = 'Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)'
  const YETI = 'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)'
  const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
  const OTHERS = [YETI, CHROME, 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', 'Mozilla/5.0 (compatible; GoogleOther)', 'AdsBot-Google (+http://www.google.com/adsbot.html)', 'Mediapartners-Google', 'Mozilla/5.0 (compatible; Google-Extended)', '']
  const get = (path: string, ua: string) => app.request(SITE.domain + path, { headers: ua ? { 'User-Agent': ua } : {} }, {} as any)
  const hidden = ['/encyclopedia', ...TERMS.map(t => '/encyclopedia/' + t.slug)]
  assert.equal(hidden.length, 104)
  for (const path of hidden) {
    for (const ua of [GOOGLE, INSPECT]) {
      const res = await get(path, ua)
      assert.equal(res.status, 200, path)
      assert.equal(res.headers.get('X-Robots-Tag'), 'googlebot: noindex', path)
    }
    const plain = await get(path, '')
    const plainBody = await plain.text()
    const plainHeaders = JSON.stringify([...plain.headers].sort())
    assert.equal(plain.headers.get('X-Robots-Tag'), null, path)
    for (const ua of OTHERS) {
      const res = await get(path, ua)
      assert.equal(res.headers.get('X-Robots-Tag'), null, path + ' ' + ua)
      assert.equal(JSON.stringify([...res.headers].sort()), plainHeaders, path + ' ' + ua)
      assert.equal(await res.text(), plainBody, path + ' ' + ua)
    }
    // 본문은 구글에게도 같다(메타 태그를 넣지 않는다).
    assert.equal(await (await get(path, GOOGLE)).text(), plainBody, path)
  }
  // 백과 밖(DB 없이 그려지는 핵심 페이지)은 구글에게도 헤더가 없다.
  for (const path of ['/', '/mission', '/doctors', '/doctors/cho-wonik', '/treatments', '/treatments/implant', '/faq', '/directions', '/tour', '/reservation', '/area/naepo', '/area/naepo-implant']) {
    const res = await get(path, GOOGLE)
    assert.equal(res.status, 200, path)
    assert.equal(res.headers.get('X-Robots-Tag'), null, path)
  }
  // 301·404 와 이미 noindex 인 검색 결과 화면에는 붙이지 않는다.
  assert.equal((await get('/encyclopedia/', GOOGLE)).headers.get('X-Robots-Tag'), null)
  const missing = await get('/encyclopedia/' + encodeURIComponent('없는용어'), GOOGLE)
  assert.equal(missing.status, 404)
  assert.equal(missing.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive')
  assert.equal((await get('/encyclopedia?q=' + encodeURIComponent('임플란트'), GOOGLE)).headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive')
})
