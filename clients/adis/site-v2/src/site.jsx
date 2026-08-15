import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(useGSAP)

const fallbackHeader = {
  brand: 'АДИС МАММО',
  formats: ['ЧАСТНЫЕ СОБЫТИЯ', 'КОРПОРАТИВНЫЕ МЕРОПРИЯТИЯ', 'STAND UP'],
  contactLabel: 'СВЯЗАТЬСЯ',
  contactHref: 'https://t.me/amynameis',
  menu: [
    { label: 'ОБ АДИСЕ', href: '#about' },
    { label: 'ВИДЕО', href: '#video' },
    { label: 'ИЗБРАННОЕ', href: '#selected' },
    { label: 'ФОТО', href: '#photos' },
    { label: 'КОНТАКТЫ', href: '#contacts' },
  ],
  socials: [
    { label: 'TELEGRAM', href: 'https://t.me/amynameis' },
    { label: 'WHATSAPP', href: 'https://wa.me/79265685715' },
    { label: 'MAX', href: 'https://max.ru/join/Ssn7W9oeTMShsawb3WxYQxVG2-3XKf8nP30z1dvLO0I' },
    { label: 'INST', href: 'https://www.instagram.com/adismammo' },
    { label: 'YOUTUBE', href: 'https://www.youtube.com/@adismammo3469' },
  ],
}

const heroLayoutDefaults = {
  desktop: {
    minHeight: 820, redHeight: 450, sideGutter: 60, copyTop: 56, titleSize: 180,
    titleLineHeight: 80, roleSize: 30, roleGap: 14, portraitHeight: 94,
    portraitMaxWidth: 82, portraitX: 0, portraitY: 0,
  },
  tablet: {
    minHeight: 1020, redHeight: 550, sideGutter: 48, copyTop: 48, titleSize: 158,
    titleLineHeight: 80, roleSize: 25, roleGap: 12, portraitHeight: 100,
    portraitMaxWidth: 110, portraitX: 0, portraitY: 0,
  },
  mobile: {
    minHeight: 810, redHeight: 445, sideGutter: 16, copyTop: 38, titleSize: 124,
    titleLineHeight: 82, roleSize: 22, roleGap: 10, portraitHeight: 112,
    portraitMaxWidth: 165, portraitX: -14, portraitY: 0,
  },
}

const fallbackHero = {
  nameTop: 'АДИС',
  nameBottom: 'МАММО',
  role: 'ВЕДУЩИЙ / КОМИК',
  accent: '#9B1406',
  portrait: {
    url: '/images/hero/v2/adis-hero-v2.png',
    webpSrcSet: '/images/hero/v2/adis-hero-v2-768.webp 768w, /images/hero/v2/adis-hero-v2-1280.webp 1280w, /images/hero/v2/adis-hero-v2-1920.webp 1920w, /images/hero/v2/adis-hero-v2-2349.webp 2349w',
    sizes: '(max-width: 767px) min(165vw, 854px), (max-width: 1199px) min(110vw, 961px), min(82vw, calc(89svh - 71px))',
    alt: 'Адис Маммо',
    width: 2349,
    height: 2496,
  },
  layouts: heroLayoutDefaults,
  motion: 'text',
}

const fallbackAbout = {
  kicker: '// ОБ АДИСЕ',
  mediaLabel: 'ФОТО',
  image: '/images/adis-about-02-clean.png',
  imageAlt: 'Портрет Адиса Маммо',
  lead: 'ПОБЕДИТЕЛЬ ПРЕМИИ WEDDING AWARDS\nВ НОМИНАЦИИ «ЛУЧШИЙ ВЕДУЩИЙ РОССИИ».\nУЧАСТНИК «ОТКРЫТОГО МИКРОФОНА» НА ТНТ\nИ ROAST BATTLE ОТ LABELCOM.',
  secondary: 'АВТОР YOUTUBE-КАНАЛА «САРКАЗМОШНАЯ».\nВЕДУЩИЙ ПРОЕКТОВ «ИСТОРИИ НА СПОР» И «У МЕНЯ ХУЖЕ».\nВЫПУСТИЛ СОЛЬНЫЙ СТЕНДАП-КОНЦЕРТ.',
}

const fallbackVideo = {
  kicker: '// ВИДЕО',
  title: 'В РАБОТЕ',
  moreLabel: 'ЕЩЁ ВИДЕО',
  moreHref: 'https://t.me/contentmammo',
  items: [
    { title: 'ШОУРИЛ', subtitle: 'ФРАГМЕНТЫ СОБЫТИЙ:\nСЦЕНА, ЗАЛ И ЭНЕРГИЯ МОМЕНТА.', url: 'https://kinescope.io/embed/da7f4528-b31d-4df6-aa3d-1045ad19d59c' },
    { title: 'СВАДЕБНЫЙ ЛАЙВ', subtitle: 'СВАДЬБА БЕЗ ПОСТАНОВКИ:\nИМПРОВИЗАЦИЯ, РЕАКЦИИ И ЖИВОЙ ЗАЛ.', url: 'https://kinescope.io/embed/5e4dc825-1b11-4ba8-8bb5-87e3fa1a6c4f' },
    { title: 'ЗАЛ НА 6000', subtitle: '6000 ПРЕДПРИНИМАТЕЛЕЙ В ОДНОМ ЗАЛЕ.\nЛЕГКО, ТОЧНО И ПО ДЕЛУ.', url: 'https://kinescope.io/embed/caa1da45-c667-45f5-9663-f08343cac815' },
    { title: 'МАММО × ВАРНАВА', subtitle: 'ДВА ХАРАКТЕРА НА ОДНОЙ СЦЕНЕ:\nИМПРОВИЗАЦИЯ И ДИАЛОГ БЕЗ СЦЕНАРИЯ.', url: 'https://kinescope.io/embed/d7b50504-d4fa-4501-b61a-2eeda6b9569f' },
  ],
}

