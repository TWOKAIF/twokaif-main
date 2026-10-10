import { useEffect } from 'react'
import { getSmoothCornerPath } from '../lib/smooth-corners'

// The same 8px / 100% geometry used on Ismailov's site. Observe only
// media surfaces, leaving focus rings, controls and shadows outside the clip.
export function useSmoothSurfaces() {
  useEffect(() => {
    if (!('ResizeObserver' in window) || !CSS.supports('clip-path', 'path("M0 0H1V1H0Z")')) return
    const selector = '.hero-portrait,.hero-red-field,.about-media img,.video-placeholder,.selected-media,.gallery-media picture,.gallery-lightbox-frame picture,.menu-portrait,.contact-red-field,.contact-portrait picture,.video-player-stage'
    const tracked = new Set()
    const observer = new ResizeObserver(entries => {
      for (const {target, borderBoxSize} of entries) {
        const box = borderBoxSize[0]
        if (!box) continue
        const radius = target.classList.contains('video-player-stage') ? 12 : 8
        // Crop the export fringe and its backdrop to the same visible edge.
        const portraitEdge = target.matches('.hero-portrait,.hero-red-field,.contact-red-field,.contact-portrait picture') ? 2 : 0
        const path = getSmoothCornerPath(Math.max(1,box.inlineSize-portraitEdge), Math.max(1,box.blockSize-portraitEdge), radius, 1)
        target.style.clipPath = path ? `path("${path}")` : ''
      }
    })
    const discover = () => {
      for (const el of tracked) if (!el.isConnected) { observer.unobserve(el); tracked.delete(el) }
      document.querySelectorAll(selector).forEach(el => {
        if (tracked.has(el)) return
        tracked.add(el); observer.observe(el, {box:'border-box'})
      })
    }
    discover()
    const mutations = new MutationObserver(discover)
    mutations.observe(document.body, {childList:true, subtree:true})
    return () => { mutations.disconnect(); observer.disconnect(); tracked.forEach(el => {el.style.clipPath=''}) }
  }, [])
}
