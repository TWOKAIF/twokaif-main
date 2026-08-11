import React, { useEffect, useRef, useState } from 'react'
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
    minHeight: 1078, redHeight: 50, sideGutter: 5, copyTop: 62, titleSize: 207,
    titleLineHeight: 76, roleSize: 30, roleGap: 14, portraitHeight: 94,
    portraitMaxWidth: 82, portraitX: 0, portraitY: 0,
  },
  tablet: {
    minHeight: 1020, redHeight: 54, sideGutter: 5, copyTop: 48, titleSize: 158,
    titleLineHeight: 80, roleSize: 25, roleGap: 12, portraitHeight: 100,
    portraitMaxWidth: 110, portraitX: 0, portraitY: 0,
  },
  mobile: {
    minHeight: 810, redHeight: 55, sideGutter: 3, copyTop: 38, titleSize: 124,
    titleLineHeight: 82, roleSize: 22, roleGap: 10, portraitHeight: 112,
    portraitMaxWidth: 165, portraitX: -14, portraitY: 0,
  },
}

const fallbackHero = {
  nameTop: 'ADIS',
  nameBottom: 'MAMMO',
  role: 'ВЕДУЩИЙ / КОМИК',
  accent: '#9B1406',
  portrait: { url: '/images/adis-hero.png', alt: 'Адис Маммо', width: 2401, height: 2548 },
  layouts: heroLayoutDefaults,
  motion: 'text',
}

const fallbackAbout = {
  kicker: '// ОБ АДИСЕ',
  mediaLabel: 'ФОТО',
  image: '/images/adis-about-02.png',
  imageAlt: 'Портрет Адиса Маммо',
  lead: 'ПОБЕДИТЕЛЬ ПРЕМИИ WEDDING AWARDS\nВ НОМИНАЦИИ «ЛУЧШИЙ ВЕДУЩИЙ РОССИИ».\nУЧАСТНИК «ОТКРЫТОГО МИКРОФОНА» НА ТНТ\nИ ROAST BATTLE ОТ LABELCOM.',
  secondary: 'АВТОР YOUTUBE-КАНАЛА «САРКАЗМОШНАЯ».\nВЕДУЩИЙ ПРОЕКТОВ «ИСТОРИИ НА СПОР» И «У МЕНЯ ХУЖЕ».\nВЫПУСТИЛ СОЛЬНЫЙ СТЕНДАП-КОНЦЕРТ.',
}

const fallbackVideo = {
  kicker: '// ВИДЕО',
  title: 'В РАБОТЕ',
  items: [
    { title: 'ШОУРИЛ 2025', subtitle: 'ФРАГМЕНТЫ СОБЫТИЙ ЗА ПОСЛЕДНЕЕ ВРЕМЯ', url: '' },
    { title: 'СВАДЕБНЫЙ ЛАЙФ', subtitle: 'РАЗ — ТЫ В БЕЛОМ ПЛАТЬЕ.\nДВА — В МОИХ ОБЪЯТИЯХ.\nТРИ — ВИДЕОФРАГМЕНТ СМОТРИ.', url: '' },
    { title: 'НАЗВАНИЕ', subtitle: 'ПОДРОБНОЕ ОПИСАНИЕ ДАННОГО ВИДЕО', url: '' },
    { title: 'НАЗВАНИЕ', subtitle: 'ПОДРОБНОЕ ОПИСАНИЕ ДАННОГО ВИДЕО', url: '' },
  ],
}

const brandLogos = [
  { name: 'S7', src: '/logos/s7.svg', shape: 'mark' },
  { name: 'LVMH', src: '/logos/lvmh.svg', shape: 'wide' },
  { name: 'Сбер', src: '/logos/sber.svg', shape: 'wide' },
  { name: 'Clarins', src: '/logos/clarins.svg', shape: 'wide' },
  { name: 'СИБУР', src: '/logos/sibur.svg', shape: 'wide' },
  { name: 'VK', src: '/logos/vk.svg', shape: 'mark-wide' },
  { name: 'Яндекс', src: '/logos/yandex.svg', shape: 'wide' },
  { name: 'Альфа-Банк', src: '/logos/alfa-bank.svg', shape: 'mark' },
  { name: 'BetBoom', src: '/logos/betboom.svg', shape: 'wide' },
  { name: 'Kaspersky', src: '/logos/kaspersky.svg', shape: 'wide' },
  { name: 'Фармстандарт', src: '/logos/pharmstandard.svg', shape: 'wide' },
]

