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

const previewDevices = [
  { id: 'desktop', label: 'Компьютер', width: 1440, height: 900 },
  { id: 'tablet', label: 'iPad', width: 1024, height: 1366 },
  { id: 'mobile', label: 'iPhone', width: 428, height: 926 },
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

function SiteHeader({ content = fallbackHeader, preview = false }) {
  const [open, setOpen] = useState(false)
  const [activeMenuIndex, setActiveMenuIndex] = useState(0)
  const overlayRef = useRef(null)

  useGSAP(() => {
    if (!overlayRef.current) return
    gsap.killTweensOf(overlayRef.current)
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
    const closeOnEscape = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
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

  return (
    <>
      <header className={`site-header${preview ? ' site-header-preview' : ''}`}>
        <button className="brand brand-button" type="button" onClick={() => followLink('#top')}>{content.brand}</button>
        <div className="format-line" aria-label="Форматы работы">
          <div className="format-line-track">
            {content.formats.map((format, index) => (
              <React.Fragment key={`${format}-${index}`}>
                {index > 0 && <span className="format-divider" aria-hidden="true">/</span>}
                <span>{format}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="header-actions">
          <button className="contact-button" type="button" onClick={() => followLink(content.contactHref)}>{content.contactLabel}</button>
          <button className="menu-button" type="button" aria-label="Открыть меню" onClick={() => setOpen(true)}><DotsIcon /></button>
        </div>
      </header>

      <aside ref={overlayRef} className={`menu-overlay${preview ? ' menu-overlay-preview' : ''}`} aria-hidden={!open}>
        <div className="menu-header">
          <button className="brand brand-button" type="button" onClick={() => followLink('#top', true)}>{content.brand}</button>
          <div className="header-actions">
            <button className="contact-button contact-button-dark" type="button" onClick={() => followLink(content.contactHref, true)}>{content.contactLabel}</button>
            <button className="menu-button menu-button-dark" type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)}><DotsIcon close /></button>
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

function PublicSite() {
  const [header, setHeader] = useState(fallbackHeader)
  useEffect(() => {
    const isAdminPreview = new URLSearchParams(window.location.search).get('preview') === 'admin'
    if (isAdminPreview) {
      const receivePreview = (event) => {
        if (event.origin !== window.location.origin || event.data?.type !== 'adis-preview-header') return
        setHeader(event.data.header)
      }
      window.addEventListener('message', receivePreview)
      window.parent.postMessage({ type: 'adis-preview-ready' }, window.location.origin)
      return () => window.removeEventListener('message', receivePreview)
    }
    fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject()).then((content) => setHeader(content.header)).catch(() => {})
  }, [])

  return (
    <main className="site-shell" id="top">
      <SiteHeader content={header} />
      <section className="header-review-canvas" aria-label="Область следующего блока">
        <span>СЛЕДУЮЩИЙ БЛОК ПОСЛЕ УТВЕРЖДЕНИЯ ХЕДЕРА</span>
      </section>
    </main>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return <label className="admin-field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>
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

function AdminDevicePreview({ header }) {
  const [deviceId, setDeviceId] = useState('desktop')
  const [scale, setScale] = useState(0.6)
  const stageRef = useRef(null)
  const iframeRef = useRef(null)
  const device = previewDevices.find((item) => item.id === deviceId) || previewDevices[0]

  const sendPreview = () => iframeRef.current?.contentWindow?.postMessage({ type: 'adis-preview-header', header }, window.location.origin)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const resize = () => {
      const availableWidth = Math.max(280, stage.clientWidth - 32)
      setScale(Math.min(1, availableWidth / device.width, 620 / device.height))
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [device.width, device.height])

  useEffect(() => { sendPreview() }, [header, deviceId])

  useEffect(() => {
    const receiveReady = (event) => {
      if (event.origin === window.location.origin && event.data?.type === 'adis-preview-ready') sendPreview()
    }
    window.addEventListener('message', receiveReady)
    return () => window.removeEventListener('message', receiveReady)
  }, [header])

  return (
    <section className="admin-device-preview" aria-label="Предпросмотр сайта на разных устройствах">
      <div className="admin-preview-toolbar">
        <div><span className="admin-kicker">ЖИВОЙ ПРЕДПРОСМОТР</span><strong>{device.width} × {device.height}</strong></div>
        <div className="admin-device-switcher" role="group" aria-label="Размер устройства">
          {previewDevices.map((item) => (
            <button className={item.id === deviceId ? 'is-active' : ''} type="button" aria-pressed={item.id === deviceId} onClick={() => setDeviceId(item.id)} key={item.id}>
              <DeviceIcon device={item.id} />
              <span><b>{item.label}</b><small>{item.width} × {item.height}</small></span>
            </button>
          ))}
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

function AdminApp() {
  const [authenticated, setAuthenticated] = useState(null)
  const [header, setHeader] = useState(fallbackHeader)
  const [status, setStatus] = useState('')

  const load = async () => {
    const response = await fetch('/api/admin/content')
    if (response.status === 401) return setAuthenticated(false)
    const content = await response.json()
    setHeader(content.draft.header)
    setAuthenticated(true)
  }

  useEffect(() => { load() }, [])

  const changeFormat = (index, value) => setHeader((current) => ({ ...current, formats: current.formats.map((item, itemIndex) => itemIndex === index ? value : item) }))
  const changeMenu = (index, key, value) => setHeader((current) => ({ ...current, menu: current.menu.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))
  const changeSocial = (index, key, value) => setHeader((current) => ({ ...current, socials: (current.socials || fallbackHeader.socials).map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))
  const saveDraft = async () => {
    setStatus('Сохраняю…')
    const response = await fetch('/api/admin/draft/header', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(header) })
    setStatus(response.ok ? 'Черновик сохранён' : 'Не удалось сохранить')
  }
  const publish = async () => {
    await saveDraft()
    const response = await fetch('/api/admin/publish', { method: 'POST' })
    setStatus(response.ok ? 'Опубликовано на сайте' : 'Не удалось опубликовать')
  }

  if (authenticated === null) return <div className="admin-loading">Загружаю…</div>
  if (!authenticated) return <Login onSuccess={load} />

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div><span className="admin-kicker">АДИС МАММО</span><h1>Управление сайтом</h1></div>
        <nav><button className="admin-nav-active" type="button"><span>01</span> Хедер и меню</button></nav>
        <span className="admin-sidebar-note">Собираем сайт по одному блоку.</span>
      </aside>

      <section className="admin-workspace">
        <div className="admin-toolbar"><div><span className="admin-kicker">БЛОК 01</span><h2>Хедер и меню</h2></div><div className="admin-toolbar-actions"><span>{status}</span><button type="button" onClick={saveDraft}>Сохранить черновик</button><button className="admin-primary" type="button" onClick={publish}>Опубликовать</button></div></div>

        <AdminDevicePreview header={header} />

        <div className="admin-form-grid">
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
        </div>
      </section>
    </main>
  )
}

const isAdmin = window.location.pathname.startsWith('/admin')
createRoot(document.getElementById('root')).render(<React.StrictMode>{isAdmin ? <AdminApp /> : <PublicSite />}</React.StrictMode>)
