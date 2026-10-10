import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const temporaryDir = await mkdtemp(path.join(os.tmpdir(), 'adis-ssr-check-'))
const children = []
let checks = 0

function launch(cwd, dataDir, preview = true) {
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd,
    env: { ...process.env, NODE_ENV: 'production', SITE_PREVIEW: preview ? '1' : '0', PORT: '0', DATA_DIR: dataDir },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.output = ''
  child.stdout.on('data', (chunk) => { child.output += chunk })
  child.stderr.on('data', (chunk) => { child.output += chunk })
  children.push(child)
  return child
}

async function ready(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server readiness timeout: ${child.output}`)), 10000)
    const onData = () => {
      const port = child.output.match(/Adis site server: http:\/\/localhost:(\d+)/)?.[1]
      if (!port) return
      clearTimeout(timer)
      child.stdout.off('data', onData)
      resolve(`http://127.0.0.1:${port}`)
    }
    child.stdout.on('data', onData)
    child.once('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`Server exited with ${code}: ${child.output}`))
    })
    onData()
  })
}

function check(description, callback) {
  callback()
  checks += 1
  console.log(`PASS ${description}`)
}

function decodeAttribute(value) {
  return value.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')
}

function bootstrap(html) {
  const value = html.match(/<div id="site-content" hidden data-json="([^"]*)"><\/div>/)?.[1]
  assert.ok(value, 'SSR response includes bootstrap payload')
  return JSON.parse(decodeAttribute(value))
}

