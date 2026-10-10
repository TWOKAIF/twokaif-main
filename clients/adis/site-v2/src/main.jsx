import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './app.jsx'
import 'lenis/dist/lenis.css'
import './styles.css'
import './contact-layout.css'
import './menu-materials.css'
import { prepareCriticalTypography } from './font-readiness.js'

const root = document.getElementById('root')
const hasServerMarkup = Boolean(root.querySelector('.site-shell'))
if (hasServerMarkup) document.documentElement.classList.add('has-ssr')
prepareCriticalTypography()

function readInitialContent() {
  if (window.__ADIS_STANDALONE_CONTENT__) return window.__ADIS_STANDALONE_CONTENT__
  const payload = document.getElementById('site-content')?.dataset.json
  if (!payload) return null
  try {
    return JSON.parse(payload)
  } catch {
    return null
  }
}

const app = <React.StrictMode><App initialContent={readInitialContent()} /></React.StrictMode>
if (hasServerMarkup) {
  hydrateRoot(root, app)
} else {
  // Vite dev/preview and the standalone export receive content without SSR.
  createRoot(root).render(app)
}

import './theme-utilities.css'
import './dark-theme.css'