const fallbackSelected = {
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

const fallbackGallery = {
  kicker: '// ФОТО',
  title: 'ВНЕ СЦЕНАРИЯ',
  moreLabel: 'ЕЩЁ ФОТО',
  moreHref: 'https://t.me/contentmammo',
  items: [
    {
      image: '/images/gallery/v2/01-2160.webp',
      avifSrcSet: '/images/gallery/v2/01-640.avif 640w, /images/gallery/v2/01-1280.avif 1280w, /images/gallery/v2/01-2160.avif 2160w',
      webpSrcSet: '/images/gallery/v2/01-640.webp 640w, /images/gallery/v2/01-1280.webp 1280w, /images/gallery/v2/01-2160.webp 2160w',
      sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) calc(100vw - 96px), calc(100vw - 120px)',
      width: 2160,
      height: 864,
      imageAlt: 'Адис Маммо ведёт свадебную церемонию под открытым небом',
    },
    {
      image: '/images/gallery/v2/02-1080.webp',
      avifSrcSet: '/images/gallery/v2/02-480.avif 480w, /images/gallery/v2/02-800.avif 800w, /images/gallery/v2/02-1080.avif 1080w',
      webpSrcSet: '/images/gallery/v2/02-480.webp 480w, /images/gallery/v2/02-800.webp 800w, /images/gallery/v2/02-1080.webp 1080w',
      sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) calc((100vw - 102px)/2), calc((100vw - 126px)/2)',
      width: 1080,
      height: 864,
      imageAlt: 'Адис Маммо с микрофоном на камерной церемонии',
    },
    {
      image: '/images/gallery/v2/03-kirkorov-v2-2120.webp',
      avifSrcSet: '/images/gallery/v2/03-kirkorov-v2-480.avif 480w, /images/gallery/v2/03-kirkorov-v2-800.avif 800w, /images/gallery/v2/03-kirkorov-v2-1280.avif 1280w, /images/gallery/v2/03-kirkorov-v2-2120.avif 2120w',
      webpSrcSet: '/images/gallery/v2/03-kirkorov-v2-480.webp 480w, /images/gallery/v2/03-kirkorov-v2-800.webp 800w, /images/gallery/v2/03-kirkorov-v2-1280.webp 1280w, /images/gallery/v2/03-kirkorov-v2-2120.webp 2120w',
      sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) calc((100vw - 102px)/2), calc((100vw - 126px)/2)',
      width: 2120,
      height: 1728,
      imageAlt: 'Адис Маммо и Филипп Киркоров с микрофонами на мероприятии',
    },
    {
      image: '/images/gallery/v2/04-2156.webp',
      avifSrcSet: '/images/gallery/v2/04-640.avif 640w, /images/gallery/v2/04-1280.avif 1280w, /images/gallery/v2/04-2156.avif 2156w',
      webpSrcSet: '/images/gallery/v2/04-640.webp 640w, /images/gallery/v2/04-1280.webp 1280w, /images/gallery/v2/04-2156.webp 2156w',
      sizes: '(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) calc(100vw - 96px), calc(100vw - 120px)',
      width: 2156,
      height: 862,
      imageAlt: 'Адис Маммо ведёт событие в белом смокинге',
    },
    {
      image: '/images/gallery/v2/05-528.webp',
      avifSrcSet: '/images/gallery/v2/05-264.avif 264w, /images/gallery/v2/05-528.avif 528w',
      webpSrcSet: '/images/gallery/v2/05-264.webp 264w, /images/gallery/v2/05-528.webp 528w',
      sizes: '(max-width: 767px) calc((100vw - 38px)/2), (max-width: 1199px) calc((100vw - 114px)/4), calc((100vw - 138px)/4)',
      width: 528,
      height: 818,
      imageAlt: 'Портрет Адиса Маммо на открытом воздухе',
    },
    {
      image: '/images/gallery/v2/06-526.webp',
      avifSrcSet: '/images/gallery/v2/06-263.avif 263w, /images/gallery/v2/06-526.avif 526w',
      webpSrcSet: '/images/gallery/v2/06-263.webp 263w, /images/gallery/v2/06-526.webp 526w',
      sizes: '(max-width: 767px) calc((100vw - 38px)/2), (max-width: 1199px) calc((100vw - 114px)/4), calc((100vw - 138px)/4)',
      width: 526,
      height: 818,
      imageAlt: 'Адис Маммо на фоне красной сценографии',
    },
    {
      image: '/images/gallery/v2/07-526.webp',
      avifSrcSet: '/images/gallery/v2/07-263.avif 263w, /images/gallery/v2/07-526.avif 526w',
      webpSrcSet: '/images/gallery/v2/07-263.webp 263w, /images/gallery/v2/07-526.webp 526w',
      sizes: '(max-width: 767px) calc((100vw - 38px)/2), (max-width: 1199px) calc((100vw - 114px)/4), calc((100vw - 138px)/4)',
      width: 526,
      height: 818,
      imageAlt: 'Адис Маммо ведёт событие на сцене',
    },
    {
      image: '/images/gallery/v2/08-526.webp',
      avifSrcSet: '/images/gallery/v2/08-263.avif 263w, /images/gallery/v2/08-526.avif 526w',
      webpSrcSet: '/images/gallery/v2/08-263.webp 263w, /images/gallery/v2/08-526.webp 526w',
      sizes: '(max-width: 767px) calc((100vw - 38px)/2), (max-width: 1199px) calc((100vw - 114px)/4), calc((100vw - 138px)/4)',
      width: 526,
      height: 818,
      imageAlt: 'Адис Маммо с гостьей светского события',
    },
  ],
}

