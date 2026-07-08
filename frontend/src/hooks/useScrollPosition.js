import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Tracks whether the page has scrolled past a given threshold.
 * Throttled with requestAnimationFrame. Passive listener — no scroll blocking.
 *
 * @param {object} options
 * @param {boolean} options.enabled  - When false, returns defaults immediately (no listener attached)
 * @param {number}  options.threshold - Scroll Y in px that marks the threshold (default: 80)
 * @returns {{ scrollY: number, isPastThreshold: boolean }}
 */
export function useScrollPosition({ enabled = true, threshold = 80 } = {}) {
  const [state, setState] = useState({ scrollY: 0, isPastThreshold: false })
  const rafRef = useRef(null)

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const y = window.scrollY
      setState(prev => {
        const past = y > threshold
        if (prev.scrollY === y && prev.isPastThreshold === past) return prev
        return { scrollY: y, isPastThreshold: past }
      })
    })
  }, [threshold])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, onScroll])

  if (!enabled) return { scrollY: 0, isPastThreshold: false }
  return state
}
