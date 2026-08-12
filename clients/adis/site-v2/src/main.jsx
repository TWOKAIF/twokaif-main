import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './styles.css'

gsap.registerPlugin(useGSAP)

const fallbackHeader = {
  brand: 'АДИС МАММО',
  formats: ['ЧАСТНЫЕ СОБЫТИЯ', 'КОРПОРАТИВНЫЕ МЕРОПРИЯТИЯ', 'STAND UP'],
  contactLabel: 'СВЯЗАТЬСЯ',
  contactHref: '#contacts',
  menu: [
    { label: 'ОБ АДИСЕ', href: '#about' },
    { label: 'ВИДЕО', href: '#video' },
    { label: 'ИЗБРАННОЕ', href: '#selected' },
    { label: 'ФОТО', href: '#photos' },
    { label: 'КОНТАКТЫ', href: '#contacts' },
  ],
  socials: [
    { label: 'TELEGRAM', href: '#' },
    { label: 'WHATSAPP', href: '#' },
    { label: 'MAX', href: '#' },
    { label: 'INSTAGRAM', href: '#' },
    { label: 'YOUTUBE', href: '#' },
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
  portrait: { url: '/images/adis-hero.png', alt: 'Адис Маммо', width: 2401, height: 2548 },
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
  moreLabel: 'СМОТРЕТЬ ЕЩЁ',
  moreHref: '',
  items: [
    { title: 'ШОУРИЛ 2025', subtitle: 'ФРАГМЕНТЫ СОБЫТИЙ ЗА ПОСЛЕДНЕЕ ВРЕМЯ', url: '' },
    { title: 'СВАДЕБНЫЙ ЛАЙВ', subtitle: 'РАЗ — ТЫ В БЕЛОМ ПЛАТЬЕ.\nДВА — В МОИХ ОБЪЯТИЯХ.\nТРИ — ВИДЕОФРАГМЕНТ СМОТРИ.', url: '' },
    { title: 'НАЗВАНИЕ', subtitle: 'ПОДРОБНОЕ ОПИСАНИЕ ДАННОГО ВИДЕО', url: '' },
    { title: 'НАЗВАНИЕ', subtitle: 'ПОДРОБНОЕ ОПИСАНИЕ ДАННОГО ВИДЕО', url: '' },
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

const fallbackContact = {
  kicker: '// КОНТАКТЫ',
  title: 'ПРЯМАЯ СВЯЗЬ',
  brandTop: 'АДИС',
  brandBottom: 'МАММО',
  role: 'ВЕДУЩИЙ / КОМИК',
  portrait: '/images/adis-contact.png',
  portraitAlt: 'Адис Маммо',
  materialsLabel: 'МАТЕРИАЛЫ ДЛЯ ОРГАНИЗАТОРОВ',
  materialsHref: '#',
  copyright: '© 2026',
  developmentLabel: 'РАЗРАБОТКА САЙТА',
  developmentHref: '#',
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
  desktop: { cardWidth: 280, gap: 24, paddingTop: 28, paddingBottom: 40, fade: 1, speed: 48 },
  tablet: { cardWidth: 240, gap: 20, paddingTop: 24, paddingBottom: 34, fade: 1, speed: 44 },
  mobile: { cardWidth: 184, gap: 14, paddingTop: 18, paddingBottom: 26, fade: 2, speed: 38 },
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

const visibilityControls = [
  { key: 'about', label: 'Об Адисе' },
  { key: 'video', label: 'Видео' },
  { key: 'ticker', label: 'Бегущая строка' },
  { key: 'selected', label: 'Имена и события' },
  { key: 'gallery', label: 'Фото' },
]

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

const previewDevices = [
  { id: 'desktop', label: 'Компьютер', width: 1440, height: 900 },
  { id: 'tablet', label: 'iPad', width: 1024, height: 1366 },
  { id: 'mobile', label: 'iPhone', width: 428, height: 926 },
]

const heroLayoutControls = [
  { key: 'redHeight', label: 'Высота красного поля', min: 240, max: 720, suffix: 'px' },
  { key: 'sideGutter', label: 'Единый отступ сайта по бокам', min: 12, max: 100, suffix: 'px' },
  { key: 'copyTop', label: 'Имя выше / ниже', min: 20, max: 110, suffix: 'px' },
  { key: 'titleSize', label: 'Размер имени', min: 96, max: 240, suffix: 'px' },
  { key: 'titleLineHeight', label: 'Расстояние между строками имени', min: 70, max: 96, suffix: '%' },
  { key: 'roleSize', label: 'Размер подписи', min: 16, max: 40, suffix: 'px' },
  { key: 'roleGap', label: 'Расстояние до подписи', min: 0, max: 40, suffix: 'px' },
  { key: 'portraitHeight', label: 'Размер портрета', min: 70, max: 150, suffix: '%' },
  { key: 'portraitMaxWidth', label: 'Допустимая ширина портрета', min: 60, max: 180, suffix: '%' },
  { key: 'portraitX', label: 'Портрет левее / правее', min: -220, max: 180, suffix: 'px' },
  { key: 'portraitY', label: 'Портрет выше / ниже', min: -160, max: 180, suffix: 'px' },
]

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

function FormatLine({ formats, className = '', activeLabel = '' }) {
  const contextKey = activeLabel || 'formats'
  return (
    <div className={`format-line${activeLabel ? ' header-context' : ''}${className ? ` ${className}` : ''}`} aria-label={activeLabel ? `Текущий раздел: ${activeLabel}` : 'Форматы работы'} aria-live="polite">
      <div className={`format-line-track${activeLabel ? ' header-context-track' : ''}`} key={contextKey}>
        {activeLabel
          ? <span>{activeLabel}</span>
          : formats.map((format, index) => (
            <React.Fragment key={`${format}-${index}`}>
              {index > 0 && <span className="format-divider" aria-hidden="true">/</span>}
              <span>{format}</span>
            </React.Fragment>
          ))}
      </div>
    </div>
  )
}

function SiteHeader({ content = fallbackHeader, preview = false }) {
  const [open, setOpen] = useState(false)
  const [activeMenuIndex, setActiveMenuIndex] = useState(0)
  const [activeSectionLabel, setActiveSectionLabel] = useState('')
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
    if (!preview) return undefined
    const receivePreviewMenu = (event) => {
      if (event.origin === window.location.origin && event.data?.type === 'adis-preview-menu') setOpen(Boolean(event.data.open))
    }
    window.addEventListener('message', receivePreviewMenu)
    return () => window.removeEventListener('message', receivePreviewMenu)
  }, [preview])

  useEffect(() => {
    let frame = 0
    const updateHeaderContext = () => {
      frame = 0
      const viewportHeight = window.innerHeight || 1
      const marker = (document.querySelector('.site-header')?.getBoundingClientRect().bottom || 80) + 24
      let nextLabel = ''
      document.querySelectorAll('[data-header-label]').forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) nextLabel = section.dataset.headerLabel || ''
      })
      setActiveSectionLabel((current) => current === nextLabel ? current : nextLabel)

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
      <header className={`site-header${preview ? ' site-header-preview' : ''}`}>
        <button className="brand brand-button" type="button" onClick={() => followLink('#top')}>{content.brand}</button>
        <FormatLine formats={content.formats} activeLabel={activeSectionLabel} />
        <div className="header-actions">
          <button className="contact-button" type="button" onClick={() => followLink(content.contactHref)}>{content.contactLabel}</button>
          <button ref={openButtonRef} className="menu-button" type="button" aria-label="Открыть меню" aria-expanded={open} aria-controls="site-menu-dialog" onClick={openMenu}><DotsIcon /></button>
        </div>
        <span className="header-scroll-progress" ref={progressRef} aria-hidden="true" />
      </header>

      <aside ref={overlayRef} id="site-menu-dialog" className={`menu-overlay${preview ? ' menu-overlay-preview' : ''}`} role="dialog" aria-modal="true" aria-label="Меню сайта" aria-hidden={!open}>
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
            <img src="/images/adis-menu.webp" alt="" />
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
      <img className="hero-portrait" src={hero.portrait.url} alt={hero.portrait.alt || 'Адис Маммо'} />
    </section>
  )
}

function AboutSection({ content = fallbackAbout }) {
  const about = { ...fallbackAbout, ...(content || {}) }
  return (
    <section className="about-section" id="about" aria-labelledby="about-title" data-header-label={about.kicker}>
      <div className="about-column editorial-reveal editorial-reveal-no-line" data-editorial-reveal>
        <p className="about-kicker editorial-reveal-kicker">{about.kicker}</p>
        <div className="about-media editorial-reveal-media">
          <img src={about.image} alt={about.imageAlt || 'Портрет Адиса Маммо'} />
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
      <path d="M7 4.8 19 12 7 19.2Z" />
    </svg>
  )
}

function getKinescopePoster(url) {
  const videoId = String(url || '').match(/kinescope\.io\/embed\/([a-f0-9-]+)/i)?.[1]
  return videoId ? `https://kinescope.io/${videoId}/poster/lg.jpg` : ''
}

function VideoSection({ content = fallbackVideo }) {
  const video = normalizeVideo(content)
  const [playingIndex, setPlayingIndex] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [playerRect, setPlayerRect] = useState(null)
  const videoSlotsRef = useRef([])
  const frameRequestRef = useRef(null)
  const expandButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const playingVideo = playingIndex === null ? null : video.items[playingIndex]

  useEffect(() => {
    if (playingIndex === null || isExpanded) return undefined
    const syncPlayerRect = () => {
      if (frameRequestRef.current) window.cancelAnimationFrame(frameRequestRef.current)
      frameRequestRef.current = window.requestAnimationFrame(() => {
        const slot = videoSlotsRef.current[playingIndex]
        if (!slot) return
        const rect = slot.getBoundingClientRect()
        setPlayerRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
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
      if (event.key !== 'Escape') return
      event.preventDefault()
      setIsExpanded(false)
      window.requestAnimationFrame(() => expandButtonRef.current?.focus())
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
                    <img className="video-poster" src={getKinescopePoster(item.url)} alt="" loading="lazy" />
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
  const visibleLogos = ticker.logos
    .filter((logo) => logo.enabled)
    .map((logo) => ({ ...brandLogos.find((asset) => asset.name === logo.name), ...logo }))
    .filter((logo) => logo.src)
  if (!visibleLogos.length) return null
  return (
    <section className="brand-ticker" id="brands" aria-label="Бренды, для которых Адис проводил мероприятия" style={getTickerStyle(ticker)}>
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
    return <svg className="editorial-action-arrow" viewBox="0 0 36 20" aria-hidden="true"><path d="M35 10H3M11 2 3 10l8 8" vectorEffect="non-scaling-stroke" /></svg>
  }
  return <svg className="editorial-action-arrow" viewBox="0 0 36 20" aria-hidden="true"><path d="M1 10h32M25 2l8 8-8 8" vectorEffect="non-scaling-stroke" /></svg>
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
                ? <img src={item.image} alt={item.imageAlt || `Адис Маммо — фото ${index + 1}`} loading="lazy" />
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
          <button className="gallery-lightbox-close" type="button" aria-label="Закрыть фотографию" ref={closeButtonRef} onClick={closeLightbox}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" /></svg>
          </button>
          <button className="gallery-lightbox-nav gallery-lightbox-prev" type="button" aria-label="Предыдущая фотография" onClick={showPrevious}>
            <EditorialArrow direction="left" />
          </button>
          <figure className="gallery-lightbox-media">
            <img src={activeItem.image} alt={activeItem.imageAlt || `Адис Маммо — фото ${activePhoto.index + 1}`} />
            <figcaption>{String(activePhoto.index + 1).padStart(2, '0')} / {String(gallery.items.length).padStart(2, '0')}</figcaption>
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
            {contact.portrait ? <img src={contact.portrait} alt={contact.portraitAlt} loading="lazy" /> : <span>ФОТО</span>}
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

function PublicSite() {
  const [content, setContent] = useState({ header: fallbackHeader, hero: fallbackHero, about: fallbackAbout, video: fallbackVideo, ticker: fallbackTicker, selected: fallbackSelected, gallery: fallbackGallery, contact: fallbackContact, visibility: fallbackVisibility })
  const isAdminPreview = new URLSearchParams(window.location.search).get('preview') === 'admin'
  useEffect(() => {
    if (isAdminPreview) {
      const receivePreview = (event) => {
        if (event.origin !== window.location.origin || event.data?.type !== 'adis-preview-content') return
        setContent({ header: event.data.content.header, hero: normalizeHero(event.data.content.hero), about: event.data.content.about || fallbackAbout, video: normalizeVideo(event.data.content.video), ticker: normalizeTicker(event.data.content.ticker), selected: normalizeSelected(event.data.content.selected), gallery: normalizeGallery(event.data.content.gallery), contact: normalizeContact(event.data.content.contact), visibility: normalizeVisibility(event.data.content.visibility) })
      }
      window.addEventListener('message', receivePreview)
      window.parent.postMessage({ type: 'adis-preview-ready' }, window.location.origin)
      return () => window.removeEventListener('message', receivePreview)
    }
    fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject()).then((nextContent) => setContent({ header: nextContent.header || fallbackHeader, hero: normalizeHero(nextContent.hero), about: nextContent.about || fallbackAbout, video: normalizeVideo(nextContent.video), ticker: normalizeTicker(nextContent.ticker), selected: normalizeSelected(nextContent.selected), gallery: normalizeGallery(nextContent.gallery), contact: normalizeContact(nextContent.contact), visibility: normalizeVisibility(nextContent.visibility) })).catch(() => {})
  }, [isAdminPreview])

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

  const visibility = normalizeVisibility(content.visibility)
  const visibleHeader = filterHeaderByVisibility(content.header, visibility)

  return (
    <main className="site-shell" id="top" style={getHeroStyle(content.hero)}>
      <SiteHeader content={visibleHeader} preview={isAdminPreview} />
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

function TextField({ label, value, onChange, placeholder }) {
  return <label className="admin-field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>
}

function TextAreaField({ label, value, onChange, rows = 5 }) {
  return <label className="admin-field"><span>{label}</span><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>
}

function NumberField({ label, value, onChange, min, max, suffix }) {
  const applyValue = (nextValue) => onChange(Math.min(Number(max), Math.max(Number(min), Number(nextValue))))
  return (
    <div className="admin-field admin-number-field">
      <span>{label}</span>
      <span className="admin-number-control">
        <input aria-label={`${label}: ползунок`} type="range" value={value} min={min} max={max} onChange={(event) => applyValue(event.target.value)} />
        <span className="admin-number-input"><input aria-label={`${label}: точное значение`} type="number" value={value} min={min} max={max} onChange={(event) => applyValue(event.target.value)} /><small>{suffix}</small></span>
      </span>
    </div>
  )
}

function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    if (!response.ok) return setError('Неверный пароль')
    onSuccess()
  }
  return (
    <main className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <span className="admin-kicker">АДИС МАММО / ADMIN</span>
        <h1>Вход в админку</h1>
        <TextField label="Пароль" value={password} onChange={setPassword} placeholder="Введи пароль" />
        {error && <p className="admin-error">{error}</p>}
        <button className="admin-primary" type="submit">Войти</button>
      </form>
    </main>
  )
}

function DeviceIcon({ device }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {device === 'desktop' && <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></>}
      {device === 'tablet' && <><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M11 18.5h2" /></>}
      {device === 'mobile' && <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M10.5 5h3M11 19h2" /></>}
    </svg>
  )
}

function AdminDevicePreview({ content, deviceId, onDeviceChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [zoomMode, setZoomMode] = useState('actual')
  const [scale, setScale] = useState(0.6)
  const stageRef = useRef(null)
  const iframeRef = useRef(null)
  const device = previewDevices.find((item) => item.id === deviceId) || previewDevices[0]

  const sendPreview = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'adis-preview-content', content }, window.location.origin)
    iframeRef.current?.contentWindow?.postMessage({ type: 'adis-preview-menu', open: menuOpen }, window.location.origin)
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const resize = () => {
      const availableWidth = Math.max(280, stage.clientWidth - 32)
      if (zoomMode === 'actual') {
        setScale(1)
        return
      }
      setScale(Math.min(1, availableWidth / device.width, 620 / device.height))
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [device.width, device.height, zoomMode])

  useEffect(() => { sendPreview() }, [content, deviceId, menuOpen])

  useEffect(() => {
    const receiveReady = (event) => {
      if (event.origin === window.location.origin && event.data?.type === 'adis-preview-ready') sendPreview()
    }
    window.addEventListener('message', receiveReady)
    return () => window.removeEventListener('message', receiveReady)
  }, [content, menuOpen])

  return (
    <section className="admin-device-preview" aria-label="Предпросмотр сайта на разных устройствах">
      <div className="admin-preview-toolbar">
        <div><span className="admin-kicker">ЖИВОЙ ПРЕДПРОСМОТР</span><strong>{device.width} × {device.height} · {Math.round(scale * 100)}%</strong></div>
        <div className="admin-preview-controls">
          <div className="admin-device-switcher" role="group" aria-label="Размер устройства">
            {previewDevices.map((item) => (
              <button className={item.id === deviceId ? 'is-active' : ''} type="button" aria-pressed={item.id === deviceId} onClick={() => onDeviceChange(item.id)} key={item.id}>
                <DeviceIcon device={item.id} />
                <span><b>{item.label}</b><small>{item.width} × {item.height}</small></span>
              </button>
            ))}
          </div>
          <div className="admin-preview-zoom" role="group" aria-label="Масштаб предпросмотра">
            <button className={zoomMode === 'fit' ? 'is-active' : ''} type="button" aria-pressed={zoomMode === 'fit'} onClick={() => setZoomMode('fit')}>ВПИСАТЬ</button>
            <button className={zoomMode === 'actual' ? 'is-active' : ''} type="button" aria-pressed={zoomMode === 'actual'} onClick={() => setZoomMode('actual')}>100%</button>
          </div>
          <button className={`admin-preview-menu-toggle${menuOpen ? ' is-active' : ''}`} type="button" aria-pressed={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? 'ЗАКРЫТЬ МЕНЮ' : 'ПОКАЗАТЬ МЕНЮ'}</button>
        </div>
      </div>
      <div className="admin-preview-stage" ref={stageRef}>
        <div className="admin-preview-frame" style={{ width: device.width * scale, height: device.height * scale }}>
          <iframe
            ref={iframeRef}
            src="/?preview=admin"
            title={`Предпросмотр: ${device.label}`}
            style={{ width: device.width, height: device.height, transform: `scale(${scale})` }}
            onLoad={sendPreview}
          />
        </div>
      </div>
    </section>
  )
}

function HeroPortraitField({ portrait, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    if (file.size > 15 * 1024 * 1024) return setError('Файл тяжелее 15 МБ. Выбери фотографию поменьше.')
    setUploading(true)
    try {
      const body = new FormData()
      body.append('portrait', file)
      const response = await fetch('/api/admin/assets/hero', { method: 'POST', body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Не удалось загрузить фото')
      onChange({ ...result.asset, alt: portrait.alt || 'Адис Маммо' })
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="admin-panel admin-photo-panel">
      <div className="admin-panel-heading"><div><span className="admin-kicker">ОБЩЕЕ ДЛЯ ВСЕХ РАЗМЕРОВ</span><h3>Фото первого экрана</h3></div></div>
      <div className="admin-photo-preview"><img src={portrait.url} alt={portrait.alt || 'Адис Маммо'} /></div>
      <div className="admin-photo-meta"><strong>{portrait.originalName || 'Текущее фото'}</strong><span>{portrait.width && portrait.height ? `${portrait.width} × ${portrait.height} px` : 'PNG с прозрачным фоном'}</span></div>
      <input ref={inputRef} className="admin-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} />
      <div className="admin-photo-actions">
        <button className="admin-primary" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? 'Загружаю…' : 'Выбрать фото'}</button>
        <button type="button" disabled={uploading || portrait.url === fallbackHero.portrait.url} onClick={() => onChange(fallbackHero.portrait)}>Вернуть исходное</button>
      </div>
      <p className="admin-note">Лучше всего — PNG или WebP без фона. Максимум 15 МБ.</p>
      {error && <p className="admin-error">{error}</p>}
    </section>
  )
}

function SelectedPhotoField({ item, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    if (file.size > 15 * 1024 * 1024) return setError('Файл тяжелее 15 МБ. Выбери фотографию поменьше.')
    setUploading(true)
    try {
      const body = new FormData()
      body.append('image', file)
      const response = await fetch('/api/admin/assets/selected', { method: 'POST', body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Не удалось загрузить фото')
      onChange({ image: result.asset.url, imageAlt: item.imageAlt || `${item.name} — Адис Маммо` })
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="admin-selected-photo-field">
      <span className="admin-field-label">Фотография</span>
      <div className={`admin-selected-photo-preview${item.image ? ' has-image' : ''}`}>
        {item.image ? <img src={item.image} alt={item.imageAlt || item.name} /> : <span>ФОТО ПОКА НЕТ</span>}
      </div>
      <input ref={inputRef} className="admin-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} />
      <div className="admin-photo-actions">
        <button className="admin-primary" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? 'Загружаю…' : item.image ? 'Заменить фото' : 'Выбрать фото'}</button>
        <button type="button" disabled={uploading || !item.image} onClick={() => onChange({ image: '', imageAlt: '' })}>Убрать</button>
      </div>
      <p className="admin-note">Лучший формат — горизонтальный кадр 2040 × 1500 px. На сайте фотография аккуратно заполняет карточку.</p>
      {error && <p className="admin-error">{error}</p>}
    </div>
  )
}

function GalleryPhotoField({ item, index, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    if (file.size > 15 * 1024 * 1024) return setError('Файл тяжелее 15 МБ. Выбери фотографию поменьше.')
    setUploading(true)
    try {
      const body = new FormData()
      body.append('image', file)
      const response = await fetch('/api/admin/assets/gallery', { method: 'POST', body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Не удалось загрузить фото')
      onChange({ image: result.asset.url, imageAlt: item.imageAlt || `Адис Маммо — фото ${index + 1}` })
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  const slotNames = ['Широкий кадр', 'Левый кадр', 'Правый кадр', 'Широкий кадр', 'Вертикальный кадр', 'Вертикальный кадр', 'Вертикальный кадр', 'Вертикальный кадр']
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading"><div><span className="admin-kicker">ФОТО {String(index + 1).padStart(2, '0')}</span><h3>{slotNames[index]}</h3></div></div>
      <div className={`admin-gallery-photo-preview admin-gallery-photo-${index + 1}${item.image ? ' has-image' : ''}`}>
        {item.image ? <img src={item.image} alt={item.imageAlt || `Фото ${index + 1}`} /> : <span>ФОТО ПОКА НЕТ</span>}
      </div>
      <input ref={inputRef} className="admin-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} />
      <div className="admin-photo-actions">
        <button className="admin-primary" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? 'Загружаю…' : item.image ? 'Заменить фото' : 'Выбрать фото'}</button>
        <button type="button" disabled={uploading || !item.image} onClick={() => onChange({ image: '', imageAlt: '' })}>Убрать</button>
      </div>
      <TextField label="Описание фотографии" value={item.imageAlt} onChange={(value) => onChange({ imageAlt: value })} />
      {error && <p className="admin-error">{error}</p>}
    </section>
  )
}

function AdminApp() {
  const [authenticated, setAuthenticated] = useState(null)
  const [header, setHeader] = useState(fallbackHeader)
  const [hero, setHero] = useState(fallbackHero)
  const [about, setAbout] = useState(fallbackAbout)
  const [video, setVideo] = useState(fallbackVideo)
  const [ticker, setTicker] = useState(fallbackTicker)
  const [selected, setSelected] = useState(fallbackSelected)
  const [gallery, setGallery] = useState(fallbackGallery)
  const [contact, setContact] = useState(fallbackContact)
  const [visibility, setVisibility] = useState(fallbackVisibility)
  const [activeSection, setActiveSection] = useState('header')
  const [deviceId, setDeviceId] = useState('desktop')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const response = await fetch('/api/admin/content')
    if (response.status === 401) return setAuthenticated(false)
    const content = await response.json()
    setHeader(content.draft.header)
    setHero(normalizeHero(content.draft.hero))
    setAbout({ ...fallbackAbout, ...(content.draft.about || {}) })
    setVideo(normalizeVideo(content.draft.video))
    setTicker(normalizeTicker(content.draft.ticker))
    setSelected(normalizeSelected(content.draft.selected))
    setGallery(normalizeGallery(content.draft.gallery))
    setContact(normalizeContact(content.draft.contact))
    setVisibility(normalizeVisibility(content.draft.visibility))
    setAuthenticated(true)
  }

  useEffect(() => { load() }, [])

  const changeFormat = (index, value) => setHeader((current) => ({ ...current, formats: current.formats.map((item, itemIndex) => itemIndex === index ? value : item) }))
  const changeMenu = (index, key, value) => setHeader((current) => ({ ...current, menu: current.menu.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))
  const changeSocial = (index, key, value) => setHeader((current) => ({ ...current, socials: (current.socials || fallbackHeader.socials).map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))
  const updateHero = (changes) => {
    setHero((current) => ({ ...current, ...changes }))
    setStatus('Есть несохранённые изменения')
  }
  const updateAbout = (changes) => {
    setAbout((current) => ({ ...current, ...changes }))
    setStatus('Есть несохранённые изменения')
  }
  const updateVideo = (changes) => {
    setVideo((current) => ({ ...current, ...changes }))
    setStatus('Есть несохранённые изменения')
  }
  const updateTicker = (changes) => {
    setTicker((current) => ({ ...current, ...changes }))
    setStatus('Есть несохранённые изменения')
  }
  const updateSelected = (changes) => {
    setSelected((current) => ({ ...current, ...changes }))
    setStatus('Есть несохранённые изменения')
  }
  const updateGallery = (changes) => {
    setGallery((current) => ({ ...current, ...changes }))
    setStatus('Есть несохранённые изменения')
  }
  const updateContact = (changes) => {
    setContact((current) => ({ ...current, ...changes }))
    setStatus('Есть несохранённые изменения')
  }
  const updateVisibility = (key, visible) => {
    setVisibility((current) => ({ ...current, [key]: visible }))
    setStatus('Есть несохранённые изменения')
  }
  const changeSelectedItem = (index, key, value) => {
    setSelected((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }))
    setStatus('Есть несохранённые изменения')
  }
  const changeGalleryItem = (index, changes) => {
    setGallery((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item),
    }))
    setStatus('Есть несохранённые изменения')
  }
  const changeTickerLayout = (key, value) => {
    setTicker((current) => ({
      ...current,
      layouts: { ...current.layouts, [deviceId]: { ...current.layouts[deviceId], [key]: value } },
    }))
    setStatus('Есть несохранённые изменения')
  }
  const changeTickerLogo = (index, changes) => {
    setTicker((current) => ({
      ...current,
      logos: current.logos.map((logo, logoIndex) => logoIndex === index ? { ...logo, ...changes } : logo),
    }))
    setStatus('Есть несохранённые изменения')
  }
  const moveTickerLogo = (index, direction) => {
    setTicker((current) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.logos.length) return current
      const logos = [...current.logos]
      ;[logos[index], logos[nextIndex]] = [logos[nextIndex], logos[index]]
      return { ...current, logos }
    })
    setStatus('Есть несохранённые изменения')
  }
  const changeVideoItem = (index, key, value) => {
    setVideo((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }))
    setStatus('Есть несохранённые изменения')
  }
  const changeHeroLayout = (key, value) => {
    setHero((current) => ({
      ...current,
      layouts: { ...current.layouts, [deviceId]: { ...current.layouts[deviceId], [key]: value } },
    }))
    setStatus('Есть несохранённые изменения')
  }
  const copyDesktopLayout = () => {
    setHero((current) => ({ ...current, layouts: { ...current.layouts, [deviceId]: { ...current.layouts.desktop } } }))
    setStatus(`Настройки ПК скопированы в ${previewDevices.find((item) => item.id === deviceId)?.label}`)
  }
  const resetCurrentLayout = () => {
    setHero((current) => ({ ...current, layouts: { ...current.layouts, [deviceId]: { ...heroLayoutDefaults[deviceId] } } }))
    setStatus(`Стандартные настройки для ${previewDevices.find((item) => item.id === deviceId)?.label} восстановлены`)
  }
  const saveDraft = async () => {
    setSaving(true)
    setStatus('Сохраняю…')
    try {
      const response = await fetch('/api/admin/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ header, hero, about, video, ticker, selected, gallery, contact, visibility }) })
      setStatus(response.ok ? 'Черновик сохранён' : 'Не удалось сохранить')
      return response.ok
    } catch {
      setStatus('Не удалось сохранить')
      return false
    } finally {
      setSaving(false)
    }
  }
  const publish = async () => {
    setSaving(true)
    setStatus('Публикую…')
    try {
      const response = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ header, hero, about, video, ticker, selected, gallery, contact, visibility }) })
      setStatus(response.ok ? 'Опубликовано на сайте' : 'Не удалось опубликовать')
    } catch {
      setStatus('Не удалось опубликовать')
    } finally {
      setSaving(false)
    }
  }

  if (authenticated === null) return <div className="admin-loading">Загружаю…</div>
  if (!authenticated) return <Login onSuccess={load} />
  const selectedDevice = previewDevices.find((item) => item.id === deviceId) || previewDevices[0]
  const currentLayout = hero.layouts[deviceId]
  const sectionMeta = {
    header: { number: '01', title: 'Верх сайта', description: 'Название, направления работы, кнопка «Связаться» и раскрывающееся меню.' },
    hero: { number: '02', title: 'Первый экран', description: 'Имя, подпись, портрет и красный фон.' },
    about: { number: '03', title: 'Об Адисе', description: 'Короткое представление, главные регалии и место для портрета.' },
    video: { number: '04', title: 'Видео', description: 'Шоурил и три направления работы. Ролики можно подключить позже.' },
    ticker: { number: '05', title: 'Бегущая строка', description: 'Логотипы брендов, их порядок, размер и движение.' },
    selected: { number: '06', title: 'Имена и события', description: 'Частные события, дни рождения и совместные выходы на сцену.' },
    gallery: { number: '07', title: 'Галерея', description: 'Журнальная сетка фотографий. Сами кадры добавим позже.' },
    contact: { number: '08', title: 'Контакты', description: 'Прямая связь, соцсети, материалы для организаторов и нижняя строка сайта.' },
  }[activeSection]

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div><span className="admin-kicker">АДИС МАММО</span><h1>Управление сайтом</h1></div>
        <nav>
          <button className={activeSection === 'header' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('header'); setStatus('') }}><span>01</span> Верх сайта</button>
          <button className={activeSection === 'hero' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('hero'); setStatus('') }}><span>02</span> Первый экран</button>
          <button className={activeSection === 'about' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('about'); setStatus('') }}><span>03</span> Об Адисе</button>
          <button className={activeSection === 'video' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('video'); setStatus('') }}><span>04</span> Видео</button>
          <button className={activeSection === 'ticker' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('ticker'); setStatus('') }}><span>05</span> Бегущая строка</button>
          <button className={activeSection === 'selected' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('selected'); setStatus('') }}><span>06</span> Имена и события{!visibility.selected && <small>СКРЫТ</small>}</button>
          <button className={activeSection === 'gallery' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('gallery'); setStatus('') }}><span>07</span> Галерея</button>
          <button className={activeSection === 'contact' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('contact'); setStatus('') }}><span>08</span> Контакты</button>
        </nav>
        <span className="admin-sidebar-note">Собираем сайт по одному блоку.</span>
      </aside>

      <section className="admin-workspace">
        <div className="admin-toolbar"><div><span className="admin-kicker">БЛОК {sectionMeta.number}</span><h2>{sectionMeta.title}</h2><p className="admin-section-description">{sectionMeta.description}</p></div><div className="admin-toolbar-actions"><span role="status" aria-live="polite">{status}</span><button type="button" disabled={saving} onClick={saveDraft}>Сохранить черновик</button><button className="admin-primary" type="button" disabled={saving} onClick={publish}>Опубликовать</button></div></div>

        <AdminDevicePreview content={{ header, hero, about, video, ticker, selected, gallery, contact, visibility }} deviceId={deviceId} onDeviceChange={setDeviceId} />

        {activeSection === 'header' ? <div className="admin-form-grid">
          <section className="admin-panel admin-panel-visibility">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ПУБЛИЧНЫЙ САЙТ</span><h3>Видимость блоков</h3></div></div>
            <p className="admin-panel-intro">Скрытый блок остаётся в админке со всем наполнением, но не показывается посетителям и исчезает из меню.</p>
            <div className="admin-visibility-list">
              {visibilityControls.map((item) => (
                <div className="admin-visibility-row" key={item.key}>
                  <strong>{item.label}</strong>
                  <button className={`admin-visibility-toggle${visibility[item.key] ? ' is-active' : ''}`} type="button" role="switch" aria-checked={visibility[item.key]} onClick={() => updateVisibility(item.key, !visibility[item.key])}>
                    {visibility[item.key] ? 'ПОКАЗАН' : 'СКРЫТ'}
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="admin-panel">
            <h3>Основная строка</h3>
            <TextField label="Надпись слева" value={header.brand} onChange={(value) => setHeader({ ...header, brand: value })} />
            {header.formats.map((format, index) => <TextField key={index} label={`Направление ${index + 1}`} value={format} onChange={(value) => changeFormat(index, value)} />)}
            <TextField label="Текст кнопки" value={header.contactLabel} onChange={(value) => setHeader({ ...header, contactLabel: value })} />
            <TextField label="Ссылка кнопки" value={header.contactHref} onChange={(value) => setHeader({ ...header, contactHref: value })} />
          </section>
          <section className="admin-panel">
            <h3>Пункты меню</h3>
            {header.menu.map((item, index) => <div className="admin-menu-row" key={index}><TextField label={`Пункт ${index + 1}`} value={item.label} onChange={(value) => changeMenu(index, 'label', value)} /><TextField label="Ссылка" value={item.href} onChange={(value) => changeMenu(index, 'href', value)} /></div>)}
          </section>
          <section className="admin-panel admin-panel-social">
            <h3>Соцсети внизу меню</h3>
            {(header.socials || fallbackHeader.socials).map((item, index) => <div className="admin-menu-row" key={index}><TextField label={`Соцсеть ${index + 1}`} value={item.label} onChange={(value) => changeSocial(index, 'label', value)} /><TextField label="Ссылка" value={item.href} onChange={(value) => changeSocial(index, 'href', value)} /></div>)}
          </section>
        </div> : activeSection === 'hero' ? <div className="admin-form-grid admin-hero-grid">
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ОБЩЕЕ ДЛЯ ВСЕХ РАЗМЕРОВ</span><h3>Текст и цвет</h3></div></div>
            <TextField label="Первая строка имени" value={hero.nameTop} onChange={(value) => updateHero({ nameTop: value })} />
            <TextField label="Вторая строка имени" value={hero.nameBottom} onChange={(value) => updateHero({ nameBottom: value })} />
            <TextField label="Подпись" value={hero.role} onChange={(value) => updateHero({ role: value })} />
            <label className="admin-field admin-color-field"><span>Цвет фона</span><span><input type="color" value={hero.accent} onChange={(event) => updateHero({ accent: event.target.value.toUpperCase() })} /><input value={hero.accent} onChange={(event) => updateHero({ accent: event.target.value })} /></span></label>
          </section>

          <HeroPortraitField portrait={hero.portrait} onChange={(portrait) => updateHero({ portrait })} />

          <section className="admin-panel admin-layout-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-kicker">ОТДЕЛЬНО ДЛЯ КАЖДОГО РАЗМЕРА</span><h3>Расположение — {selectedDevice.label}</h3></div>
              <span className="admin-device-badge"><DeviceIcon device={deviceId} />{selectedDevice.width} × {selectedDevice.height}</span>
            </div>
            <p className="admin-panel-intro">Сейчас меняется только версия для устройства, выбранного в предпросмотре выше.</p>
            <div className="admin-layout-actions">
              {deviceId !== 'desktop' && <button type="button" onClick={copyDesktopLayout}>Скопировать настройки с ПК</button>}
              <button type="button" onClick={resetCurrentLayout}>Вернуть стандартные</button>
            </div>
            <div className="admin-precise-grid">
              {heroLayoutControls.map((control) => (
                <NumberField
                  key={control.key}
                  label={control.label}
                  value={currentLayout[control.key]}
                  min={control.min}
                  max={control.max}
                  suffix={control.suffix}
                  onChange={(value) => changeHeroLayout(control.key, value)}
                />
              ))}
            </div>
          </section>

          <section className="admin-panel admin-motion-panel">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ДВИЖЕНИЕ</span><h3>Появление первого экрана</h3></div></div>
            <div className="admin-choice-row" role="group" aria-label="Анимация первого экрана">
              <button className={hero.motion === 'none' ? 'is-active' : ''} type="button" onClick={() => updateHero({ motion: 'none' })}>Без анимации</button>
              <button className={hero.motion === 'text' ? 'is-active' : ''} type="button" onClick={() => updateHero({ motion: 'text' })}>Только текст</button>
            </div>
            <p className="admin-note">Портрет и красный фон всегда остаются на своих местах. Они больше не выдвигаются и не перекрывают друг друга.</p>
          </section>
        </div> : activeSection === 'about' ? <div className="admin-form-grid admin-about-grid">
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">СОДЕРЖАНИЕ БЛОКА</span><h3>Текст «Об Адисе»</h3></div></div>
            <TextField label="Метка над фотографией" value={about.kicker} onChange={(value) => updateAbout({ kicker: value })} />
            <TextAreaField label="Главное представление" rows={4} value={about.lead} onChange={(value) => updateAbout({ lead: value })} />
            <TextAreaField label="Регалии и проекты" rows={7} value={about.secondary} onChange={(value) => updateAbout({ secondary: value })} />
          </section>
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">МЕДИА</span><h3>Портрет</h3></div></div>
            <p className="admin-panel-intro">Пока оставляем аккуратную тёмную заглушку. Когда выберем фотографию для этого блока, добавим её отдельной кнопкой и настроим кадрирование.</p>
            <TextField label="Надпись внутри заглушки" value={about.mediaLabel} onChange={(value) => updateAbout({ mediaLabel: value })} />
          </section>
        </div> : activeSection === 'video' ? <div className="admin-form-grid admin-video-grid">
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ЗАГОЛОВОК БЛОКА</span><h3>Видео</h3></div></div>
            <TextField label="Метка" value={video.kicker} onChange={(value) => updateVideo({ kicker: value })} />
            <TextField label="Большой заголовок" value={video.title} onChange={(value) => updateVideo({ title: value })} />
            <TextField label="Надпись в конце блока" value={video.moreLabel} onChange={(value) => updateVideo({ moreLabel: value })} />
            <TextField label="Ссылка для «Смотреть ещё»" value={video.moreHref} placeholder="https://" onChange={(value) => updateVideo({ moreHref: value })} />
            <p className="admin-note">Пока ссылка пустая, надпись остаётся спокойной редакционной заглушкой и не притворяется кнопкой.</p>
          </section>
          {video.items.map((item, index) => (
            <section className="admin-panel" key={`${item.title}-${index}`}>
              <div className="admin-panel-heading"><div><span className="admin-kicker">ВИДЕОМЕСТО {String(index + 1).padStart(2, '0')}</span><h3>{index === 0 ? 'Главный шоурил' : item.title}</h3></div></div>
              <TextField label="Название" value={item.title} onChange={(value) => changeVideoItem(index, 'title', value)} />
              <TextAreaField label="Короткая подпись" rows={3} value={item.subtitle} onChange={(value) => changeVideoItem(index, 'subtitle', value)} />
              <TextField label="Ссылка на видео — можно добавить позже" value={item.url} placeholder="https://" onChange={(value) => changeVideoItem(index, 'url', value)} />
              <p className="admin-note">Пока ссылка пустая, на сайте остаётся аккуратная заглушка без перехода.</p>
            </section>
          ))}
        </div> : activeSection === 'ticker' ? <div className="admin-form-grid admin-ticker-grid">
          <section className="admin-panel admin-layout-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-kicker">МАСШТАБ И ДВИЖЕНИЕ</span><h3>Лента — {selectedDevice.label}</h3></div>
              <span className="admin-device-badge"><DeviceIcon device={deviceId} />{selectedDevice.width} × {selectedDevice.height}</span>
            </div>
            <p className="admin-panel-intro">Переключи устройство в предпросмотре: размеры ленты настраиваются отдельно для компьютера, iPad и iPhone.</p>
            <div className="admin-precise-grid">
              <NumberField label="Максимальная ширина одной карточки" value={ticker.layouts[deviceId].cardWidth} min={180} max={420} suffix="px" onChange={(value) => changeTickerLayout('cardWidth', value)} />
              <NumberField label="Расстояние между карточками" value={ticker.layouts[deviceId].gap} min={8} max={48} suffix="px" onChange={(value) => changeTickerLayout('gap', value)} />
              <NumberField label="Отступ от блока с видео" value={ticker.layouts[deviceId].paddingTop} min={0} max={100} suffix="px" onChange={(value) => changeTickerLayout('paddingTop', value)} />
              <NumberField label="Отступ после ленты" value={ticker.layouts[deviceId].paddingBottom} min={0} max={100} suffix="px" onChange={(value) => changeTickerLayout('paddingBottom', value)} />
              <NumberField label="Мягкость краёв" value={ticker.layouts[deviceId].fade} min={0} max={14} suffix="%" onChange={(value) => changeTickerLayout('fade', value)} />
              <NumberField label="Скорость полного прохода" value={ticker.layouts[deviceId].speed} min={20} max={90} suffix="сек" onChange={(value) => changeTickerLayout('speed', value)} />
            </div>
            <label className="admin-field admin-color-field"><span>Цвет карточек</span><span><input type="color" value={ticker.cardColor} onChange={(event) => updateTicker({ cardColor: event.target.value.toUpperCase() })} /><input value={ticker.cardColor} onChange={(event) => updateTicker({ cardColor: event.target.value })} /></span></label>
          </section>
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">СОСТАВ ЛЕНТЫ</span><h3>Логотипы и порядок</h3></div></div>
            <p className="admin-panel-intro">Отключай лишние логотипы, меняй их порядок и подравнивай оптический размер. Исходные SVG остаются без потери качества.</p>
            <div className="admin-logo-list">
              {ticker.logos.map((logo, index) => {
                const asset = brandLogos.find((item) => item.name === logo.name)
                return (
                  <div className="admin-logo-row" key={logo.name}>
                    <div className="admin-logo-preview"><img src={asset?.src} alt="" /></div>
                    <strong>{logo.name}</strong>
                    <label className="admin-logo-toggle"><input type="checkbox" checked={logo.enabled} onChange={(event) => changeTickerLogo(index, { enabled: event.target.checked })} /><span>Показывать</span></label>
                    <div className="admin-logo-scale"><span>Размер</span><input aria-label={`Размер логотипа ${logo.name}`} type="number" min="70" max="130" value={logo.scale} onChange={(event) => changeTickerLogo(index, { scale: Math.min(130, Math.max(70, Number(event.target.value))) })} /><small>%</small></div>
                    <div className="admin-logo-order">
                      <button type="button" aria-label={`Поднять ${logo.name}`} disabled={index === 0} onClick={() => moveTickerLogo(index, -1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 14 5-5 5 5" /></svg></button>
                      <button type="button" aria-label={`Опустить ${logo.name}`} disabled={index === ticker.logos.length - 1} onClick={() => moveTickerLogo(index, 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div> : activeSection === 'selected' ? <div className="admin-form-grid admin-selected-grid">
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ЗАГОЛОВОК БЛОКА</span><h3>Имена и события</h3></div></div>
            <TextField label="Метка" value={selected.kicker} onChange={(value) => updateSelected({ kicker: value })} />
            <TextField label="Большой заголовок" value={selected.title} onChange={(value) => updateSelected({ title: value })} />
            <TextField label="Надпись в конце блока" value={selected.moreLabel} onChange={(value) => updateSelected({ moreLabel: value })} />
            <TextField label="Ссылка для «Смотреть ещё»" value={selected.moreHref} placeholder="https://" onChange={(value) => updateSelected({ moreHref: value })} />
          </section>
          {selected.items.map((item, index) => (
            <section className="admin-panel" key={`${item.name}-${index}`}>
              <div className="admin-panel-heading"><div><span className="admin-kicker">ПРОЕКТ {String(index + 1).padStart(2, '0')}</span><h3>{item.name}</h3></div></div>
              <TextField label="Название" value={item.name} onChange={(value) => changeSelectedItem(index, 'name', value)} />
              <TextField label="Подводка — необязательно" value={item.type} onChange={(value) => changeSelectedItem(index, 'type', value)} />
              <TextAreaField label="Имена или короткое описание" rows={6} value={item.description} onChange={(value) => changeSelectedItem(index, 'description', value)} />
              <SelectedPhotoField item={item} onChange={(asset) => {
                setSelected((current) => ({
                  ...current,
                  items: current.items.map((currentItem, itemIndex) => itemIndex === index ? { ...currentItem, ...asset } : currentItem),
                }))
                setStatus('Есть несохранённые изменения')
              }} />
            </section>
          ))}
        </div> : activeSection === 'gallery' ? <div className="admin-form-grid admin-gallery-grid">
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ЗАГОЛОВОК БЛОКА</span><h3>Галерея</h3></div></div>
            <TextField label="Метка" value={gallery.kicker} onChange={(value) => updateGallery({ kicker: value })} />
            <TextField label="Большой заголовок" value={gallery.title} onChange={(value) => updateGallery({ title: value })} />
            <TextField label="Надпись в конце блока" value={gallery.moreLabel} onChange={(value) => updateGallery({ moreLabel: value })} />
            <TextField label="Ссылка для «Смотреть ещё»" value={gallery.moreHref} placeholder="https://" onChange={(value) => updateGallery({ moreHref: value })} />
          </section>
          {gallery.items.map((item, index) => <GalleryPhotoField item={item} index={index} key={index} onChange={(changes) => changeGalleryItem(index, changes)} />)}
        </div> : <div className="admin-form-grid admin-contact-grid">
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ЗАГОЛОВОК БЛОКА</span><h3>Контакты</h3></div></div>
            <TextField label="Метка" value={contact.kicker} onChange={(value) => updateContact({ kicker: value })} />
            <TextField label="Большой заголовок" value={contact.title} onChange={(value) => updateContact({ title: value })} />
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ПОДПИСЬ</span><h3>Имя и роль</h3></div></div>
            <TextField label="Первая строка" value={contact.brandTop} onChange={(value) => updateContact({ brandTop: value })} />
            <TextField label="Вторая строка" value={contact.brandBottom} onChange={(value) => updateContact({ brandBottom: value })} />
            <TextField label="Подпись" value={contact.role} onChange={(value) => updateContact({ role: value })} />
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span className="admin-kicker">ОРГАНИЗАТОРАМ</span><h3>Кнопка материалов</h3></div></div>
            <TextField label="Текст кнопки" value={contact.materialsLabel} onChange={(value) => updateContact({ materialsLabel: value })} />
            <TextField label="Ссылка — добавим позже" value={contact.materialsHref} onChange={(value) => updateContact({ materialsHref: value })} />
            <p className="admin-panel-intro">Портрет справа пока оставляем заглушкой. Соцсети берутся из раздела «Верх сайта», поэтому их не нужно заполнять второй раз.</p>
          </section>
          <section className="admin-panel admin-panel-social">
            <div className="admin-panel-heading"><div><span className="admin-kicker">НИЖНЯЯ СТРОКА</span><h3>Служебные ссылки</h3></div></div>
            <div className="admin-menu-row"><TextField label="Копирайт" value={contact.copyright} onChange={(value) => updateContact({ copyright: value })} /><TextField label="Кнопка наверх" value={contact.topLabel} onChange={(value) => updateContact({ topLabel: value })} /></div>
            <div className="admin-menu-row"><TextField label="Разработка сайта" value={contact.developmentLabel} onChange={(value) => updateContact({ developmentLabel: value })} /><TextField label="Ссылка" value={contact.developmentHref} onChange={(value) => updateContact({ developmentHref: value })} /></div>
            <div className="admin-menu-row"><TextField label="Политика и cookie" value={contact.privacyLabel} onChange={(value) => updateContact({ privacyLabel: value })} /><TextField label="Ссылка" value={contact.privacyHref} onChange={(value) => updateContact({ privacyHref: value })} /></div>
          </section>
        </div>}
      </section>
    </main>
  )
}

const isAdmin = window.location.pathname.startsWith('/admin')
createRoot(document.getElementById('root')).render(<React.StrictMode>{isAdmin ? <AdminApp /> : <PublicSite />}</React.StrictMode>)
