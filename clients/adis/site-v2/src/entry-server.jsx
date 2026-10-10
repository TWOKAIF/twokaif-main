import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './app.jsx'

export function render(content) {
  return renderToString(<React.StrictMode><App initialContent={content} /></React.StrictMode>)
}
