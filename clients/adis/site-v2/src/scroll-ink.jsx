import React, { useEffect } from 'react'

// Keep normal spaces and nonbreaking groups: wrapping and accessible text stay intact.
export function ScrollInk({ text }) {
  return <span className="scroll-ink">{String(text).split(/( +)/).map((part, i) => /^ +$/.test(part) ? part : <span className="scroll-ink-word" key={i}>{part}</span>)}</span>
}

export function useScrollInk(content, reducedMotion) {
  useEffect(() => {
    if (!content || reducedMotion !== false || !('IntersectionObserver' in window)) return
    const nodes = [...document.querySelectorAll('.scroll-ink')]
    const words = new Map(nodes.map(node => [node, [...node.querySelectorAll('.scroll-ink-word')]]))
    const active = new Set()
    let frame = 0
    const paint = () => {
      frame = 0
      const height = window.innerHeight
      const measured = [...active].map(node => [node, node.getBoundingClientRect().top])
      measured.forEach(([node, top]) => {
        const progress = Math.max(0, Math.min(1, (height * .82 - top) / (height * .5)))
        const list = words.get(node)
        list.forEach((word, i) => {
          const local = Math.max(0, Math.min(1, progress * (list.length + 2) - i))
          word.style.opacity = String(.55 + .45 * local)
        })
      })
    }
    const schedule = () => { if (!frame && active.size) frame = requestAnimationFrame(paint) }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) active.add(entry.target)
        else {
          active.delete(entry.target)
          // Text already passed is always completely legible.
          words.get(entry.target).forEach(word => { word.style.opacity = entry.boundingClientRect.top < 0 ? '1' : '.55' })
        }
      })
      schedule()
    }, { rootMargin:'80px 0px' })
    nodes.forEach(node => observer.observe(node))
    window.addEventListener('scroll', schedule, { passive:true })
    window.addEventListener('resize', schedule)
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule)
      words.forEach(list => list.forEach(word => word.style.removeProperty('opacity')))
    }
  }, [content, reducedMotion])
}