const fallbackContact = {
  kicker: '// КОНТАКТЫ',
  title: 'ПРЯМАЯ СВЯЗЬ',
  brandTop: 'АДИС',
  brandBottom: 'МАММО',
  role: 'ВЕДУЩИЙ / КОМИК',
  portrait: '/images/adis-contact.png',
  portraitAlt: 'Адис Маммо',
  materialsLabel: 'МАТЕРИАЛЫ ДЛЯ ОРГАНИЗАТОРОВ',
  materialsHref: 'https://disk.yandex.ru/d/D9CQrr6e1i4WzQ',
  copyright: '© 2026',
  developmentLabel: 'РАЗРАБОТКА САЙТА',
  developmentHref: 'https://twokaif.ru/',
  privacyLabel: 'ПОЛИТИКА / COOKIE',
  privacyHref: '#',
  topLabel: 'НАВЕРХ',
}

const brandLogos = [
  { name: 'S7', src: '/logos/s7.svg', shape: 'mark' },
  { name: 'LVMH', src: '/logos/lvmh.svg', shape: 'wide' },
  { name: 'Сбер', src: '/logos/sber.svg', shape: 'wide' },
  { name: 'Clarins', src: '/logos/clarins.svg', shape: 'wide' },
  { name: 'СИБУР', src: '/logos/sibur.svg', shape: 'wide' },
  { name: 'VK', src: '/logos/vk.svg', shape: 'mark-wide', defaultScale: 78 },
  { name: 'Яндекс', src: '/logos/yandex.svg', shape: 'wide' },
  { name: 'Альфа-Банк', src: '/logos/alfa-bank.svg', shape: 'mark' },
  { name: 'BetBoom', src: '/logos/betboom.svg', shape: 'wide' },
  { name: 'Kaspersky', src: '/logos/kaspersky.svg', shape: 'wide' },
  { name: 'Фармстандарт', src: '/logos/pharmstandard.svg', shape: 'wide' },
]

const tickerLayoutDefaults = {
  desktop: { cardWidth: 220, gap: 16, paddingTop: 20, paddingBottom: 32, fade: 0, speed: 48 },
  tablet: { cardWidth: 190, gap: 14, paddingTop: 18, paddingBottom: 28, fade: 0, speed: 44 },
  mobile: { cardWidth: 148, gap: 10, paddingTop: 14, paddingBottom: 22, fade: 0, speed: 38 },
}

const fallbackTicker = {
  cardColor: '#303030',
  layouts: tickerLayoutDefaults,
  logos: brandLogos.map((logo) => ({ name: logo.name, enabled: true, scale: logo.defaultScale || 100 })),
}

const fallbackVisibility = {
  about: true,
  video: true,
  ticker: true,
  selected: true,
  gallery: true,
}

function normalizeVisibility(input = {}) {
  return Object.fromEntries(Object.entries(fallbackVisibility).map(([key, fallback]) => [key, typeof input?.[key] === 'boolean' ? input[key] : fallback]))
}

function filterHeaderByVisibility(header, visibility) {
  const hiddenHrefs = new Set([
    !visibility.about && '#about',
    !visibility.video && '#video',
    !visibility.selected && '#selected',
    !visibility.gallery && '#photos',
  ].filter(Boolean))
  return { ...header, menu: (header.menu || []).filter((item) => !hiddenHrefs.has(item.href)) }
}

function normalizeTicker(input = {}) {
  const incomingLogos = Array.isArray(input?.logos) ? input.logos : []
  const knownNames = new Set(brandLogos.map((logo) => logo.name))
  const ordered = incomingLogos
    .filter((logo) => knownNames.has(logo?.name))
    .map((logo) => ({ name: logo.name, enabled: logo.enabled !== false, scale: Number(logo.scale || 100) }))
  const presentNames = new Set(ordered.map((logo) => logo.name))
  const missing = brandLogos.filter((logo) => !presentNames.has(logo.name)).map((logo) => ({ name: logo.name, enabled: true, scale: logo.defaultScale || 100 }))
  return {
    ...fallbackTicker,
    ...(input || {}),
    layouts: {
      desktop: { ...tickerLayoutDefaults.desktop, ...(input?.layouts?.desktop || {}) },
      tablet: { ...tickerLayoutDefaults.tablet, ...(input?.layouts?.tablet || {}) },
      mobile: { ...tickerLayoutDefaults.mobile, ...(input?.layouts?.mobile || {}) },
    },
    logos: [...ordered, ...missing],
  }
}

function getTickerStyle(content) {
  const ticker = normalizeTicker(content)
  const variables = Object.entries(ticker.layouts).reduce((result, [device, layout]) => {
    Object.entries(layout).forEach(([key, value]) => { result[`--ticker-${device}-${key}`] = value })
    return result
  }, {})
  return { ...variables, '--ticker-card-color': ticker.cardColor }
}

function normalizeVideo(input = {}) {
  return {
    ...fallbackVideo,
    ...(input || {}),
    items: fallbackVideo.items.map((fallbackItem, index) => ({ ...fallbackItem, ...(input?.items?.[index] || {}) })),
  }
}

function normalizeSelected(input = {}) {
  return {
    ...fallbackSelected,
    ...(input || {}),
    items: fallbackSelected.items.map((fallbackItem, index) => ({ ...fallbackItem, ...(input?.items?.[index] || {}) })),
  }
}

function normalizeGallery(input = {}) {
  return {
    ...fallbackGallery,
    ...(input || {}),
    items: fallbackGallery.items.map((fallbackItem, index) => ({ ...fallbackItem, ...(input?.items?.[index] || {}) })),
  }
}

function normalizeContact(input = {}) {
  return { ...fallbackContact, ...(input || {}) }
}

function normalizeHeader(input = {}) {
  return {
    ...fallbackHeader,
    ...(input || {}),
    menu: Array.isArray(input?.menu) ? input.menu : fallbackHeader.menu,
    socials: Array.isArray(input?.socials) ? input.socials : fallbackHeader.socials,
  }
}

function normalizeSiteContent(input = {}) {
  return {
    header: normalizeHeader(input.header),
    hero: normalizeHero(input.hero),
    about: { ...fallbackAbout, ...(input.about || {}) },
    video: normalizeVideo(input.video),
    ticker: normalizeTicker(input.ticker),
    selected: normalizeSelected(input.selected),
    gallery: normalizeGallery(input.gallery),
    contact: normalizeContact(input.contact),
    visibility: normalizeVisibility(input.visibility),
  }
}

