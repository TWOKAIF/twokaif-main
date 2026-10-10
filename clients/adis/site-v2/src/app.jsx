import React, { useEffect } from 'react'
import PublicSite from './site.jsx'

export default function App({ initialContent = null }) {
  useEffect(() => {
    document.documentElement.classList.add('js-enhanced')
    return () => document.documentElement.classList.remove('js-enhanced')
  }, [])

  return (
    <>
      <a className="skip-link" href="#main-content">К ОСНОВНОМУ СОДЕРЖИМОМУ</a>
      <PublicSite initialContent={initialContent} />
      <div className="film-grain" aria-hidden="true" />
    </>
  )
}
