import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieSession from 'cookie-session'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const contentPath = path.join(rootDir, 'data', 'content.json')
const distDir = path.join(rootDir, 'dist')
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 8787)
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'adis-local')
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? '' : 'local-only-session-secret')

if (!adminPassword || !sessionSecret) {
  throw new Error('ADMIN_PASSWORD and SESSION_SECRET are required in production')
}

const app = express()
app.disable('x-powered-by')
app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }))
app.use(express.json({ limit: '128kb' }))
app.use(
  cookieSession({
    name: 'adis_admin',
    keys: [sessionSecret],
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 12,
  }),
)

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false })

async function readContent() {
  return JSON.parse(await fs.readFile(contentPath, 'utf8'))
}

async function writeContent(content) {
  const temporaryPath = `${contentPath}.${crypto.randomUUID()}.tmp`
  await fs.writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
  await fs.rename(temporaryPath, contentPath)
}

function requireAdmin(request, response, next) {
  if (request.session?.authenticated === true) return next()
  return response.status(401).json({ error: 'Нужно войти в админку' })
}

function cleanHeader(input) {
  const fallback = {
    brand: 'АДИС МАММО',
    formats: [],
    contactLabel: 'СВЯЗАТЬСЯ',
    contactHref: '#contacts',
    menu: [],
  }
  const source = input && typeof input === 'object' ? input : fallback
  return {
    brand: String(source.brand || fallback.brand).slice(0, 40),
    formats: Array.isArray(source.formats) ? source.formats.slice(0, 5).map((item) => String(item).slice(0, 80)) : [],
    contactLabel: String(source.contactLabel || fallback.contactLabel).slice(0, 40),
    contactHref: String(source.contactHref || fallback.contactHref).slice(0, 300),
    menu: Array.isArray(source.menu)
      ? source.menu.slice(0, 8).map((item) => ({
          label: String(item?.label || '').slice(0, 50),
          href: String(item?.href || '#').slice(0, 300),
        }))
      : [],
  }
}

app.get('/api/content', async (_request, response, next) => {
  try {
    const content = await readContent()
    response.json(content.published)
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/login', loginLimiter, (request, response) => {
  const supplied = String(request.body?.password || '')
  const expected = Buffer.from(adminPassword)
  const actual = Buffer.from(supplied)
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  if (!matches) return response.status(401).json({ error: 'Неверный пароль' })
  request.session.authenticated = true
  return response.json({ ok: true })
})

app.post('/api/admin/logout', (request, response) => {
  request.session = null
  response.json({ ok: true })
})

app.get('/api/admin/content', requireAdmin, async (_request, response, next) => {
  try {
    response.json(await readContent())
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/draft/header', requireAdmin, async (request, response, next) => {
  try {
    const content = await readContent()
    content.draft.header = cleanHeader(request.body)
    await writeContent(content)
    response.json({ ok: true, draft: content.draft })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/publish', requireAdmin, async (_request, response, next) => {
  try {
    const content = await readContent()
    content.published = structuredClone(content.draft)
    await writeContent(content)
    response.json({ ok: true, published: content.published })
  } catch (error) {
    next(error)
  }
})

if (isProduction) {
  app.use(express.static(distDir, { index: false, maxAge: '1h' }))
  app.get('*', (_request, response) => response.sendFile(path.join(distDir, 'index.html')))
}

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Не удалось выполнить действие' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Adis admin server: http://localhost:${port}`)
})