function readBootstrappedContent() {
  if (window.__ADIS_STANDALONE_CONTENT__) return window.__ADIS_STANDALONE_CONTENT__
  const node = document.getElementById('site-content')
  if (!node?.dataset.json) return null
  try {
    return JSON.parse(node.dataset.json)
  } catch {
    return null
  }
}

const bootstrappedContent = readBootstrappedContent()
let contentRequest

function requestContent() {
  if (!contentRequest) {
    contentRequest = fetch('/api/content')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .catch((error) => {
        contentRequest = undefined
        throw error
      })
  }
  return contentRequest
}

function normalizeHero(input = {}) {
  const normalizeLayoutUnits = (layout, defaults) => {
    const source = { ...defaults, ...(layout || {}) }
    return {
      ...source,
      redHeight: Number(source.redHeight) <= 65 ? defaults.redHeight : Number(source.redHeight),
      sideGutter: Number(source.sideGutter) <= 8 ? defaults.sideGutter : Number(source.sideGutter),
    }
  }
  const legacyLayout = {
    ...heroLayoutDefaults.desktop,
    redHeight: Number(input.redHeight ?? heroLayoutDefaults.desktop.redHeight) <= 65
      ? heroLayoutDefaults.desktop.redHeight
      : Number(input.redHeight),
    portraitHeight: Number(input.portraitHeight ?? heroLayoutDefaults.desktop.portraitHeight),
    portraitX: Number(input.portraitX ?? heroLayoutDefaults.desktop.portraitX),
    portraitY: Number(input.portraitY ?? heroLayoutDefaults.desktop.portraitY),
  }
  const portrait = typeof input.portrait === 'object' && input.portrait
    ? { ...fallbackHero.portrait, ...input.portrait }
    : { ...fallbackHero.portrait, url: input.image || fallbackHero.portrait.url }
  return {
    ...fallbackHero,
    ...input,
    portrait,
    layouts: {
      desktop: normalizeLayoutUnits({ ...legacyLayout, ...(input.layouts?.desktop || {}) }, heroLayoutDefaults.desktop),
      tablet: normalizeLayoutUnits(input.layouts?.tablet, heroLayoutDefaults.tablet),
      mobile: normalizeLayoutUnits(input.layouts?.mobile, heroLayoutDefaults.mobile),
    },
  }
}

function getHeroStyle(content) {
  const hero = normalizeHero(content)
  const layoutVariables = Object.entries(hero.layouts).reduce((variables, [device, layout]) => {
    Object.entries(layout).forEach(([key, value]) => { variables[`--hero-${device}-${key}`] = value })
    return variables
  }, {})
  return { ...layoutVariables, '--hero-accent': hero.accent }
}

function DotsIcon({ close = false }) {
  return close ? (
    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="7" cy="7" r="1.45" /><circle cx="17" cy="7" r="1.45" />
      <circle cx="7" cy="17" r="1.45" /><circle cx="17" cy="17" r="1.45" />
    </svg>
  )
}

function RollingMenuLabel({ label }) {
  return (
    <span className="menu-link-roller" aria-hidden="true">
      <span className="menu-link-inner">
        {Array.from(label).map((character, index) => (
          <span className="menu-character" style={{ '--character-index': index }} key={`${character}-${index}`}>
            {character === ' ' ? '\u00A0' : character}
          </span>
        ))}
      </span>
    </span>
  )
}

