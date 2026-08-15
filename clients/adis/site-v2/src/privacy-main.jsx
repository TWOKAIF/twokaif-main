import React from 'react'
import { createRoot } from 'react-dom/client'
import PrivacyPage from './privacy.jsx'
import './styles.css'

const CRITICAL_FONT_TIMEOUT = 1800

async function prepareTypography() {
  if (!document.fonts?.load) {
    document.documentElement.classList.replace('fonts-loading', 'fonts-ready')
    return
  }

  let timeoutId
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('500 1em "CoFo Kak"', 'ПОЛИТИКА COOKIE'),
        document.fonts.load('400 1em Akrobat', 'ПОЛИТИКА COOKIE'),
        document.fonts.load('700 1em Akrobat', 'ПОЛИТИКА COOKIE'),
      ]),
      new Promise((resolve) => { timeoutId = window.setTimeout(resolve, CRITICAL_FONT_TIMEOUT) }),
    ])
  } catch {
    // Документ остаётся доступным даже при сбое загрузки шрифтов.
  } finally {
    window.clearTimeout(timeoutId)
    document.documentElement.classList.replace('fonts-loading', 'fonts-ready')
  }
}

prepareTypography()
createRoot(document.getElementById('root')).render(<React.StrictMode><PrivacyPage /></React.StrictMode>)