const tickerLayoutDefaults = {
  desktop: { cardWidth: 340, gap: 24, paddingTop: 28, paddingBottom: 40, fade: 1, speed: 48 },
  tablet: { cardWidth: 286, gap: 20, paddingTop: 24, paddingBottom: 34, fade: 1, speed: 44 },
  mobile: { cardWidth: 220, gap: 14, paddingTop: 18, paddingBottom: 26, fade: 2, speed: 38 },
}

const fallbackTicker = {
  cardColor: '#303030',
  layouts: tickerLayoutDefaults,
  logos: brandLogos.map((logo) => ({ name: logo.name, enabled: true, scale: 100 })),
}

function normalizeTicker(input = {}) {
  const incomingLogos = Array.isArray(input?.logos) ? input.logos : []
  const knownNames = new Set(brandLogos.map((logo) => logo.name))
  const ordered = incomingLogos
    .filter((logo) => knownNames.has(logo?.name))
    .map((logo) => ({ name: logo.name, enabled: logo.enabled !== false, scale: Number(logo.scale || 100) }))
  const presentNames = new Set(ordered.map((logo) => logo.name))
  const missing = brandLogos.filter((logo) => !presentNames.has(logo.name)).map((logo) => ({ name: logo.name, enabled: true, scale: 100 }))
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

function normalizeHero(input = {}) {
  const legacyLayout = {
    ...heroLayoutDefaults.desktop,
    redHeight: Number(input.redHeight ?? heroLayoutDefaults.desktop.redHeight),
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
      desktop: { ...legacyLayout, ...(input.layouts?.desktop || {}) },
      tablet: { ...heroLayoutDefaults.tablet, ...(input.layouts?.tablet || {}) },
      mobile: { ...heroLayoutDefaults.mobile, ...(input.layouts?.mobile || {}) },
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
  { key: 'minHeight', label: 'Высота первого экрана', min: 680, max: 1180, suffix: 'px' },
  { key: 'redHeight', label: 'Высота красного поля', min: 35, max: 65, suffix: '%' },
  { key: 'sideGutter', label: 'Единый отступ сайта по бокам', min: 2, max: 8, suffix: '%' },
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

function SiteHeader({ content = fallbackHeader, preview = false }) {
  const [open, setOpen] = useState(false)
  const [activeMenuIndex, setActiveMenuIndex] = useState(0)
  const overlayRef = useRef(null)
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
        <FormatLine formats={content.formats} />
        <div className="header-actions">
          <button className="contact-button" type="button" onClick={() => followLink(content.contactHref)}>{content.contactLabel}</button>
          <button ref={openButtonRef} className="menu-button" type="button" aria-label="Открыть меню" aria-expanded={open} aria-controls="site-menu-dialog" onClick={openMenu}><DotsIcon /></button>
        </div>
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
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-column">
        <p className="about-kicker">{about.kicker}</p>
        <div className="about-media">
          <img src={about.image} alt={about.imageAlt || 'Портрет Адиса Маммо'} />
        </div>
        <h2 id="about-title">{about.lead}</h2>
        <p className="about-secondary">{about.secondary}</p>
      </div>
    </section>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 7.5 16.5 12 9 16.5Z" />
    </svg>
  )
}

function VideoSection({ content = fallbackVideo }) {
  const video = normalizeVideo(content)
  return (
    <section className="video-section" id="video" aria-labelledby="video-title">
      <header className="video-heading">
        <p>{video.kicker}</p>
        <h2 id="video-title">{video.title}</h2>
      </header>
      <div className="video-list">
        {video.items.map((item, index) => (
          <article className="video-row" key={`${item.title}-${index}`}>
            <div className={`video-placeholder${item.url ? ' has-video' : ''}`}>
              {item.url && (
                <button
                  className="video-launch"
                  type="button"
                  aria-label={`Смотреть: ${item.title}`}
                  onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                >
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
      <div className="video-more" aria-label="Смотреть ещё видео">
        <span>СМОТРЕТЬ ЕЩЁ</span>
        <svg viewBox="0 0 32 16" aria-hidden="true">
          <path d="M1 8h28M23 2l6 6-6 6" />
        </svg>
      </div>
    </section>
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

function PublicSite() {
  const [content, setContent] = useState({ header: fallbackHeader, hero: fallbackHero, about: fallbackAbout, video: fallbackVideo, ticker: fallbackTicker })
  const isAdminPreview = new URLSearchParams(window.location.search).get('preview') === 'admin'
  useEffect(() => {
    if (isAdminPreview) {
      const receivePreview = (event) => {
        if (event.origin !== window.location.origin || event.data?.type !== 'adis-preview-content') return
        setContent({ header: event.data.content.header, hero: normalizeHero(event.data.content.hero), about: event.data.content.about || fallbackAbout, video: normalizeVideo(event.data.content.video), ticker: normalizeTicker(event.data.content.ticker) })
      }
      window.addEventListener('message', receivePreview)
      window.parent.postMessage({ type: 'adis-preview-ready' }, window.location.origin)
      return () => window.removeEventListener('message', receivePreview)
    }
    fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject()).then((nextContent) => setContent({ header: nextContent.header || fallbackHeader, hero: normalizeHero(nextContent.hero), about: nextContent.about || fallbackAbout, video: normalizeVideo(nextContent.video), ticker: normalizeTicker(nextContent.ticker) })).catch(() => {})
  }, [isAdminPreview])

  return (
    <main className="site-shell" id="top" style={getHeroStyle(content.hero)}>
      <SiteHeader content={content.header} preview={isAdminPreview} />
      <HeroSection content={content.hero} />
      <AboutSection content={content.about} />
      <VideoSection content={content.video} />
      <BrandTicker content={content.ticker} />
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
        <p className="admin-note">Для локальной проверки пароль: adis-local</p>
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

function AdminApp() {
  const [authenticated, setAuthenticated] = useState(null)
  const [header, setHeader] = useState(fallbackHeader)
  const [hero, setHero] = useState(fallbackHero)
  const [about, setAbout] = useState(fallbackAbout)
  const [video, setVideo] = useState(fallbackVideo)
  const [ticker, setTicker] = useState(fallbackTicker)
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
      const response = await fetch('/api/admin/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ header, hero, about, video, ticker }) })
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
      const response = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ header, hero, about, video, ticker }) })
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
        </nav>
        <span className="admin-sidebar-note">Собираем сайт по одному блоку.</span>
      </aside>

      <section className="admin-workspace">
        <div className="admin-toolbar"><div><span className="admin-kicker">БЛОК {sectionMeta.number}</span><h2>{sectionMeta.title}</h2><p className="admin-section-description">{sectionMeta.description}</p></div><div className="admin-toolbar-actions"><span role="status" aria-live="polite">{status}</span><button type="button" disabled={saving} onClick={saveDraft}>Сохранить черновик</button><button className="admin-primary" type="button" disabled={saving} onClick={publish}>Опубликовать</button></div></div>

        <AdminDevicePreview content={{ header, hero, about, video, ticker }} deviceId={deviceId} onDeviceChange={setDeviceId} />

        {activeSection === 'header' ? <div className="admin-form-grid">
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
        </div> : <div className="admin-form-grid admin-ticker-grid">
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
        </div>}
      </section>
    </main>
  )
}

const isAdmin = window.location.pathname.startsWith('/admin')
createRoot(document.getElementById('root')).render(<React.StrictMode>{isAdmin ? <AdminApp /> : <PublicSite />}</React.StrictMode>)
