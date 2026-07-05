/**
 * Aurora Motion System — Framer Motion variant definitions.
 * All variants use type:'tween' to disable spring physics (Aurora: no overshoot, no bounce).
 * All entrance durations are at or below the 200ms Aurora ceiling.
 * Stagger: 40ms between children (Aurora spec).
 */

export const entrance = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1], type: 'tween' },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1], type: 'tween' },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1], type: 'tween' },
  },
}

export const carouselSlideTransition = {
  duration: 1.2,
  ease: [0, 0, 0.2, 1],
  type: 'tween',
}

export const carouselExitTransition = {
  duration: 1.2,
  ease: [0.4, 0, 1, 1],
  type: 'tween',
}

export const kenBurnsTransition = {
  duration: 6,
  ease: 'linear',
  type: 'tween',
}
