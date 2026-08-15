import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const dataDir = process.env.DATA_DIR || path.join(rootDir, 'data')
const contentPath = path.join(dataDir, 'content.json')
const distDir = path.join(rootDir, 'dist')
const indexPath = path.join(distDir, 'index.html')
const contentMarker = '<!--__SITE_CONTENT__-->'
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 8787)

const app = express()
app.disable('x-powered-by')
if (isProduction) app.set('trust proxy', 1)
app.use(
  helmet({
    xFrameOptions: false,
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            frameAncestors: ["'self'", 'https://check.twokaif.ru'],
            imgSrc: ["'self'", 'data:', 'https://kinescope.io', 'https://*.kinescopecdn.net'],
            frameSrc: ["'self'", 'https://kinescope.io'],
          },
        }
      : false,
  }),
)
app.use((_request, response, next) => {
  response.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=(), payment=(), usb=()')
  next()
})

function readContent() {
  return fs.readFile(contentPath, 'utf8').then((source) => JSON.parse(source))
}

let indexTemplatePromise
function readIndexTemplate() {
  if (!indexTemplatePromise) {
    indexTemplatePromise = fs.readFile(indexPath, 'utf8').catch((error) => {
      indexTemplatePromise = undefined
      throw error
    })
  }
  return indexTemplatePromise
}

function escapeHtmlAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

async function renderIndex() {
  const [template, content] = await Promise.all([readIndexTemplate(), readContent()])
  const payload = escapeHtmlAttribute(JSON.stringify(content))
  return template.replace(contentMarker, `<div id="site-content" hidden data-json="${payload}"></div>`)
}

app.get('/api/content', async (_request, response, next) => {
  try {
    response.set('Cache-Control', 'no-store')
    response.json(await readContent())
  } catch (error) {
    next(error)
  }
})

app.use(['/admin', '/api/admin'], (_request, response) => response.sendStatus(404))
app.get('/favicon.ico', (_request, response) => response.sendStatus(204))

if (isProduction) {
  app.use('/fonts', express.static(path.join(distDir, 'fonts'), { index: false, immutable: true, maxAge: '1y' }))
  app.use(express.static(distDir, { index: false, maxAge: '1h' }))
  app.get(['/privacy', '/privacy/'], (_request, response) => {
    response.set('Cache-Control', 'no-store')
    response.sendFile(path.join(distDir, 'privacy.html'))
  })
  app.get('/', async (_request, response, next) => {
    try {
      response.set('Cache-Control', 'no-store')
      response.type('html').send(await renderIndex())
    } catch (error) {
      next(error)
    }
  })
}

app.use((_request, response) => response.sendStatus(404))

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Не удалось загрузить сайт' })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`Adis site server: http://localhost:${port}`)
})