function FormatLine({ formats, className = '' }) {
  return (
    <div className={`format-line${className ? ` ${className}` : ''}`} aria-label="Форматы работы">
      <div className="format-line-track">
        {formats.map((format, index) => (
          <React.Fragment key={`${format}-${index}`}>
            {index > 0 && <span className="format-divider" aria-hidden="true">/</span>}
            <span>{format}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function SiteHeader({ content = fallbackHeader }) {
  const [open, setOpen] = useState(false)
  const [activeMenuIndex, setActiveMenuIndex] = useState(0)
  const overlayRef = useRef(null)
  const progressRef = useRef(null)
  const openButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const lastFocusedRef = useRef(null)

  useGSAP(() => {
    if (!overlayRef.current) return
    gsap.killTweensOf(overlayRef.current)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      gsap.set(overlayRef.current, { y: open ? 0 : window.innerHeight, opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' })
      return
    }
    if (open) {
      gsap.set(overlayRef.current, { visibility: 'visible' })
      gsap.fromTo(
        overlayRef.current,
        { y: window.innerHeight, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.68, ease: 'power4.out' },
      )
    } else {
      gsap.to(overlayRef.current, {
        y: window.innerHeight, opacity: 0, duration: 0.58, ease: 'power4.inOut',
        onComplete: () => gsap.set(overlayRef.current, { visibility: 'hidden' }),
      })
    }
  }, { dependencies: [open], scope: overlayRef })

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus())
    const keepFocusInside = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !overlayRef.current) return
      const focusable = Array.from(overlayRef.current.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', keepFocusInside)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', keepFocusInside)
      lastFocusedRef.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    let frame = 0
    const updateHeaderContext = () => {
      frame = 0
      const viewportHeight = window.innerHeight || 1
      const scrollable = Math.max(1, document.documentElement.scrollHeight - viewportHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable))
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
    }
    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateHeaderContext)
    }
    updateHeaderContext()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  const followLink = (href, closeMenu = false) => {
    if (closeMenu) setOpen(false)
    if (!href || href === '#') return
    if (href.startsWith('#')) {
      const scrollToSection = () => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (closeMenu) requestAnimationFrame(scrollToSection)
      else scrollToSection()
      return
    }
    window.open(href, '_blank', 'noopener,noreferrer')
  }
  const openMenu = () => {
    lastFocusedRef.current = document.activeElement || openButtonRef.current
    setOpen(true)
  }

  return (
    <>
      <header className="site-header">
        <button className="brand brand-button" type="button" onClick={() => followLink('#top')}>{content.brand}</button>
        <FormatLine formats={content.formats} />
        <div className="header-actions">
          <button className="contact-button" type="button" onClick={() => followLink(content.contactHref)}>{content.contactLabel}</button>
          <button ref={openButtonRef} className="menu-button" type="button" aria-label="Открыть меню" aria-expanded={open} aria-controls="site-menu-dialog" onClick={openMenu}><DotsIcon /></button>
        </div>
        <span className="header-scroll-progress" ref={progressRef} aria-hidden="true" />
      </header>

      <aside ref={overlayRef} id="site-menu-dialog" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Меню сайта" aria-hidden={!open}>
        <div className="menu-header">
          <button className="brand brand-button" type="button" onClick={() => followLink('#top', true)}>{content.brand}</button>
          <FormatLine formats={content.formats} className="menu-format-line" />
          <div className="header-actions">
            <button className="contact-button contact-button-dark" type="button" onClick={() => followLink(content.contactHref, true)}>{content.contactLabel}</button>
            <button ref={closeButtonRef} className="menu-button menu-button-dark" type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)}><DotsIcon close /></button>
          </div>
        </div>
        <div className="menu-stage">
          <figure className="menu-portrait" aria-hidden="true">
            {open && <img src="/images/optimized/adis-menu-640.webp" alt="" width="640" height="1138" decoding="async" />}
          </figure>
          <nav className="menu-list" aria-label="Основная навигация" onMouseLeave={() => setActiveMenuIndex(0)}>
            {content.menu.map((item, index) => (
              <button
                className={`menu-link${index === activeMenuIndex ? ' is-active' : ''}`}
                type="button"
                aria-label={item.label}
                key={`${item.label}-${index}`}
                onClick={() => followLink(item.href, true)}
                onFocus={() => setActiveMenuIndex(index)}
                onMouseEnter={() => setActiveMenuIndex(index)}
              >
                <RollingMenuLabel label={item.label} />
              </button>
            ))}
          </nav>
        </div>
        <nav className="menu-socials" aria-label="Социальные сети">
          {(content.socials || fallbackHeader.socials).map((item, index) => (
            <button className="menu-social-link" type="button" onClick={() => followLink(item.href, true)} key={`${item.label}-${index}`}>{item.label}</button>
          ))}
        </nav>
      </aside>
    </>
  )
}

function HeroSection({ content = fallbackHero }) {
  const hero = normalizeHero(content)
  return (
    <section className={`hero hero-motion-${hero.motion}`} aria-labelledby="hero-title" style={getHeroStyle(hero)}>
      <div className="hero-red-field" aria-hidden="true" />
      <div className="hero-copy">
        <h1 id="hero-title"><span>{hero.nameTop}</span><span>{hero.nameBottom}</span></h1>
        <p>{hero.role}</p>
      </div>
      <picture>
        {hero.portrait.webpSrcSet && <source type="image/webp" srcSet={hero.portrait.webpSrcSet} sizes={hero.portrait.sizes} />}
        <img
          className="hero-portrait"
          src={hero.portrait.url}
          alt={hero.portrait.alt || 'Адис Маммо'}
          width={hero.portrait.width}
          height={hero.portrait.height}
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </section>
  )
}

function AboutSection({ content = fallbackAbout }) {
  const about = { ...fallbackAbout, ...(content || {}) }
  const usesOptimizedPortrait = about.image === fallbackAbout.image
  return (
    <section className="about-section" id="about" aria-labelledby="about-title" data-header-label={about.kicker}>
      <div className="about-column editorial-reveal editorial-reveal-no-line" data-editorial-reveal>
        <p className="about-kicker editorial-reveal-kicker">{about.kicker}</p>
        <div className="about-media editorial-reveal-media">
          <picture>
            {usesOptimizedPortrait && (
              <source
                type="image/webp"
                srcSet="/images/optimized/adis-about-320.webp 320w, /images/optimized/adis-about-640.webp 640w, /images/optimized/adis-about-960.webp 960w"
                sizes="(max-width: 767px) min(62vw, 260px), min(19vw, 274px)"
              />
            )}
            <img
              src={about.image}
              alt={about.imageAlt || 'Портрет Адиса Маммо'}
              width="2062"
              height="2880"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
        <h2 id="about-title"><span className="editorial-reveal-title">{about.lead}</span></h2>
        <p className="about-secondary">{about.secondary}</p>
      </div>
    </section>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7.1 19.95 11.9-7.24a.83.83 0 0 0 0-1.42L7.1 4.05a.84.84 0 0 0-1.27.71v14.48a.84.84 0 0 0 1.27.71Z" />
    </svg>
  )
}

const localVideoPosters = {
  'da7f4528-b31d-4df6-aa3d-1045ad19d59c': 'showreel',
  '5e4dc825-1b11-4ba8-8bb5-87e3fa1a6c4f': 'wedding-live',
  'caa1da45-c667-45f5-9663-f08343cac815': 'hall-6000',
  'd7b50504-d4fa-4501-b61a-2eeda6b9569f': 'mammo-varnava',
}

function getKinescopePoster(url) {
  const videoId = String(url || '').match(/kinescope\.io\/embed\/([a-f0-9-]+)/i)?.[1]
  const localName = localVideoPosters[videoId]
  if (localName) {
    return {
      src: `/images/video-posters/${localName}-1280.webp`,
      srcSet: `/images/video-posters/${localName}-640.webp 640w, /images/video-posters/${localName}-1280.webp 1280w`,
    }
  }
  return { src: videoId ? `https://kinescope.io/${videoId}/poster/lg.jpg` : '', srcSet: undefined }
}

function VideoPoster({ url }) {
  const poster = getKinescopePoster(url)
  return (
    <img
      className="video-poster"
      src={poster.src}
      srcSet={poster.srcSet}
      sizes="(min-width: 1200px) calc((100vw - 120px) * .73), 100vw"
      alt=""
      width="1280"
      height="720"
      loading="lazy"
      decoding="async"
    />
  )
}

