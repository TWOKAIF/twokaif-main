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

function PublicSite() {
  const [content, setContent] = useState({ header: fallbackHeader, hero: fallbackHero })
  const isAdminPreview = new URLSearchParams(window.location.search).get('preview') === 'admin'
  useEffect(() => {
    if (isAdminPreview) {
      const receivePreview = (event) => {
        if (event.origin !== window.location.origin || event.data?.type !== 'adis-preview-content') return
        setContent({ header: event.data.content.header, hero: normalizeHero(event.data.content.hero) })
      }
      window.addEventListener('message', receivePreview)
      window.parent.postMessage({ type: 'adis-preview-ready' }, window.location.origin)
      return () => window.removeEventListener('message', receivePreview)
    }
    fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject()).then((nextContent) => setContent({ header: nextContent.header || fallbackHeader, hero: normalizeHero(nextContent.hero) })).catch(() => {})
  }, [isAdminPreview])

  return (
    <main className="site-shell" id="top" style={getHeroStyle(content.hero)}>
      <SiteHeader content={content.header} preview={isAdminPreview} />
      <HeroSection content={content.hero} />
    </main>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return <label className="admin-field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>
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
      const response = await fetch('/api/admin/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ header, hero }) })
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
      const response = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ header, hero }) })
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

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div><span className="admin-kicker">АДИС МАММО</span><h1>Управление сайтом</h1></div>
        <nav>
          <button className={activeSection === 'header' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('header'); setStatus('') }}><span>01</span> Верх сайта</button>
          <button className={activeSection === 'hero' ? 'admin-nav-active' : ''} type="button" onClick={() => { setActiveSection('hero'); setStatus('') }}><span>02</span> Первый экран</button>
        </nav>
        <span className="admin-sidebar-note">Собираем сайт по одному блоку.</span>
      </aside>

      <section className="admin-workspace">
        <div className="admin-toolbar"><div><span className="admin-kicker">БЛОК {activeSection === 'hero' ? '02' : '01'}</span><h2>{activeSection === 'hero' ? 'Первый экран' : 'Верх сайта'}</h2><p className="admin-section-description">{activeSection === 'hero' ? 'Имя, подпись, портрет и красный фон.' : 'Название, направления работы, кнопка «Связаться» и раскрывающееся меню.'}</p></div><div className="admin-toolbar-actions"><span role="status" aria-live="polite">{status}</span><button type="button" disabled={saving} onClick={saveDraft}>Сохранить черновик</button><button className="admin-primary" type="button" disabled={saving} onClick={publish}>Опубликовать</button></div></div>

        <AdminDevicePreview content={{ header, hero }} deviceId={deviceId} onDeviceChange={setDeviceId} />

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
        </div> : <div className="admin-form-grid admin-hero-grid">
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
        </div>}
      </section>
    </main>
  )
}

const isAdmin = window.location.pathname.startsWith('/admin')
createRoot(document.getElementById('root')).render(<React.StrictMode>{isAdmin ? <AdminApp /> : <PublicSite />}</React.StrictMode>)
