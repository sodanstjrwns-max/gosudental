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