try {
  const original = JSON.parse(await readFile(path.join(projectDir, 'data/content.json'), 'utf8'))
  const dataDir = path.join(temporaryDir, 'data')
  await mkdir(dataDir)
  const contentPath = path.join(dataDir, 'content.json')
  await writeFile(contentPath, JSON.stringify(original))
  const server = launch(projectDir, dataDir)
  const base = await ready(server)
  const response = await fetch(base)
  const html = await response.text()

  check('raw HTML contains actual React page and contact links', () => {
    assert.equal(response.status, 200)
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    assert.match(html, /class="site-shell"/)
    assert.match(html, /id="contacts"/)
    assert.match(html, /id="about"/)
    assert.ok(html.includes(`href="${original.header.contactHref}"`))
    assert.doesNotMatch(html, /<!--__APP_HTML__-->|<!--__SITE_CONTENT__-->|content-loading-shell/)
    assert.deepEqual(bootstrap(html), original)
  })

  check('CSP stays strict for scripts and the preview prevents indexing', () => {
    assert.match(response.headers.get('content-security-policy'), /script-src 'self'(?:;|$)/)
    assert.match(response.headers.get('content-security-policy'), /script-src-attr 'none'/)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.match(html, /name="robots" content="noindex,\s*nofollow,\s*noarchive"/)
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/)
  })

  const changed = structuredClone(original)
  changed.hero.nameTop = `SSR " & < > </script><script id="injected">alert(1)</script> $& $' $\``
  changed.about.kicker = 'DYNAMIC_DATA_DIR'
  changed.visibility.about = true
  await writeFile(contentPath, JSON.stringify(changed))
  const nextHtml = await (await fetch(base)).text()
  check('next request uses current DATA_DIR without rebuild/restart', () => {
    assert.ok(nextHtml.includes(changed.about.kicker))
    assert.deepEqual(bootstrap(nextHtml), changed)
    assert.notEqual(nextHtml, html)
  })
  check('HTML and bootstrap escape markup and replacement metacharacters', () => {
    assert.doesNotMatch(nextHtml, /<script id="injected">/)
    assert.ok(nextHtml.includes('&lt;script'))
    assert.ok(nextHtml.includes('$&'))
    assert.ok(nextHtml.includes('$`'))
    assert.equal(bootstrap(nextHtml).hero.nameTop, changed.hero.nameTop)
  })

  const api = await fetch(`${base}/api/content`)
  check('API and page use the same content source', () => assert.equal(api.status, 200))
  assert.deepEqual(await api.json(), changed)

  const hiddenSection = structuredClone(original)
  hiddenSection.visibility.about = false
  await writeFile(contentPath, JSON.stringify(hiddenSection))
  const hiddenHtml = await (await fetch(base)).text()
  check('visibility flags affect server-rendered sections', () => assert.doesNotMatch(hiddenHtml, /<section[^>]+id="about"/))

  const statuses = await Promise.all(['/missing-page', '/admin', '/api/admin', '/dist-server/entry-server.js', '/server/index.js'].map(async (url) => [url, (await fetch(`${base}${url}`)).status]))
  check('unknown, admin and server-source URLs remain 404', () => statuses.forEach(([url, status]) => assert.equal(status, 404, url)))
  const indexResponse = await fetch(`${base}/index.html`, { redirect: 'manual' })
  check('raw index template cannot bypass SSR', () => {
    assert.equal(indexResponse.status, 301)
    assert.equal(indexResponse.headers.get('location'), '/')
  })
  const privacy = await fetch(`${base}/privacy`)
  const robots = await fetch(`${base}/robots.txt`)
  check('privacy and robots stay available', () => {
    assert.equal(privacy.status, 200)
    assert.equal(robots.status, 200)
  })
  const robotsText = await robots.text()
  assert.match(robotsText, /^Disallow: \/\s*$/m)
  assert.doesNotMatch(robotsText, /Sitemap:/)
  assert.match(await privacy.text(), /name="robots" content="noindex,nofollow"/)

  const publicBase = await ready(launch(projectDir, dataDir, false))
  const publicResponse = await fetch(publicBase)
  const publicHtml = await publicResponse.text()
  const publicRobots = await (await fetch(`${publicBase}/robots.txt`)).text()
  check('public release is indexable with HTTPS CSP and private stamp blocked', () => {
    assert.equal(publicResponse.status, 200)
    assert.equal(publicResponse.headers.get('x-robots-tag'), null)
    assert.doesNotMatch(publicHtml, /noindex/)
    assert.match(publicResponse.headers.get('content-security-policy'), /upgrade-insecure-requests/)
    assert.match(publicRobots, /Allow: \/\s*$/m)
    assert.match(publicRobots, /Sitemap: https:\/\/adismammo.ru\/sitemap.xml/)
  })
  assert.equal((await fetch(`${publicBase}/twokaif-source.json`)).status, 404)
  await writeFile(contentPath, '{invalid json')
  const broken = await fetch(base)
  check('invalid content returns 500 instead of an empty successful page', () => assert.equal(broken.status, 500))

  const incompleteRelease = path.join(temporaryDir, 'incomplete-release')
  await mkdir(incompleteRelease)
  await cp(path.join(projectDir, 'server'), path.join(incompleteRelease, 'server'), { recursive: true })
  await writeFile(path.join(incompleteRelease, 'package.json'), '{"type":"module"}')
  await symlink(path.join(projectDir, 'node_modules'), path.join(incompleteRelease, 'node_modules'), 'dir')
  const missingRenderer = launch(incompleteRelease, dataDir)
  const [exitCode] = await once(missingRenderer, 'exit')
  check('a release missing its renderer fails before listening', () => {
    assert.notEqual(exitCode, 0)
    assert.match(missingRenderer.output, /ERR_MODULE_NOT_FOUND/)
    assert.doesNotMatch(missingRenderer.output, /Adis site server:/)
  })
  console.log(`SSR integration: ${checks}/${checks} passed`)
} finally {
  await Promise.all(children.map(async (child) => {
    if (child.exitCode !== null || child.signalCode !== null) return
    const exited = once(child, 'exit')
    child.kill('SIGTERM')
    await exited
  }))
  await rm(temporaryDir, { recursive: true, force: true })
}
