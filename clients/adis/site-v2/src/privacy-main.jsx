import React from 'react'
import { createRoot } from 'react-dom/client'
import PrivacyPage from './privacy.jsx'
import './styles.css'
import { prepareCriticalTypography } from './font-readiness.js'

prepareCriticalTypography()
createRoot(document.getElementById('root')).render(<React.StrictMode><PrivacyPage /><div className="film-grain" aria-hidden="true" /></React.StrictMode>)

import './theme-utilities.css'
import './dark-theme.css'
