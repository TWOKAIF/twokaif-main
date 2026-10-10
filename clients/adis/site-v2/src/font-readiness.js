const CRITICAL_FONTS = [
  { family: 'CoFo Kak', weight: '500' },
  ...['400', '600', '700'].map((weight) => ({ family: 'Akrobat', weight })),
]

export function prepareCriticalTypography() {
  const root = document.documentElement
  const fonts = document.fonts
  const criticalFaces = () => fonts ? [...fonts].filter((face) => CRITICAL_FONTS.some(({ family, weight }) =>
    face.family.replace(/["']/g, '') === family && face.weight === weight,
  )) : []
  // FontFaceSet.check() can be true after a failed request; inspect the actual faces.
  const fontsAvailable = () => {
    const faces = criticalFaces()
    return faces.length === CRITICAL_FONTS.length && faces.every((face) => face.status === 'loaded')
  }
  const reveal = () => {
    root.classList.toggle('fonts-fallback', !fontsAvailable())
    root.classList.remove('fonts-loading')
    root.classList.add('fonts-ready')
  }

  // Keep wide system glyphs inside the layout while custom fonts are unavailable.
  root.classList.toggle('fonts-fallback', !fontsAvailable())
  if (!fonts?.load) {
    reveal()
    return
  }

  const recover = () => {
    if (fontsAvailable()) {
      root.classList.remove('fonts-fallback')
      fonts.removeEventListener('loadingdone', recover)
    }
  }
  fonts.addEventListener('loadingdone', recover)
  const timeout = window.setTimeout(reveal, 1800)
  const loadRegisteredFaces = () => {
    const faces = criticalFaces()
    if (faces.length !== CRITICAL_FONTS.length) return
    Promise.all(faces.map((face) => face.load()))
      .catch(() => { /* A failed font must not prevent access to the site. */ })
      .finally(() => {
        window.clearTimeout(timeout)
        reveal()
        recover()
      })
  }
  // Retry once after CSS registration if a browser exposes the font faces late.
  if (document.readyState !== 'complete') {
    window.addEventListener('load', loadRegisteredFaces, { once: true })
  }
  loadRegisteredFaces()
}
