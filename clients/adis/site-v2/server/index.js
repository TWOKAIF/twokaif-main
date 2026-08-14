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
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 8787)

const app = express()
app.disable('x-powered-by')
if (isProduction) app.set('trust proxy', 1)
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            imgSrc: ["'self'", 'data:', 'https://kinescope.io', 'https://*.kinescopecdn.net'],
            frameSrc: ["'self'", 'https://kinescope.io'],
          },
        }
      : false,
  }),
)

async function readContent() {
  return JSON.parse(await fs.readFile(contentPath, 'utf8'))
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

if (isProduction) {
  app.use(express.static(distDir, { index: false, maxAge: '1h' }))
  app.get('/{*path}', (_request, response) => response.sendFile(path.join(distDir, 'index.html')))
}

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Не удалось загрузить сайт' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Adis site server: http://localhost:${port}`)
})
