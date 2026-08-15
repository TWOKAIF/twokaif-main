import React, { Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const DesktopSite = React.lazy(() => import('./site.jsx'))
const CRITICAL_FONT_TIMEOUT = 1800
const DESKTOP_VIEWPORT_QUERY = '(min-width: 1200px)'
const DESKTOP_POINTER_QUERY = '(hover: hover) and (pointer: fine)'
const MIN_DESKTOP_SCREEN_SIZE = 1200

function showCriticalTypography() {
  document.documentElement.classList.remove('fonts-loading')
  document.documentElement.classList.add('fonts-ready')
}

async function prepareCriticalTypography() {
  if (!document.fonts?.load) {
    showCriticalTypography()
    return
  }

  let timeoutId
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('500 1em "CoFo Kak"', 'АДИС МАММО'),
        document.fonts.load('400 1em Akrobat', 'АДИС МАММО'),
        document.fonts.load('700 1em Akrobat', 'АДИС МАММО'),
      ]),
      new Promise((resolve) => { timeoutId = window.setTimeout(resolve, CRITICAL_FONT_TIMEOUT) }),
    ])
  } catch {
    // Показываем первый экран даже при сбое загрузки шрифтов.
  } finally {
    window.clearTimeout(timeoutId)
    showCriticalTypography()
  }
}

prepareCriticalTypography()

function SmallScreenHolding() {
  return (
    <main className="screen-holding">
      <header className="screen-holding-header">
        <span>АДИС МАММО</span>
        <span>// САЙТ</span>
      </header>
      <section className="screen-holding-stage" aria-labelledby="screen-holding-title">
        <p className="screen-holding-kicker">// МОБИЛЬНАЯ ВЕРСИЯ</p>
        <h1 id="screen-holding-title">СКОРО</h1>
        <div className="screen-holding-field">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/hero/v2/adis-hero-v2-768.webp 768w, /images/hero/v2/adis-hero-v2-1280.webp 1280w, /images/hero/v2/adis-hero-v2-1920.webp 1920w"
              sizes="100vw"
            />
            <img
              src="/images/hero/v2/adis-hero-v2.png"
              alt="Адис Маммо"
              width="2349"
              height="2496"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="screen-holding-note">
            <span className="screen-holding-speaker">АДИС МАММО</span>
            <span className="screen-holding-quote">
              <span>ПОКА САЙТ ДОСТУПЕН</span>
              <span>ТОЛЬКО НА ПК</span>
            </span>
          </div>
        </div>
      </section>
      <footer className="screen-holding-footer">
        <span>ВЕДУЩИЙ / КОМИК</span>
        <a href="https://t.me/amynameis" target="_blank" rel="noopener noreferrer">СВЯЗАТЬСЯ</a>
      </footer>
    </main>
  )
}

function shouldShowDesktopSite() {
  if (window.matchMedia(DESKTOP_VIEWPORT_QUERY).matches) return true

  const hasDesktopPointer = window.matchMedia(DESKTOP_POINTER_QUERY).matches
  const displaySize = Math.max(window.screen.width, window.screen.height)
  return hasDesktopPointer && displaySize >= MIN_DESKTOP_SCREEN_SIZE
}

function ViewportGate() {
  const [isDesktop, setIsDesktop] = useState(shouldShowDesktopSite)

  useEffect(() => {
    const viewportMedia = window.matchMedia(DESKTOP_VIEWPORT_QUERY)
    const pointerMedia = window.matchMedia(DESKTOP_POINTER_QUERY)
    const updateExperience = () => setIsDesktop(shouldShowDesktopSite())

    viewportMedia.addEventListener('change', updateExperience)
    pointerMedia.addEventListener('change', updateExperience)
    window.addEventListener('resize', updateExperience)
    return () => {
      viewportMedia.removeEventListener('change', updateExperience)
      pointerMedia.removeEventListener('change', updateExperience)
      window.removeEventListener('resize', updateExperience)
    }
  }, [])

  return isDesktop
    ? <Suspense fallback={null}><DesktopSite /></Suspense>
    : <SmallScreenHolding />
}

createRoot(document.getElementById('root')).render(<React.StrictMode><ViewportGate /></React.StrictMode>)
