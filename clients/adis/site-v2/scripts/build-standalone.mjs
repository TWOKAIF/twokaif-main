import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(scriptDir, '..')
const distDir = path.join(projectDir, 'dist')
const publicDir = path.join(projectDir, 'public')
const outputDir = path.join(projectDir, 'artifacts')
const outputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(outputDir, 'Сайт Адиса.html')

const mimeByExtension = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const [indexHtml, contentFile] = await Promise.all([
  readFile(path.join(distDir, 'index.html'), 'utf8'),
  readFile(path.join(projectDir, 'data', 'content.json'), 'utf8'),
])

const cssAsset = indexHtml.match(/href="(\/assets\/[^\"]+\.css)"/)?.[1]
const jsAsset = indexHtml.match(/src="(\/assets\/[^\"]+\.js)"/)?.[1]

if (!cssAsset || !jsAsset) {
  throw new Error('Не нашёл собранные CSS/JS. Сначала выполни npm run build.')
}

let css = await readFile(path.join(distDir, cssAsset), 'utf8')
let js = await readFile(path.join(distDir, jsAsset), 'utf8')
const content = JSON.parse(contentFile).published || {}
let staticContent = JSON.stringify(content)

const localAssetPattern = /\/(?:fonts|images|logos)\/[A-Za-z0-9А-Яа-яЁё._%+\/-]+\.(?:avif|gif|jpe?g|otf|png|svg|ttf|webp|woff2?)/gi
const localAssets = new Set([
  ...(css.match(localAssetPattern) || []),
  ...(js.match(localAssetPattern) || []),
  ...(staticContent.match(localAssetPattern) || []),
])

for (const assetUrl of localAssets) {
  const assetPath = path.join(publicDir, decodeURIComponent(assetUrl.slice(1)))
  const extension = path.extname(assetPath).toLowerCase()
  const mime = mimeByExtension[extension]
  if (!mime) throw new Error(`Неизвестный тип файла: ${assetUrl}`)
  const encoded = (await readFile(assetPath)).toString('base64')
  const dataUrl = `data:${mime};base64,${encoded}`
  css = css.split(assetUrl).join(dataUrl)
  js = js.split(assetUrl).join(dataUrl)
  staticContent = staticContent.split(assetUrl).join(dataUrl)
}

const title = 'Адис Маммо — ведущий и комик'
const safeStaticContent = staticContent
  .replaceAll('<', '\\u003c')
  .replaceAll('\u2028', '\\u2028')
  .replaceAll('\u2029', '\\u2029')
const safeJs = js.replaceAll('</script', '<\\/script')

const standaloneHtml = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex,nofollow" />
    <meta name="color-scheme" content="light" />
    <title>${title}</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.__ADIS_STANDALONE_CONTENT__ = ${safeStaticContent};
      const nativeFetch = window.fetch.bind(window);
      window.fetch = (input, options) => {
        const url = typeof input === 'string' ? input : input?.url;
        if (url === '/api/content') {
          return Promise.resolve(new Response(JSON.stringify(window.__ADIS_STANDALONE_CONTENT__), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }));
        }
        return nativeFetch(input, options);
      };
    </script>
    <script type="module">${safeJs}</script>
  </body>
</html>
`

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, standaloneHtml)
console.log(outputPath)
console.log(`${(Buffer.byteLength(standaloneHtml) / 1024 / 1024).toFixed(1)} MB`)
