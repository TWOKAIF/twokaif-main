'use client'

import { type CSSProperties, useLayoutEffect, useRef } from 'react'

import { getSmoothCornerPath } from '@/lib/smooth-corners'

/** Clips a media surface, not its outer shadow or focus ring. See the adjacent README. */
export function useSmoothCorners<T extends HTMLElement>(
  radius = 8,
  smoothing = 1,
  media?: string
) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (
      !element ||
      !('ResizeObserver' in window) ||
      !CSS.supports('clip-path', 'path("M0 0H1V1H0Z")')
    )
      return

    const query = media ? window.matchMedia(media) : null
    const update = (width: number, height: number) => {
      if (query && !query.matches) {
        element.style.clipPath = ''
        element.style.borderRadius = ''
        return
      }
      const path = getSmoothCornerPath(width, height, radius, smoothing)
      // ResizeObserver runs before paint. Apply geometry in that callback rather
      // than waiting for a React state commit with the previous-size clip still set.
      element.style.clipPath = path ? `path("${path}")` : ''
      element.style.borderRadius = path ? '0px' : `${radius}px`
    }

    // Computed layout sizes exclude CSS transforms; getBoundingClientRect does not.
    const css = getComputedStyle(element)
    const extraWidth =
      css.boxSizing === 'border-box'
        ? 0
        : Number.parseFloat(css.paddingLeft) +
          Number.parseFloat(css.paddingRight) +
          Number.parseFloat(css.borderLeftWidth) +
          Number.parseFloat(css.borderRightWidth)
    const extraHeight =
      css.boxSizing === 'border-box'
        ? 0
        : Number.parseFloat(css.paddingTop) +
          Number.parseFloat(css.paddingBottom) +
          Number.parseFloat(css.borderTopWidth) +
          Number.parseFloat(css.borderBottomWidth)
    // A closed dialog can report width/height as "100%", not used pixels.
    // Keep the ordinary-radius fallback until its first measurable layout.
    if (
      element.getClientRects().length > 0 &&
      css.width.endsWith('px') &&
      css.height.endsWith('px')
    ) {
      update(
        Number.parseFloat(css.width) + extraWidth,
        Number.parseFloat(css.height) + extraHeight
      )
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      const box = entry?.borderBoxSize[0]
      if (!box) return
      // inlineSize/blockSize are logical dimensions, including vertical writing.
      const vertical =
        getComputedStyle(element).writingMode.startsWith('vertical') ||
        getComputedStyle(element).writingMode.startsWith('sideways')
      update(
        vertical ? box.blockSize : box.inlineSize,
        vertical ? box.inlineSize : box.blockSize
      )
    })
    const mediaChanged = () => {
      const current = getComputedStyle(element)
      update(
        Number.parseFloat(current.width),
        Number.parseFloat(current.height)
      )
    }
    query?.addEventListener('change', mediaChanged)
    observer.observe(element, { box: 'border-box' })
    return () => {
      query?.removeEventListener('change', mediaChanged)
      observer.disconnect()
      element.style.clipPath = ''
      element.style.borderRadius = media ? '' : `${radius}px`
    }
  }, [radius, smoothing, media])

  const style: CSSProperties = {
    overflow: 'hidden',
    // SSR, no JS, missing observer/path support: ordinary rounded-corner fallback.
    borderRadius: media ? undefined : radius,
  }
  return { ref, style }
}
