import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieSession from 'cookie-session'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const dataDir = process.env.DATA_DIR || path.join(rootDir, 'data')
const contentPath = path.join(dataDir, 'content.json')
const heroUploadsDir = path.join(dataDir, 'uploads', 'hero')
const selectedUploadsDir = path.join(dataDir, 'uploads', 'selected')
const galleryUploadsDir = path.join(dataDir, 'uploads', 'gallery')
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
if (isProduction) app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }))
app.use(express.json({ limit: '128kb' }))
app.use('/media/hero', express.static(heroUploadsDir, { immutable: true, maxAge: '1y', fallthrough: true }))
app.use('/media/selected', express.static(selectedUploadsDir, { immutable: true, maxAge: '1y', fallthrough: true }))
app.use('/media/gallery', express.static(galleryUploadsDir, { immutable: true, maxAge: '1y', fallthrough: true }))
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
const heroUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1 } })
const selectedUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1 } })
const galleryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1 } })

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

function cleanHref(value, fallback = '#') {
  const href = String(value || fallback).trim().slice(0, 300)
  return /^(#[a-z0-9_-]*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9() -]+)$/i.test(href) ? href : fallback
}

function cleanHeader(input) {
  const fallback = {
    brand: 'АДИС МАММО',
    formats: [],
    contactLabel: 'СВЯЗАТЬСЯ',
    contactHref: '#contacts',
    menu: [],
    socials: [],
  }
  const source = input && typeof input === 'object' ? input : fallback
  return {
    brand: String(source.brand || fallback.brand).slice(0, 40),
    formats: Array.isArray(source.formats) ? source.formats.slice(0, 5).map((item) => String(item).slice(0, 80)) : [],
    contactLabel: String(source.contactLabel || fallback.contactLabel).slice(0, 40),
    contactHref: cleanHref(source.contactHref, fallback.contactHref),
    menu: Array.isArray(source.menu)
      ? source.menu.slice(0, 8).map((item) => ({
          label: String(item?.label || '').slice(0, 50),
          href: cleanHref(item?.href),
        }))
      : [],
    socials: Array.isArray(source.socials)
      ? source.socials.slice(0, 8).map((item) => ({
          label: String(item?.label || '').slice(0, 50),
          href: cleanHref(item?.href),
        }))
      : [],
  }
}

function cleanHero(input) {
  const clamp = (value, min, max, fallbackValue) => {
    const number = Number(value)
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallbackValue
  }
  const layoutDefaults = {
    desktop: { minHeight: 1078, redHeight: 50, sideGutter: 5, copyTop: 62, titleSize: 207, titleLineHeight: 76, roleSize: 30, roleGap: 14, portraitHeight: 94, portraitMaxWidth: 82, portraitX: 0, portraitY: 0 },
    tablet: { minHeight: 1020, redHeight: 54, sideGutter: 5, copyTop: 48, titleSize: 158, titleLineHeight: 80, roleSize: 25, roleGap: 12, portraitHeight: 100, portraitMaxWidth: 110, portraitX: 0, portraitY: 0 },
    mobile: { minHeight: 810, redHeight: 55, sideGutter: 3, copyTop: 38, titleSize: 124, titleLineHeight: 82, roleSize: 22, roleGap: 10, portraitHeight: 112, portraitMaxWidth: 165, portraitX: -14, portraitY: 0 },
  }
  const fallbackPortrait = { url: '/images/adis-hero.png', alt: 'Адис Маммо', width: 2401, height: 2548 }
  const fallback = { nameTop: 'ADIS', nameBottom: 'MAMMO', role: 'ВЕДУЩИЙ / КОМИК', accent: '#9B1406', portrait: fallbackPortrait, layouts: layoutDefaults, motion: 'text' }
  const source = input && typeof input === 'object' ? input : fallback
  const legacyDesktop = {
    ...layoutDefaults.desktop,
    redHeight: clamp(source.redHeight, 35, 65, layoutDefaults.desktop.redHeight),
    portraitHeight: clamp(source.portraitHeight, 70, 150, layoutDefaults.desktop.portraitHeight),
    portraitX: clamp(source.portraitX, -220, 180, layoutDefaults.desktop.portraitX),
    portraitY: clamp(source.portraitY, -160, 180, layoutDefaults.desktop.portraitY),
  }
  const cleanLayout = (inputLayout, defaults) => {
    const layout = inputLayout && typeof inputLayout === 'object' ? inputLayout : defaults
    return {
      minHeight: clamp(layout.minHeight, 680, 1180, defaults.minHeight),
      redHeight: clamp(layout.redHeight, 35, 65, defaults.redHeight),
      sideGutter: clamp(layout.sideGutter, 2, 8, defaults.sideGutter),
      copyTop: clamp(layout.copyTop, 20, 110, defaults.copyTop),
      titleSize: clamp(layout.titleSize, 96, 240, defaults.titleSize),
      titleLineHeight: clamp(layout.titleLineHeight, 70, 96, defaults.titleLineHeight),
      roleSize: clamp(layout.roleSize, 16, 40, defaults.roleSize),
      roleGap: clamp(layout.roleGap, 0, 40, defaults.roleGap),
      portraitHeight: clamp(layout.portraitHeight, 70, 150, defaults.portraitHeight),
      portraitMaxWidth: clamp(layout.portraitMaxWidth, 60, 180, defaults.portraitMaxWidth),
      portraitX: clamp(layout.portraitX, -220, 180, defaults.portraitX),
      portraitY: clamp(layout.portraitY, -160, 180, defaults.portraitY),
    }
  }
  const portraitSource = source.portrait && typeof source.portrait === 'object'
    ? source.portrait
    : { ...fallbackPortrait, url: source.image || fallbackPortrait.url }
  const portraitUrl = String(portraitSource.url || fallbackPortrait.url)
  const safePortraitUrl = portraitUrl.startsWith('/images/') || portraitUrl.startsWith('/media/hero/') ? portraitUrl : fallbackPortrait.url
  return {
    nameTop: String(source.nameTop || fallback.nameTop).slice(0, 32),
    nameBottom: String(source.nameBottom || fallback.nameBottom).slice(0, 32),
    role: String(source.role || fallback.role).slice(0, 80),
    accent: /^#[0-9a-f]{6}$/i.test(String(source.accent || '')) ? String(source.accent).toUpperCase() : fallback.accent,
    portrait: {
      id: String(portraitSource.id || '').slice(0, 80),
      url: safePortraitUrl.slice(0, 300),
      alt: String(portraitSource.alt || fallbackPortrait.alt).slice(0, 120),
      originalName: String(portraitSource.originalName || '').slice(0, 120),
      width: clamp(portraitSource.width, 1, 6000, fallbackPortrait.width),
      height: clamp(portraitSource.height, 1, 6000, fallbackPortrait.height),
      bytes: clamp(portraitSource.bytes, 0, 15 * 1024 * 1024, 0),
    },
    layouts: {
      desktop: cleanLayout(source.layouts?.desktop || legacyDesktop, legacyDesktop),
      tablet: cleanLayout(source.layouts?.tablet, layoutDefaults.tablet),
      mobile: cleanLayout(source.layouts?.mobile, layoutDefaults.mobile),
    },
    motion: source.motion === 'none' ? 'none' : 'text',
  }
}

function cleanAbout(input) {
  const fallback = {
    kicker: '// ОБ АДИСЕ',
    mediaLabel: 'ФОТО',
    image: '/images/adis-about-02-clean.png',
    imageAlt: 'Портрет Адиса Маммо',
    lead: 'ПОБЕДИТЕЛЬ ПРЕМИИ WEDDING AWARDS\nВ НОМИНАЦИИ «ЛУЧШИЙ ВЕДУЩИЙ РОССИИ».\nУЧАСТНИК «ОТКРЫТОГО МИКРОФОНА» НА ТНТ\nИ ROAST BATTLE ОТ LABELCOM.',
    secondary: 'АВТОР YOUTUBE-КАНАЛА «САРКАЗМОШНАЯ».\nВЕДУЩИЙ ПРОЕКТОВ «ИСТОРИИ НА СПОР» И «У МЕНЯ ХУЖЕ».\nВЫПУСТИЛ СОЛЬНЫЙ СТЕНДАП-КОНЦЕРТ.',
  }
  const source = input && typeof input === 'object' ? input : fallback
  return {
    kicker: String(source.kicker || fallback.kicker).slice(0, 40),
    mediaLabel: String(source.mediaLabel || fallback.mediaLabel).slice(0, 40),
    image: String(source.image || fallback.image).slice(0, 500),
    imageAlt: String(source.imageAlt || fallback.imageAlt).slice(0, 160),
    lead: String(source.lead || fallback.lead).slice(0, 700),
    secondary: String(source.secondary || fallback.secondary).slice(0, 1400),
  }
}

function cleanVideo(input) {
  const fallback = {
    kicker: '// ВИДЕО',
    title: 'В РАБОТЕ',
    moreLabel: 'СМОТРЕТЬ ЕЩЁ',
    moreHref: '',
    items: [
      { title: 'ШОУРИЛ 2025', subtitle: 'ФРАГМЕНТЫ СОБЫТИЙ ЗА ПОСЛЕДНЕЕ ВРЕМЯ', url: '' },
      { title: 'СВАДЕБНЫЙ ЛАЙВ', subtitle: 'РАЗ — ТЫ В БЕЛОМ ПЛАТЬЕ.\nДВА — В МОИХ ОБЪЯТИЯХ.\nТРИ — ВИДЕОФРАГМЕНТ СМОТРИ.', url: '' },
      { title: 'НАЗВАНИЕ', subtitle: 'ПОДРОБНОЕ ОПИСАНИЕ ДАННОГО ВИДЕО', url: '' },
      { title: 'НАЗВАНИЕ', subtitle: 'ПОДРОБНОЕ ОПИСАНИЕ ДАННОГО ВИДЕО', url: '' },
    ],
  }
  const source = input && typeof input === 'object' ? input : fallback
  return {
    kicker: String(source.kicker || fallback.kicker).slice(0, 40),
    title: String(source.title || fallback.title).slice(0, 80),
    moreLabel: String(source.moreLabel || fallback.moreLabel).slice(0, 60),
    moreHref: cleanHref(source.moreHref, ''),
    items: fallback.items.map((fallbackItem, index) => {
      const item = source.items?.[index] && typeof source.items[index] === 'object' ? source.items[index] : fallbackItem
      return {
        title: String(item.title || fallbackItem.title).slice(0, 100),
        subtitle: String(item.subtitle || fallbackItem.subtitle).slice(0, 220),
        url: cleanHref(item.url, ''),
      }
    }),
  }
}

function cleanTicker(input) {
  const clamp = (value, min, max, fallbackValue) => {
    const number = Number(value)
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallbackValue
  }
  const knownLogos = ['S7', 'LVMH', 'Сбер', 'Clarins', 'СИБУР', 'VK', 'Яндекс', 'Альфа-Банк', 'BetBoom', 'Kaspersky', 'Фармстандарт']
  const defaults = {
    cardColor: '#303030',
    layouts: {
      desktop: { cardWidth: 280, gap: 24, paddingTop: 28, paddingBottom: 40, fade: 1, speed: 48 },
      tablet: { cardWidth: 240, gap: 20, paddingTop: 24, paddingBottom: 34, fade: 1, speed: 44 },
      mobile: { cardWidth: 184, gap: 14, paddingTop: 18, paddingBottom: 26, fade: 2, speed: 38 },
    },
  }
  const source = input && typeof input === 'object' ? input : defaults
  const cleanLayout = (layout, fallback) => ({
    cardWidth: clamp(layout?.cardWidth, 180, 420, fallback.cardWidth),
    gap: clamp(layout?.gap, 8, 48, fallback.gap),
    paddingTop: clamp(layout?.paddingTop, 0, 100, fallback.paddingTop),
    paddingBottom: clamp(layout?.paddingBottom, 0, 100, fallback.paddingBottom),
    fade: clamp(layout?.fade, 0, 14, fallback.fade),
    speed: clamp(layout?.speed, 20, 90, fallback.speed),
  })
  const sourceLogos = Array.isArray(source.logos) ? source.logos : []
  const ordered = sourceLogos
    .filter((logo) => knownLogos.includes(logo?.name))
    .filter((logo, index, logos) => logos.findIndex((candidate) => candidate.name === logo.name) === index)
    .map((logo) => ({ name: logo.name, enabled: logo.enabled !== false, scale: clamp(logo.scale, 70, 130, 100) }))
  const presentNames = new Set(ordered.map((logo) => logo.name))
  knownLogos.forEach((name) => { if (!presentNames.has(name)) ordered.push({ name, enabled: true, scale: 100 }) })
  return {
    cardColor: /^#[0-9a-f]{6}$/i.test(String(source.cardColor || '')) ? String(source.cardColor).toUpperCase() : defaults.cardColor,
    layouts: {
      desktop: cleanLayout(source.layouts?.desktop, defaults.layouts.desktop),
      tablet: cleanLayout(source.layouts?.tablet, defaults.layouts.tablet),
      mobile: cleanLayout(source.layouts?.mobile, defaults.layouts.mobile),
    },
    logos: ordered,
  }
}

function cleanSelected(input) {
  const fallback = {
    kicker: '// ИЗБРАННОЕ',
    title: 'ИМЕНА И СОБЫТИЯ',
    moreLabel: 'СМОТРЕТЬ ЕЩЁ',
    moreHref: '',
    items: [
      { name: 'СВАДЬБЫ', type: '', description: 'ГАРИК ХАРЛАМОВ\nАНДРЕЙ БЕБУРИШВИЛИ', image: '/images/selected/weddings-garik.webp', imageAlt: 'Адис Маммо и Гарик Харламов на свадебной церемонии' },
      { name: 'ГОДОВЩИНЫ', type: '', description: 'КСЕНИЯ СОБЧАК\nИ КОНСТАНТИН БОГОМОЛОВ', image: '/images/selected/anniversary-sobchak.webp', imageAlt: 'Адис Маммо и Ксения Собчак на сцене' },
      { name: 'ДНИ РОЖДЕНИЯ', type: '', description: 'НИКОЛАЙ БАСКОВ\nОЛЬГА БУЗОВА\nЛЮСЯ ЧЕБОТИНА\nАННА ХИЛЬКЕВИЧ\nАЛСУ', image: '/images/selected/birthdays-baskov.webp', imageAlt: 'Адис Маммо и Николай Басков' },
      { name: 'ДУЭТЫ', type: '', description: 'ИВАН УРГАНТ\nЕКАТЕРИНА ВАРНАВА\nАЛЛА МИХЕЕВА\nАЛЕКСАНДР ГУДКОВ\nМАКСИМ ГАЛКИН\nГАРИК ХАРЛАМОВ\nКСЕНИЯ СОБЧАК\nСЕРГЕЙ МИНАЕВ\nФИЛИПП КИРКОРОВ\nМАРИНА ФЕДУНКИВ\nИ ДРУГИЕ', image: '/images/selected/duets-urgant.webp', imageAlt: 'Адис Маммо и Иван Ургант на сцене' },
    ],
  }
  const source = input && typeof input === 'object' ? input : fallback
  return {
    kicker: String(source.kicker || fallback.kicker).slice(0, 40),
    title: String(source.title || fallback.title).slice(0, 100),
    moreLabel: String(source.moreLabel || fallback.moreLabel).slice(0, 60),
    moreHref: cleanHref(source.moreHref, ''),
    items: fallback.items.map((fallbackItem, index) => {
      const item = source.items?.[index] && typeof source.items[index] === 'object' ? source.items[index] : fallbackItem
      const rawImage = String(item.image || '')
      const safeImage = rawImage.startsWith('/images/') || rawImage.startsWith('/media/selected/') ? rawImage : ''
      return {
        name: String(item.name || fallbackItem.name).slice(0, 120),
        type: String(item.type || fallbackItem.type).slice(0, 120),
        description: String(item.description || fallbackItem.description).slice(0, 700),
        image: safeImage.slice(0, 400),
        imageAlt: String(item.imageAlt || '').slice(0, 160),
      }
    }),
  }
}

function cleanGallery(input) {
  const fallback = {
    kicker: '// ФОТО',
    title: 'ВНЕ СЦЕНАРИЯ',
    moreLabel: 'СМОТРЕТЬ ЕЩЁ',
    moreHref: '',
    items: [
      { image: '/images/gallery/01.webp', imageAlt: 'Адис Маммо ведёт свадебную церемонию под открытым небом' },
      { image: '/images/gallery/02.webp', imageAlt: 'Адис Маммо с микрофоном на камерной церемонии' },
      { image: '/images/gallery/03.webp', imageAlt: 'Адис Маммо и Екатерина Варнава на сцене' },
      { image: '/images/gallery/04.webp', imageAlt: 'Адис Маммо ведёт событие в белом смокинге' },
      { image: '/images/gallery/05.webp', imageAlt: 'Портрет Адиса Маммо на открытом воздухе' },
      { image: '/images/gallery/06.webp', imageAlt: 'Адис Маммо на фоне красной сценографии' },
      { image: '/images/gallery/07.webp', imageAlt: 'Адис Маммо ведёт событие на сцене' },
      { image: '/images/gallery/08.webp', imageAlt: 'Адис Маммо с гостьей светского события' },
    ],
  }
  const source = input && typeof input === 'object' ? input : fallback
  return {
    kicker: String(source.kicker || fallback.kicker).slice(0, 40),
    title: String(source.title || fallback.title).slice(0, 100),
    moreLabel: String(source.moreLabel || fallback.moreLabel).slice(0, 60),
    moreHref: cleanHref(source.moreHref, ''),
    items: fallback.items.map((fallbackItem, index) => {
      const item = source.items?.[index] && typeof source.items[index] === 'object' ? source.items[index] : fallbackItem
      const rawImage = String(item.image || '')
      const safeImage = rawImage.startsWith('/images/') || rawImage.startsWith('/media/gallery/') ? rawImage : ''
      return {
        image: safeImage.slice(0, 400),
        imageAlt: String(item.imageAlt || fallbackItem.imageAlt).slice(0, 160),
      }
    }),
  }
}

function cleanContact(input) {
  const fallback = {
    kicker: '// КОНТАКТЫ', title: 'ПРЯМАЯ СВЯЗЬ', brandTop: 'ADIS', brandBottom: 'MAMMO', role: 'ВЕДУЩИЙ / КОМИК',
    portrait: '/images/adis-contact.png', portraitAlt: 'Адис Маммо', materialsLabel: 'МАТЕРИАЛЫ ДЛЯ ОРГАНИЗАТОРОВ', materialsHref: '#', copyright: '© 2026',
    developmentLabel: 'РАЗРАБОТКА САЙТА', developmentHref: '#', privacyLabel: 'ПОЛИТИКА / COOKIE', privacyHref: '#', topLabel: 'НАВЕРХ',
  }
  const source = input && typeof input === 'object' ? input : fallback
  const rawPortrait = String(source.portrait || '')
  return {
    kicker: String(source.kicker || fallback.kicker).slice(0, 40), title: String(source.title || fallback.title).slice(0, 100),
    brandTop: String(source.brandTop || fallback.brandTop).slice(0, 40), brandBottom: String(source.brandBottom || fallback.brandBottom).slice(0, 40), role: String(source.role || fallback.role).slice(0, 80),
    portrait: rawPortrait.startsWith('/images/') || rawPortrait.startsWith('/media/contact/') ? rawPortrait.slice(0, 400) : fallback.portrait, portraitAlt: String(source.portraitAlt || fallback.portraitAlt).slice(0, 160),
    materialsLabel: String(source.materialsLabel || fallback.materialsLabel).slice(0, 100), materialsHref: cleanHref(source.materialsHref, '#'), copyright: String(source.copyright || fallback.copyright).slice(0, 40),
    developmentLabel: String(source.developmentLabel || fallback.developmentLabel).slice(0, 80), developmentHref: cleanHref(source.developmentHref, '#'), privacyLabel: String(source.privacyLabel || fallback.privacyLabel).slice(0, 80), privacyHref: cleanHref(source.privacyHref, '#'), topLabel: String(source.topLabel || fallback.topLabel).slice(0, 40),
  }
}

function cleanVisibility(input) {
  const fallback = { about: true, video: true, ticker: true, selected: true, gallery: true }
  const source = input && typeof input === 'object' ? input : fallback
  return Object.fromEntries(Object.entries(fallback).map(([key, fallbackValue]) => [key, typeof source[key] === 'boolean' ? source[key] : fallbackValue]))
}

app.get('/api/content', async (_request, response, next) => {
  try {
    const content = await readContent()
    response.set('Cache-Control', 'no-store')
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

app.post('/api/admin/assets/hero', requireAdmin, heroUpload.single('portrait'), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: 'Сначала выбери фотографию' })
    const image = sharp(request.file.buffer, { animated: false, limitInputPixels: 30_000_000 })
    const metadata = await image.metadata()
    if (!['png', 'jpeg', 'webp'].includes(metadata.format)) return response.status(400).json({ error: 'Подойдёт PNG, JPG или WebP' })
    if (!metadata.width || !metadata.height || metadata.width > 6000 || metadata.height > 6000 || metadata.width * metadata.height > 30_000_000) {
      return response.status(400).json({ error: 'Фото слишком большое. Максимум 6000 × 6000 px' })
    }
    const id = crypto.randomUUID()
    const temporaryPath = path.join(heroUploadsDir, `${id}.tmp`)
    const finalPath = path.join(heroUploadsDir, `${id}.webp`)
    await fs.mkdir(heroUploadsDir, { recursive: true })
    const pipeline = image.rotate()
    if (metadata.width > 2800) pipeline.resize({ width: 2800, withoutEnlargement: true })
    const output = await pipeline.webp({ quality: 95, lossless: Boolean(metadata.hasAlpha) }).toBuffer({ resolveWithObject: true })
    await fs.writeFile(temporaryPath, output.data)
    await fs.rename(temporaryPath, finalPath)
    return response.json({
      ok: true,
      asset: {
        id,
        url: `/media/hero/${id}.webp`,
        alt: 'Адис Маммо',
        originalName: path.basename(request.file.originalname).slice(0, 120),
        width: output.info.width,
        height: output.info.height,
        bytes: output.info.size,
      },
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/assets/selected', requireAdmin, selectedUpload.single('image'), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: 'Сначала выбери фотографию' })
    const image = sharp(request.file.buffer, { animated: false, limitInputPixels: 30_000_000 })
    const metadata = await image.metadata()
    if (!['png', 'jpeg', 'webp'].includes(metadata.format)) return response.status(400).json({ error: 'Подойдёт PNG, JPG или WebP' })
    if (!metadata.width || !metadata.height || metadata.width > 6000 || metadata.height > 6000 || metadata.width * metadata.height > 30_000_000) {
      return response.status(400).json({ error: 'Фото слишком большое. Максимум 6000 × 6000 px' })
    }
    const id = crypto.randomUUID()
    const temporaryPath = path.join(selectedUploadsDir, `${id}.tmp`)
    const finalPath = path.join(selectedUploadsDir, `${id}.webp`)
    await fs.mkdir(selectedUploadsDir, { recursive: true })
    const output = await image
      .rotate()
      .resize({ width: 2400, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 92 })
      .toBuffer({ resolveWithObject: true })
    await fs.writeFile(temporaryPath, output.data)
    await fs.rename(temporaryPath, finalPath)
    return response.json({
      ok: true,
      asset: {
        url: `/media/selected/${id}.webp`,
        originalName: path.basename(request.file.originalname).slice(0, 120),
        width: output.info.width,
        height: output.info.height,
        bytes: output.info.size,
      },
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/assets/gallery', requireAdmin, galleryUpload.single('image'), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: 'Сначала выбери фотографию' })
    const image = sharp(request.file.buffer, { animated: false, limitInputPixels: 30_000_000 })
    const metadata = await image.metadata()
    if (!['png', 'jpeg', 'webp'].includes(metadata.format)) return response.status(400).json({ error: 'Подойдёт PNG, JPG или WebP' })
    if (!metadata.width || !metadata.height || metadata.width > 6000 || metadata.height > 6000 || metadata.width * metadata.height > 30_000_000) {
      return response.status(400).json({ error: 'Фото слишком большое. Максимум 6000 × 6000 px' })
    }
    const id = crypto.randomUUID()
    const temporaryPath = path.join(galleryUploadsDir, `${id}.tmp`)
    const finalPath = path.join(galleryUploadsDir, `${id}.webp`)
    await fs.mkdir(galleryUploadsDir, { recursive: true })
    const output = await image
      .rotate()
      .resize({ width: 2600, height: 2600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 92 })
      .toBuffer({ resolveWithObject: true })
    await fs.writeFile(temporaryPath, output.data)
    await fs.rename(temporaryPath, finalPath)
    return response.json({
      ok: true,
      asset: {
        url: `/media/gallery/${id}.webp`,
        originalName: path.basename(request.file.originalname).slice(0, 120),
        width: output.info.width,
        height: output.info.height,
        bytes: output.info.size,
      },
    })
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

app.put('/api/admin/draft/hero', requireAdmin, async (request, response, next) => {
  try {
    const content = await readContent()
    content.draft.hero = cleanHero(request.body)
    await writeContent(content)
    response.json({ ok: true, draft: content.draft })
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/draft', requireAdmin, async (request, response, next) => {
  try {
    const content = await readContent()
    content.draft = {
      ...content.draft,
      header: cleanHeader(request.body?.header),
      hero: cleanHero(request.body?.hero),
      about: cleanAbout(request.body?.about),
      video: cleanVideo(request.body?.video),
      ticker: cleanTicker(request.body?.ticker),
      selected: cleanSelected(request.body?.selected),
      gallery: cleanGallery(request.body?.gallery),
      contact: cleanContact(request.body?.contact),
      visibility: cleanVisibility(request.body?.visibility),
    }
    await writeContent(content)
    response.json({ ok: true, draft: content.draft })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/publish', requireAdmin, async (request, response, next) => {
  try {
    const content = await readContent()
    const nextContent = {
      ...content.draft,
      header: cleanHeader(request.body?.header),
      hero: cleanHero(request.body?.hero),
      about: cleanAbout(request.body?.about),
      video: cleanVideo(request.body?.video),
      ticker: cleanTicker(request.body?.ticker),
      selected: cleanSelected(request.body?.selected),
      gallery: cleanGallery(request.body?.gallery),
      contact: cleanContact(request.body?.contact),
      visibility: cleanVisibility(request.body?.visibility),
    }
    content.draft = structuredClone(nextContent)
    content.published = structuredClone(nextContent)
    await writeContent(content)
    response.json({ ok: true, published: content.published })
  } catch (error) {
    next(error)
  }
})

if (isProduction) {
  app.use(express.static(distDir, { index: false, maxAge: '1h' }))
  app.get('/*path', (_request, response) => response.sendFile(path.join(distDir, 'index.html')))
}

app.use((error, _request, response, _next) => {
  console.error(error)
  if (error instanceof multer.MulterError) {
    return response.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Файл тяжелее 15 МБ' : 'Не удалось загрузить фотографию' })
  }
  response.status(500).json({ error: 'Не удалось выполнить действие' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Adis admin server: http://localhost:${port}`)
})
