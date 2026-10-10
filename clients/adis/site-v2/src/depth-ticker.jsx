import { useEffect, useRef } from 'react'

export function DepthTicker({ logos }) {
  const rootRef = useRef(null)
  useEffect(() => {
    const root = rootRef.current
    const ring = root.querySelector('.brand-depth-ring')
    const items = [...ring.querySelectorAll('.brand-depth-item')]
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = matchMedia('(max-width: 767px), (pointer: coarse) and (max-width: 1024px)')
    let visible = false, hovered = false, focused = false, frame = 0, last = 0, angle = 0
    const draw = () => {
      ring.style.transform = `rotateY(${angle}deg)`
      items.forEach((item, i) => {
        const theta = ((angle + i * 360 / items.length) % 360 + 360) % 360
        const distance = Math.min(theta, 360 - theta) / 180
        const face = item.firstElementChild
        face.style.filter = `blur(${(distance * 6).toFixed(2)}px)`
        face.style.opacity = String(1 - distance * .73)
      })
    }
    const tick = (now) => {
      if (last) angle = (angle - Math.min(now - last, 40) * .007) % 360
      last = now
      draw()
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame); last = 0
      root.dataset.motion = media.matches || mobile.matches ? 'off' : 'on'
      root.dataset.active = !media.matches && visible && !focused && !document.hidden ? 'true' : 'false'
      if (!mobile.matches && !media.matches && visible && !hovered && !focused && !document.hidden) frame = requestAnimationFrame(tick)
    }
    const resize = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      root.style.setProperty('--orbit-radius', `${width * .45}px`)
      root.style.setProperty('--orbit-perspective', `${width * 1.25}px`)
    })
    resize.observe(root)
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { rootMargin: '80px' })
    intersection.observe(root)
    const enter = () => { hovered = true; sync() }
    const leave = () => { hovered = false; sync() }
    const focus = () => { focused = true; sync() }
    const blur = () => { focused = false; sync() }
    root.addEventListener('pointerenter', enter); root.addEventListener('pointerleave', leave)
    root.addEventListener('focusin', focus); root.addEventListener('focusout', blur)
    document.addEventListener('visibilitychange', sync); media.addEventListener('change', sync); mobile.addEventListener('change', sync)
    draw(); sync()
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect()
      root.removeEventListener('pointerenter', enter); root.removeEventListener('pointerleave', leave)
      root.removeEventListener('focusin', focus); root.removeEventListener('focusout', blur)
      document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', sync); mobile.removeEventListener('change', sync)
    }
  }, [logos.map(logo => logo.name).join('|')])
  return <div ref={rootRef} className="brand-depth" tabIndex={0} role="region" aria-label="Логотипы клиентов">
    <svg width="0" height="0" aria-hidden="true" className="brand-color-defs"><defs>
      <filter id="adis-logo-red" colorInterpolationFilters="sRGB"><feFlood floodColor="#9b1406"/><feComposite in2="SourceAlpha" operator="in"/></filter>
    </defs></svg>
    <div className="brand-mobile-track">
      {[0,1].map(copy=><div className="brand-mobile-set" key={copy} aria-hidden={copy ? true : undefined}>
        {logos.map(logo=><div className={`brand-depth-item brand-depth-${logo.shape}`} key={logo.name} style={{'--logo-scale':logo.scale/100}}><div className="brand-depth-face"><img src={logo.src} alt={copy ? '' : logo.name} loading="lazy" draggable={false}/></div></div>)}
      </div>)}
    </div>
    <div className="brand-depth-ring">
      {logos.map((logo, i) => <div className={`brand-depth-item brand-depth-${logo.shape}`} key={logo.name} style={{'--angle': `${i * 360 / logos.length}deg`, '--logo-scale': logo.scale / 100}}>
        <div className="brand-depth-face"><img src={logo.src} alt={logo.name} loading="lazy" draggable={false}/></div>
      </div>)}
    </div>
  </div>
}