function VideoSection({ content = fallbackVideo }) {
  const video = normalizeVideo(content)
  const [playingIndex, setPlayingIndex] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [playerRect, setPlayerRect] = useState(null)
  const videoSlotsRef = useRef([])
  const frameRequestRef = useRef(null)
  const playerShellRef = useRef(null)
  const expandButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const playingVideo = playingIndex === null ? null : video.items[playingIndex]

  useEffect(() => {
    if (playingIndex === null || isExpanded) return undefined
    const syncPlayerRect = () => {
      if (frameRequestRef.current) window.cancelAnimationFrame(frameRequestRef.current)
      frameRequestRef.current = window.requestAnimationFrame(() => {
        frameRequestRef.current = null
        const slot = videoSlotsRef.current[playingIndex]
        if (!slot) return
        const rect = slot.getBoundingClientRect()
        const nextRect = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        if (playerShellRef.current) Object.assign(playerShellRef.current.style, Object.fromEntries(Object.entries(nextRect).map(([key, value]) => [key, `${value}px`])))
        else setPlayerRect(nextRect)
      })
    }
    syncPlayerRect()
    const resizeObserver = new ResizeObserver(syncPlayerRect)
    const slot = videoSlotsRef.current[playingIndex]
    if (slot) resizeObserver.observe(slot)
    window.addEventListener('resize', syncPlayerRect)
    window.addEventListener('scroll', syncPlayerRect, true)
    return () => {
      if (frameRequestRef.current) window.cancelAnimationFrame(frameRequestRef.current)
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncPlayerRect)
      window.removeEventListener('scroll', syncPlayerRect, true)
    }
  }, [playingIndex, isExpanded])

  useEffect(() => {
    if (!isExpanded) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsExpanded(false)
        window.requestAnimationFrame(() => expandButtonRef.current?.focus())
        return
      }
      if (event.key === 'Tab') {
        event.preventDefault()
        closeButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded])

  const startVideo = (index) => {
    setPlayingIndex(index)
    setIsExpanded(false)
  }

  const collapsePlayer = () => {
    setIsExpanded(false)
    window.requestAnimationFrame(() => expandButtonRef.current?.focus())
  }

  return (
    <>
      <section className="video-section" id="video" aria-labelledby="video-title" data-header-label={video.kicker}>
        <header className="video-heading editorial-reveal" data-editorial-reveal>
          <p className="editorial-reveal-kicker">{video.kicker}</p>
          <h2 id="video-title"><span className="editorial-reveal-title">{video.title}</span></h2>
        </header>
        <div className="video-list">
          {video.items.map((item, index) => (
            <article className="video-row" key={`${item.title}-${index}`}>
              <div
                className={`video-placeholder${item.url ? ' has-video' : ''}${playingIndex === index ? ' is-playing' : ''}`}
                ref={(node) => { videoSlotsRef.current[index] = node }}
              >
                {item.url && playingIndex !== index && (
                  <button className="video-launch" type="button" aria-label={`Смотреть: ${item.title}`} onClick={() => startVideo(index)}>
                    <VideoPoster url={item.url} />
                    <span className="video-poster-shade" aria-hidden="true" />
                    <span className="video-play"><PlayIcon /></span>
                  </button>
                )}
              </div>
              <div className="video-copy">
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
        <EditorialAction className="video-more" href={video.moreHref} label={video.moreLabel} external />
      </section>
      {playingVideo && playerRect && createPortal(
        <div
          ref={playerShellRef}
          className={`video-player-shell${isExpanded ? ' is-expanded' : ' is-inline'}`}
          style={isExpanded ? undefined : playerRect}
          role={isExpanded ? 'dialog' : undefined}
          aria-modal={isExpanded ? 'true' : undefined}
          aria-label={isExpanded ? `Видео: ${playingVideo.title}` : undefined}
        >
          {isExpanded && <button className="video-player-backdrop" type="button" aria-label="Вернуть видео в карточку" onClick={collapsePlayer} />}
          <div className="video-player-stage" key="video-player-stage">
            <iframe
              key={playingVideo.url}
              src={`${playingVideo.url}?autoplay=1`}
              title={`${playingVideo.title} — видео`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock"
              allowFullScreen
            />
            {!isExpanded && (
              <button className="video-player-expand" type="button" aria-label="Развернуть видео" ref={expandButtonRef} onClick={() => setIsExpanded(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" /></svg>
              </button>
            )}
            {isExpanded && (
              <button className="video-lightbox-close" type="button" aria-label="Вернуть видео в карточку" ref={closeButtonRef} onClick={collapsePlayer}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg>
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

function BrandTicker({ content = fallbackTicker }) {
  const ticker = normalizeTicker(content)
  const tickerRef = useRef(null)
  const visibleLogos = ticker.logos
    .filter((logo) => logo.enabled)
    .map((logo) => ({ ...brandLogos.find((asset) => asset.name === logo.name), ...logo }))
    .filter((logo) => logo.src)
  useEffect(() => {
    const element = tickerRef.current
    if (!element) return undefined
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      element.classList.add('is-visible')
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle('is-visible', entry.isIntersecting)
    }, { rootMargin: '120px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  if (!visibleLogos.length) return null
  return (
    <section ref={tickerRef} className="brand-ticker" id="brands" aria-label="Бренды, для которых Адис проводил мероприятия" style={getTickerStyle(ticker)}>
      <h2 className="visually-hidden">Бренды и компании</h2>
      <div className="brand-ticker-viewport">
        <div className="brand-ticker-track">
          {[0, 1].map((setIndex) => (
            <div className="brand-ticker-set" aria-hidden={setIndex === 1} key={setIndex}>
              {visibleLogos.map((logo) => (
                <div className={`brand-logo-card brand-logo-${logo.shape}`} style={{ '--logo-scale': logo.scale / 100 }} key={`${setIndex}-${logo.name}`}>
                  <img src={logo.src} alt={setIndex === 0 ? logo.name : ''} loading="lazy" draggable="false" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EditorialArrow({ direction = 'right' }) {
  if (direction === 'up') {
    return <svg className="editorial-action-arrow editorial-action-arrow-up" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31V3M3 12l9-9 9 9" vectorEffect="non-scaling-stroke" /></svg>
  }
  if (direction === 'left') {
    return <svg className="editorial-action-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12H3M11 4l-8 8 8 8" vectorEffect="non-scaling-stroke" /></svg>
  }
  return <svg className="editorial-action-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h19M13 4l8 8-8 8" vectorEffect="non-scaling-stroke" /></svg>
}

function EditorialAction({ className = '', href = '', label, direction = 'right', external = false }) {
  const classes = `editorial-action editorial-action-${direction}${href && href !== '#' ? '' : ' is-disabled'}${className ? ` ${className}` : ''}`
  const content = <><span className="editorial-action-label">{label}</span><EditorialArrow direction={direction} /></>
  if (!href || href === '#') return <span className={classes} aria-disabled="true">{content}</span>
  return <a className={classes} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>
}

function SelectedProjects({ content = fallbackSelected }) {
  const selected = normalizeSelected(content)
  return (
    <section className="selected-section" id="selected" aria-labelledby="selected-title" data-header-label={`// ${selected.title}`}>
      <header className="selected-heading editorial-reveal" data-editorial-reveal>
        <p className="editorial-reveal-kicker">{selected.kicker}</p>
        <h2 id="selected-title"><span className="editorial-reveal-title">{selected.title}</span></h2>
      </header>
      <div className="selected-list">
        {selected.items.map((item, index) => (
          <article className="selected-project" style={{ '--selected-order': index + 1 }} key={`${item.name}-${index}`}>
            <div className="selected-project-head">
              <span className="selected-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.name}</h3>
            </div>
            <div className="selected-project-body">
              <div className={`selected-meta${item.type ? '' : ' selected-meta-names'}`}>
                {item.type && <strong>{item.type}</strong>}
                {item.description && <p>{item.description.split('\n').map((line, lineIndex) => <span className={line === 'И ДРУГИЕ' ? 'selected-meta-note' : ''} key={`${line}-${lineIndex}`}>{line}</span>)}</p>}
              </div>
              <div className={`selected-media${item.image ? ' has-image' : ''}`}>
                {item.image ? <img src={item.image} alt={item.imageAlt || item.name} loading="lazy" /> : <span>ФОТО</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
      <EditorialAction className="selected-more" href={selected.moreHref} label={selected.moreLabel} external />
    </section>
  )
}

function GalleryImage({ item, alt, sizes, loading = 'lazy', fetchPriority }) {
  return (
    <picture>
      {item.avifSrcSet && <source type="image/avif" srcSet={item.avifSrcSet} sizes={sizes || item.sizes} />}
      <img
        src={item.image}
        srcSet={item.webpSrcSet || undefined}
        sizes={sizes || item.sizes}
        width={item.width || undefined}
        height={item.height || undefined}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  )
}

function PhotoGallery({ content = fallbackGallery }) {
  const gallery = normalizeGallery(content)
  const [activePhoto, setActivePhoto] = useState(null)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const photoButtonsRef = useRef([])
  const openerIndexRef = useRef(null)

  const closeLightbox = () => {
    const trigger = openerIndexRef.current !== null ? photoButtonsRef.current[openerIndexRef.current] : null
    setActivePhoto(null)
    window.requestAnimationFrame(() => trigger?.focus())
  }
  const showPrevious = () => setActivePhoto((current) => current && ({ ...current, index: (current.index - 1 + gallery.items.length) % gallery.items.length }))
  const showNext = () => setActivePhoto((current) => current && ({ ...current, index: (current.index + 1) % gallery.items.length }))

  useEffect(() => {
    if (activePhoto === null) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!activePhoto.instant) window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    else closeButtonRef.current?.focus({ preventScroll: true })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(dialogRef.current?.querySelectorAll('button:not([disabled])') || [])]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePhoto !== null, gallery.items.length])

  const activeItem = activePhoto === null ? null : gallery.items[activePhoto.index]
  return (
    <section className="gallery-section" id="photos" aria-labelledby="gallery-title" data-header-label={gallery.kicker}>
      <header className="gallery-heading editorial-reveal" data-editorial-reveal>
        <p className="editorial-reveal-kicker">{gallery.kicker}</p>
        <h2 id="gallery-title"><span className="editorial-reveal-title">{gallery.title}</span></h2>
      </header>
      <div className="gallery-grid">
        {gallery.items.map((item, index) => (
          <figure className={`gallery-item gallery-item-${index + 1}`} key={index}>
            <button
              className={`gallery-media${item.image ? ' has-image' : ''}`}
              type="button"
              disabled={!item.image}
              ref={(node) => { photoButtonsRef.current[index] = node }}
              aria-label={item.image ? `Открыть фотографию ${index + 1} на весь экран` : undefined}
              onClick={(event) => {
                if (!item.image) return
                openerIndexRef.current = index
                setActivePhoto({ index, instant: event.detail === 0 })
              }}
            >
              {item.image
                ? <GalleryImage item={item} alt={item.imageAlt || `Адис Маммо — фото ${index + 1}`} />
                : <span>ФОТО</span>}
            </button>
          </figure>
        ))}
      </div>
      <EditorialAction className="gallery-more" href={gallery.moreHref} label={gallery.moreLabel} external />
      {activeItem && (
        <div
          className={`gallery-lightbox${activePhoto.instant ? ' is-instant' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={`Фотография ${activePhoto.index + 1} из ${gallery.items.length}`}
          ref={dialogRef}
          onMouseDown={(event) => event.target === event.currentTarget && closeLightbox()}
        >
          <button className="gallery-lightbox-nav gallery-lightbox-prev" type="button" aria-label="Предыдущая фотография" onClick={showPrevious}>
            <EditorialArrow direction="left" />
          </button>
          <figure className="gallery-lightbox-media">
            <div className="gallery-lightbox-frame">
              <GalleryImage
                item={activeItem}
                alt={activeItem.imageAlt || `Адис Маммо — фото ${activePhoto.index + 1}`}
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
              />
              <button className="gallery-lightbox-close" type="button" aria-label="Закрыть фотографию" ref={closeButtonRef} onClick={closeLightbox}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg>
              </button>
            </div>
          </figure>
          <button className="gallery-lightbox-nav gallery-lightbox-next" type="button" aria-label="Следующая фотография" onClick={showNext}>
            <EditorialArrow direction="right" />
          </button>
        </div>
      )}
    </section>
  )
}

function ContactLink({ className, href, children, external = false }) {
  if (!href || href === '#') return <span className={className}>{children}</span>
  return <a className={className} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>
}

function ContactSection({ content = fallbackContact, header = fallbackHeader }) {
  const contact = normalizeContact(content)
  const usesOptimizedPortrait = contact.portrait === fallbackContact.portrait
  return (
    <section className="contact-section editorial-reveal editorial-reveal-no-line" id="contacts" aria-labelledby="contact-title" data-header-label={contact.kicker} data-editorial-reveal>
      <div className="contact-topline">
        <p className="editorial-reveal-kicker">{contact.kicker}</p>
        <nav className="contact-menu" aria-label="Навигация в подвале">
          <strong>МЕНЮ</strong>
          {header.menu.map((item, index) => <ContactLink href={item.href} key={`${item.label}-${index}`}>{item.label}</ContactLink>)}
        </nav>
      </div>
      <h2 id="contact-title"><span className="editorial-reveal-title">{contact.title}</span></h2>
      <nav className="contact-socials" aria-label="Социальные сети">
        {(header.socials || fallbackHeader.socials).map((item, index) => <ContactLink className="contact-social-link" href={item.href} external key={`${item.label}-${index}`}>{item.label}</ContactLink>)}
      </nav>
      <div className="contact-main">
        <div className="contact-signature">
          <p><span>{contact.brandTop}</span><span>{contact.brandBottom}</span></p>
          <small>{contact.role}</small>
        </div>
        <div className="contact-materials">
          <div className={`contact-portrait${contact.portrait ? ' has-image' : ''}`}>
            {contact.portrait ? (
              <picture>
                {usesOptimizedPortrait && (
                  <source
                    type="image/webp"
                    srcSet="/images/optimized/adis-contact-320.webp 320w, /images/optimized/adis-contact-640.webp 640w, /images/optimized/adis-contact-960.webp 960w"
                    sizes="(min-width: 1200px) min(24vw, 420px), 40vw"
                  />
                )}
                <img src={contact.portrait} alt={contact.portraitAlt} width="2092" height="2343" loading="lazy" decoding="async" />
              </picture>
            ) : <span>ФОТО</span>}
          </div>
          <ContactLink className="contact-materials-link" href={contact.materialsHref} external>{contact.materialsLabel}</ContactLink>
        </div>
      </div>
      <footer className="contact-footer">
        <span>{contact.copyright}</span>
        <ContactLink className="contact-footer-link" href={contact.developmentHref} external>{contact.developmentLabel}</ContactLink>
        <ContactLink className="contact-footer-link" href={contact.privacyHref}>{contact.privacyLabel}</ContactLink>
        <EditorialAction className="contact-top-link" href="#top" label={contact.topLabel} direction="up" />
      </footer>
    </section>
  )
}

export default function PublicSite() {
  const [content, setContent] = useState(() => bootstrappedContent ? normalizeSiteContent(bootstrappedContent) : null)
  const [contentFailed, setContentFailed] = useState(false)
  useEffect(() => {
    if (bootstrappedContent) return undefined
    let cancelled = false
    requestContent()
      .then((nextContent) => {
        if (!cancelled) setContent(normalizeSiteContent(nextContent))
      })
      .catch(() => {
        if (!cancelled) setContentFailed(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let cancelled = false
    let lenis
    let idleId
    let timeoutId
    const initialize = async () => {
      try {
        const { default: Lenis } = await import('lenis')
        if (cancelled) return
        lenis = new Lenis({
          autoRaf: true,
          autoToggle: true,
          anchors: { offset: -80 },
          duration: 1.05,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.9,
        })
      } catch {
        // Нативная прокрутка остаётся рабочей, если модуль не загрузился.
      }
    }
    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(initialize, { timeout: 900 })
    else timeoutId = window.setTimeout(initialize, 250)
    return () => {
      cancelled = true
      if (idleId) window.cancelIdleCallback(idleId)
      if (timeoutId) window.clearTimeout(timeoutId)
      lenis?.destroy()
    }
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-editorial-reveal]'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-revealed'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [content])

  if (!content) {
    return (
      <main className="content-loading-shell" aria-busy={!contentFailed}>
        <span>АДИС МАММО</span>
        {contentFailed && <button type="button" onClick={() => window.location.reload()}>ОБНОВИТЬ</button>}
      </main>
    )
  }

  const visibility = normalizeVisibility(content.visibility)
  const visibleHeader = filterHeaderByVisibility(content.header, visibility)

  return (
    <main className="site-shell" id="top" style={getHeroStyle(content.hero)}>
      <SiteHeader content={visibleHeader} />
      <HeroSection content={content.hero} />
      {visibility.about && <AboutSection content={content.about} />}
      {visibility.video && <VideoSection content={content.video} />}
      {visibility.ticker && <BrandTicker content={content.ticker} />}
      {visibility.selected && <SelectedProjects content={content.selected} />}
      {visibility.gallery && <PhotoGallery content={content.gallery} />}
      <ContactSection content={content.contact} header={visibleHeader} />
    </main>
  )
}
