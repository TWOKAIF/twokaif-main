import { useEffect } from 'react'
import { getSmoothCornerPath } from '../lib/smooth-corners'

// The same 8px / 100% geometry used on Ismailov's site. Observe only
// media surfaces, leaving focus rings, controls and shadows outside the clip.
export function useSmoothSurfaces() {
  useEffect(() => {
    if (!('ResizeObserver' in window) || !CSS.supports('clip-path', 'path("M0 0H1V1H0Z")')) return
    const selector = '.hero,.contact-portrait,.about-media img,.video-placeholder,.selected-media,.gallery-media picture,.gallery-lightbox-frame picture,.menu-portrait,.video-player-stage'
    const tracked = new Set()
    const observer = new ResizeObserver(entries => {
      for (const {target, borderBoxSize} of entries) {
        const box = borderBoxSize[0]
        if (!box) continue
        const radius = target.classList.contains('video-player-stage') ? 12 : 8
        if (target.matches('.hero,.contact-portrait')) {
          // One clip owns the composed photograph AND backdrop. Independent
          // antialiased clips let the red layer show through the photo edge.
          const image = target.querySelector('.hero-portrait') || target.querySelector('picture img')
          const backdrop = target.querySelector('.hero-red-field,.contact-red-field')
          if (!image || !backdrop) continue
          const frame = target.getBoundingClientRect()
          const photo = image.getBoundingClientRect()
          const red = backdrop.getBoundingClientRect()
          const nativeWidth = Number(image.getAttribute('width')) || 2092
          const nativeHeight = Number(image.getAttribute('height')) || 2343
          const scale = Math.min(photo.width / nativeWidth, photo.height / nativeHeight)
          // Audited exports: hero bottom 5 source rows / right 2 columns,
          // contact bottom 2 rows / right 2 columns contain the matte fringe.
          // A physical pixel guard also covers downsampled WebP edge filtering.
          const pixel = 1 / (window.devicePixelRatio || 1)
          const cropBottom = Math.max(scale * (target.matches('.hero') ? 6 : 3), pixel)
          const cropRight = Math.max(scale * 3, pixel)
          const left = red.left - frame.left
          const right = Math.min(red.right, photo.right) - frame.left - cropRight
          const bottom = Math.min(red.bottom, photo.bottom) - frame.top - cropBottom
          const r = Math.min(8, (right - left) / 2, bottom / 2)
          const top = Math.max(0, red.top - frame.top)
          // Full-width top preserves title optical margins and escaping hair.
          const path = target.matches('.hero')
            ? `M0 0 H${frame.width} V${top} H${right} V${bottom-r} Q${right} ${bottom} ${right-r} ${bottom} H0 Z`
            : `M0 0 H${frame.width} V${top} H${right} V${bottom-r} Q${right} ${bottom} ${right-r} ${bottom} H${left+r} Q${left} ${bottom} ${left} ${bottom-r} V${top} H0 Z`
          target.style.clipPath = `path("${path}")`
        } else {
          const path = getSmoothCornerPath(box.inlineSize, box.blockSize, radius, 1)
          target.style.clipPath = path ? `path("${path}")` : ''
        }
      }
    })
    const discover = () => {
      for (const el of tracked) if (!el.isConnected) { observer.unobserve(el); tracked.delete(el) }
      document.querySelectorAll(selector).forEach(el => {
        if (tracked.has(el)) return
        tracked.add(el); observer.observe(el, {box:'border-box'})
      })
    }
    const refreshPortrait = event => {
      const parent = event.target.closest?.('.hero,.contact-portrait')
      if (parent) { observer.unobserve(parent); observer.observe(parent, {box:'border-box'}) }
    }
    document.addEventListener('load', refreshPortrait, true)
    discover()
    const mutations = new MutationObserver(discover)
    mutations.observe(document.body, {childList:true, subtree:true})
    return () => { document.removeEventListener('load', refreshPortrait, true); mutations.disconnect(); observer.disconnect(); tracked.forEach(el => {el.style.clipPath=''}) }
  }, [])
}
