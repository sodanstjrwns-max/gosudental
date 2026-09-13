import type { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { Bindings } from './auth'
import { DOCTORS, TREATMENTS } from './data/site'
import { CASE_CATEGORIES } from './pages/cases'
import { bad, text, positiveId, jsonObject, consent, sanitizeContent, validateImage } from './security'

type App = Hono<{ Bindings: Bindings }>
const fields = ['pano_before', 'pano_after', 'photo_before', 'photo_after'] as const
const ok = (extra = {}) => ({ ok: true, ...extra })
const missing = () => new HTTPException(404, { message: '항목을 찾을 수 없습니다.' })
function doctor(value: unknown, required = false) {
  const s = text(value, '의료진', 60, required)
  if (s && !DOCTORS.some(d => d.slug === s)) bad('등록된 의료진을 선택해주세요.')
  return s
}
async function deleteImages(env: Bindings, keys: (string | null)[]) {
  // Deletes are best effort AFTER the database commit; never break existing references on failure.
  for (const key of keys.filter(Boolean) as string[]) {
    try { await env.R2.delete(key) } catch { console.error('R2 image cleanup failed') }
  }
}
async function upload(env: Bindings, file: string | File | null, prefix: 'cases' | 'uploads', created: string[]) {
  if (file === null || file === '' || (file instanceof File && !file.size)) return null
  if (!(file instanceof File)) bad('이미지 파일 형식이 아닙니다.')
  const { bytes, ext, mime } = await validateImage(file)
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`
  await env.R2.put(key, bytes, { httpMetadata: { contentType: mime } })
  created.push(key)
  return key
}
function published(fd: FormData) { return fd.has('published') ? (consent(fd.get('published')) || fd.get('published') === '1' ? 1 : 0) : 1 }

export function registerAdminAPI(app: App) {
  // These routes are registered AFTER the existing admin authentication middleware.
  for (const table of ['cases', 'posts', 'notices'] as const) {
    app.get(`/api/admin/${table}/:id`, async c => {
      const id = positiveId(c.req.param('id'))
      const item: any = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first()
      if (!item) throw missing()
      if (table === 'posts') item.content = sanitizeContent(item.content)
      return c.json(ok({ item }))
    })
  }

  for (const method of ['post', 'put'] as const) {
    app[method](method === 'post' ? '/api/admin/cases' : '/api/admin/cases/:id', async c => {
      const id = method === 'put' ? positiveId(c.req.param('id')) : null
      const existing: any = id ? await c.env.DB.prepare('SELECT * FROM cases WHERE id = ?').bind(id).first() : null
      if (id && !existing) throw missing()
      const fd = await c.req.formData()
      const title = text(fd.get('title'), '제목', 200, true)
      const category = text(fd.get('category'), '카테고리', 50, true)
      if (!CASE_CATEGORIES.includes(category)) bad('올바른 카테고리를 선택해주세요.')
      const age = text(fd.get('age_group'), '나이대', 20)
      if (age && !['10대', '20대', '30대', '40대', '50대', '60대', '70대 이상'].includes(age)) bad('올바른 나이대를 선택해주세요.')
      const gender = text(fd.get('gender'), '성별', 10)
      if (gender && !['여성', '남성'].includes(gender)) bad('올바른 성별을 선택해주세요.')
      const values = [title, text(fd.get('description'), '설명', 10000), age, gender, category, text(fd.get('region'), '지역', 120), doctor(fd.get('doctor_slug')), text(fd.get('duration'), '치료 기간', 100)]
      const created: string[] = [], removed: string[] = []
      try {
        const images: (string | null)[] = []
        for (const field of fields) {
          const key = await upload(c.env, fd.get(field), 'cases', created)
          const remove = consent(fd.get('remove_' + field))
          images.push(key || (remove ? null : existing?.[field] || null))
          if ((key || remove) && existing?.[field]) removed.push(existing[field])
        }
        let savedId = id
        if (id) {
          await c.env.DB.prepare(`UPDATE cases SET title=?, description=?, age_group=?, gender=?, category=?, region=?, doctor_slug=?, duration=?, pano_before=?, pano_after=?, photo_before=?, photo_after=?, published=? WHERE id=?`)
            .bind(...values, ...images, published(fd), id).run()
        } else {
          const result = await c.env.DB.prepare(`INSERT INTO cases (title, description, age_group, gender, category, region, doctor_slug, duration, pano_before, pano_after, photo_before, photo_after, published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
            .bind(...values, ...images, published(fd)).run()
          savedId = Number(result.meta.last_row_id)
        }
        await deleteImages(c.env, removed)
        return c.json(ok({ id: savedId }))
      } catch (e) {
        await deleteImages(c.env, created)
        throw e
      }
    })
  }

  app.delete('/api/admin/cases/:id', async c => {
    const id = positiveId(c.req.param('id'))
    const item: any = await c.env.DB.prepare('SELECT * FROM cases WHERE id=?').bind(id).first()
    if (!item) throw missing()
    await c.env.DB.prepare('DELETE FROM cases WHERE id=?').bind(id).run()
    await deleteImages(c.env, fields.map(f => item[f]))
    return c.json(ok())
  })
  app.post('/api/admin/upload', async c => {
    const fd = await c.req.formData()
    const key = await upload(c.env, fd.get('image'), 'uploads', [])
    if (!key) bad('이미지 파일이 필요합니다.')
    return c.json(ok({ url: `/api/${key}` }))
  })

  for (const method of ['post', 'put'] as const) {
    app[method](method === 'post' ? '/api/admin/posts' : '/api/admin/posts/:id', async c => {
      const id = method === 'put' ? positiveId(c.req.param('id')) : null
      if (id && !(await c.env.DB.prepare('SELECT id FROM posts WHERE id=?').bind(id).first())) throw missing()
      const body = await jsonObject(c)
      const title = text(body.title, '제목', 200, true)
      const slug = text(body.slug, '슬러그', 150, true)
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) bad('슬러그는 영문 소문자·숫자·하이픈으로 입력해주세요.')
      if (await c.env.DB.prepare('SELECT id FROM posts WHERE slug=? AND id != ?').bind(slug, id || 0).first())
        throw new HTTPException(409, { message: '이미 사용 중인 슬러그입니다.' })
      const content = sanitizeContent(text(body.content, '본문', 200000, true))
      if (!content.replace(/<[^>]*>/g, '').trim() && !content.includes('<img ')) bad('유효한 본문을 입력해주세요.')
      const category = text(body.category, '카테고리', 60)
      if (category && !TREATMENTS.some(t => t.name === category)) bad('올바른 진료 카테고리를 선택해주세요.')
      const thumbnail = content.match(/<img[^>]+src="([^"]+)"/)?.[1] || null
      const values = [slug, title, content, thumbnail, doctor(body.author_slug, true), text(body.meta_description, '메타 설명', 170), category, body.published === false || body.published === 0 ? 0 : 1]
      let savedId = id
      if (id) {
        await c.env.DB.prepare('UPDATE posts SET slug=?, title=?, content=?, thumbnail=?, author_slug=?, meta_description=?, category=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(...values, id).run()
      } else {
        const result = await c.env.DB.prepare('INSERT INTO posts (slug,title,content,thumbnail,author_slug,meta_description,category,published) VALUES (?,?,?,?,?,?,?,?)').bind(...values).run()
        savedId = Number(result.meta.last_row_id)
      }
      return c.json(ok({ id: savedId }))
    })
  }
  app.delete('/api/admin/posts/:id', async c => {
    const id = positiveId(c.req.param('id'))
    const r = await c.env.DB.prepare('DELETE FROM posts WHERE id=?').bind(id).run()
    if (!r.meta.changes) throw missing()
    // Uploaded column images may be shared across articles. Do not delete shared keys here.
    return c.json(ok())
  })

  for (const method of ['post', 'put'] as const) {
    app[method](method === 'post' ? '/api/admin/notices' : '/api/admin/notices/:id', async c => {
      const id = method === 'put' ? positiveId(c.req.param('id')) : null
      const existing: any = id ? await c.env.DB.prepare('SELECT * FROM notices WHERE id=?').bind(id).first() : null
      if (id && !existing) throw missing()
      if (method === 'put' && c.req.header('content-type')?.includes('application/json')) {
        const body = await jsonObject(c)
        if (![0, 1, false, true].includes(body.pinned as any)) bad('고정 여부를 올바르게 입력해주세요.')
        const pin = body.pinned ? 1 : 0
        const statements = pin ? [c.env.DB.prepare('UPDATE notices SET pinned=0 WHERE pinned=1')] : []
        statements.push(c.env.DB.prepare('UPDATE notices SET pinned=? WHERE id=?').bind(pin, id))
        await c.env.DB.batch(statements)
        return c.json(ok())
      }
      const fd = await c.req.formData()
      const title = text(fd.get('title'), '제목', 200, true)
      const content = text(fd.get('content'), '내용', 20000, true)
      const pin = consent(fd.get('pinned')) ? 1 : 0
      const created: string[] = []
      try {
        const key = await upload(c.env, fd.get('image'), 'uploads', created)
        const image = key ? `/api/${key}` : consent(fd.get('remove_image')) ? null : existing?.image || null
        const statements = pin ? [c.env.DB.prepare('UPDATE notices SET pinned=0 WHERE pinned=1')] : []
        statements.push(id
          ? c.env.DB.prepare('UPDATE notices SET title=?,content=?,image=?,pinned=? WHERE id=?').bind(title, content, image, pin, id)
          : c.env.DB.prepare('INSERT INTO notices (title,content,image,pinned) VALUES (?,?,?,?)').bind(title, content, image, pin))
        const results = await c.env.DB.batch(statements)
        return c.json(ok({ id: id || Number(results.at(-1)!.meta.last_row_id) }))
      } catch (e) { await deleteImages(c.env, created); throw e }
    })
  }
  app.delete('/api/admin/notices/:id', async c => {
    const id = positiveId(c.req.param('id'))
    const r = await c.env.DB.prepare('DELETE FROM notices WHERE id=?').bind(id).run()
    if (!r.meta.changes) throw missing()
    return c.json(ok())
  })
  app.delete('/api/admin/users/:id', async c => {
    const id = positiveId(c.req.param('id'))
    const r = await c.env.DB.prepare('DELETE FROM users WHERE id=?').bind(id).run()
    if (!r.meta.changes) throw missing()
    return c.json(ok())
  })
  app.put('/api/admin/reservations/:id', async c => {
    const id = positiveId(c.req.param('id'))
    const body = await jsonObject(c)
    const status = text(body.status, '예약 상태', 20, true)
    if (!['pending', 'confirmed', 'done', 'canceled'].includes(status)) bad('예약 상태를 올바르게 선택해주세요.')
    const r = await c.env.DB.prepare('UPDATE reservations SET status=? WHERE id=?').bind(status, id).run()
    if (!r.meta.changes) throw missing()
    return c.json(ok())
  })
}
