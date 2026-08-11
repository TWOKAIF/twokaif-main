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

function SiteHeader({ content = fallbackHeader, preview = false }) {
  const [open, setOpen] = useState(false)
  const [activeMenuIndex, setActiveMenuIndex] = useState(0)
  const overlayRef = useRef(null)

  useGSAP(() => {
    if (!overlayRef.current) return
    const links = overlayRef.current.querySelectorAll('.menu-link-inner')
    const socials = overlayRef.current.querySelectorAll('.menu-social-link')
    gsap.killTweensOf([overlayRef.current, ...links, ...socials])
    if (open) {
      gsap.set(overlayRef.current, { visibility: 'visible' })
      const timeline = gsap.timeline()
      timeline
        .fromTo(overlayRef.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.68, ease: 'power4.inOut' })
        .fromTo(links, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.62, stagger: 0.055, ease: 'power4.out' }, '-=0.3')
        .fromTo(socials, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, stagger: 0.04, ease: 'power3.out' }, '-=0.36')
    } else {
      gsap.to(overlayRef.current, {
        clipPath: 'inset(0 0 100% 0)', duration: 0.52, ease: 'power4.inOut',
        onComplete: () => gsap.set(overlayRef.current, { visibility: 'hidden' }),
      })
    }
  }, { dependencies: [open], scope: overlayRef })

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <>
      <header className={`site-header${preview ? ' site-header-preview' : ''}`}>
        <a className="brand" href="#top">{content.brand}</a>
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
          <a className="contact-button" href={content.contactHref}>{content.contactLabel}</a>
          <button className="menu-button" type="button" aria-label="Открыть меню" onClick={() => setOpen(true)}><DotsIcon /></button>
        </div>
      </header>

      <aside ref={overlayRef} className={`menu-overlay${preview ? ' menu-overlay-preview' : ''}`} aria-hidden={!open}>
        <div className="menu-header">
          <span className="brand">{content.brand}</span>
          <div className="header-actions">
            <a className="contact-button contact-button-dark" href={content.contactHref}>{content.contactLabel}</a>
            <button className="menu-button menu-button-dark" type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)}><DotsIcon close /></button>
          </div>
        </div>
        <nav className="menu-list" aria-label="Основная навигация">
          {content.menu.map((item, index) => (
            <a
              className={`menu-link${index === activeMenuIndex ? ' is-active' : ''}`}
              href={item.href}
              key={`${item.label}-${index}`}
              onClick={() => setOpen(false)}
              onFocus={() => setActiveMenuIndex(index)}
              onMouseEnter={() => setActiveMenuIndex(index)}
            >
              <span className="menu-link-inner">{item.label}</span>
            </a>
          ))}
        </nav>
        <nav className="menu-socials" aria-label="Социальные сети">
          {(content.socials || fallbackHeader.socials).map((item, index) => (
            <a className="menu-social-link" href={item.href} key={`${item.label}-${index}`}>{item.label}</a>
          ))}
        </nav>
      </aside>
    </>
  )
}

function PublicSite() {
  const [header, setHeader] = useState(fallbackHeader)
  useEffect(() => {
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

        <div className="admin-preview"><SiteHeader content={header} preview /><div className="admin-preview-label">ЖИВОЙ ПРЕДПРОСМОТР</div></div>

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
