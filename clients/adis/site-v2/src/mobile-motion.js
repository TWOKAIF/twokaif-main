import { useEffect } from 'react'

// Native scrolling drives only visible photos; layout and tap targets never move.
export function useMobileMotion(content, reducedMotion) {
  useEffect(() => {
    if (!content || reducedMotion !== false || !window.IntersectionObserver) return
    const mobile = matchMedia('(max-width: 767px), (pointer: coarse) and (max-width: 1024px)')
    let dispose = () => {}
    const setup = () => {
      dispose()
      if (!mobile.matches) return
      const photos = [...document.querySelectorAll('.gallery-media')]
      const active = new Set(), animations = new Set()
      let frame = 0
      const paint = () => {
        frame = 0
        if (document.hidden) return
        const h = window.innerHeight
        const values = [...active].map(el => {
          const rect = el.getBoundingClientRect()
          const distance = Math.min(1, Math.abs(rect.top + rect.height / 2 - h / 2) / ((h + rect.height) / 2))
          return [el, 1 + .04 * (1 - distance) ** 2]
        })
        values.forEach(([el, scale]) => el.style.setProperty('--mobile-photo-scale', scale.toFixed(4)))
      }
      const schedule = () => { if (!frame && !document.hidden && active.size) frame = requestAnimationFrame(paint) }
      const observer = new IntersectionObserver(entries => {
        entries.forEach(({target,isIntersecting}) => {
          if (isIntersecting) active.add(target)
          else { active.delete(target); target.style.removeProperty('--mobile-photo-scale') }
        }); schedule()
      }, {rootMargin:'40px 0px'})
      photos.forEach(el => observer.observe(el))
      const media = [...document.querySelectorAll('.video-launch')]
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(({target,isIntersecting}) => {
          if (!isIntersecting) return
          reveal.unobserve(target)
          const image = target.querySelector('img')
          if (!image) return
          const a = image.animate([{transform:'scale(1.045)',opacity:.8},{transform:'scale(1)',opacity:1}],{duration:950,easing:'cubic-bezier(.22,1,.36,1)'})
          animations.add(a);a.onfinish=()=>animations.delete(a)
        })
      }, {threshold:.15})
      media.filter(el=>el.getBoundingClientRect().top>=window.innerHeight).forEach(el=>reveal.observe(el))
      window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule)
      document.addEventListener('visibilitychange',schedule)
      dispose=()=>{
        observer.disconnect();reveal.disconnect();cancelAnimationFrame(frame)
        animations.forEach(a=>a.cancel());photos.forEach(el=>el.style.removeProperty('--mobile-photo-scale'))
        window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule)
      }
    }
    setup();mobile.addEventListener('change',setup)
    return ()=>{dispose();mobile.removeEventListener('change',setup)}
  },[content,reducedMotion])
}
