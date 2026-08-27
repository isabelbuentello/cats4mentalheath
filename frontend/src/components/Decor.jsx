import { useId } from 'react'

/* Decorative primitives ported from the cats4mh wireframes (Direction A).
   All default to the palette tokens in styles/index.css. */

export function Bow({ c = 'var(--color-accent)', s = 40 }) {
  return (
    <svg width={s} height={s * 0.7} viewBox="0 0 40 28" aria-hidden="true">
      <path d="M20 14 L4 4 Q2 14 4 24 Z" fill={c} opacity=".85" />
      <path d="M20 14 L36 4 Q38 14 36 24 Z" fill={c} opacity=".85" />
      <circle cx="20" cy="14" r="4" fill={c} />
      <path d="M20 18 Q18 24 16 26 M20 18 Q22 24 24 26" stroke={c} strokeWidth="2" fill="none" />
    </svg>
  )
}

export function Heart({ c = 'var(--color-accent)', s = 14 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 14s-6-3.5-6-8a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4.5-6 8-6 8z" fill={c} />
    </svg>
  )
}

/* A row of half-circles used as a decorative edge under panels. */
export function ScallopStrip({ c = 'var(--color-line)', flip = false }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      width="100%"
      height="10"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block', transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <pattern id={`sc-${id}`} width="14" height="10" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="2" r="5" fill={c} />
      </pattern>
      <rect width="100%" height="10" fill={`url(#sc-${id})`} />
    </svg>
  )
}

export function PixelCat({ size = 48, color = 'var(--color-accent)', bow }) {
  const px = size / 12
  const c = (x, y, cc = color) => (
    <rect key={`${x}-${y}-${cc}`} x={x * px} y={y * px} width={px} height={px} fill={cc} />
  )
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* ears */}
      {c(2, 1)}{c(3, 2)}{c(8, 1)}{c(9, 2)}
      {/* head */}
      {c(2, 2)}{c(3, 3)}{c(4, 2)}{c(5, 2)}{c(6, 2)}{c(7, 2)}{c(8, 2)}{c(9, 3)}
      {c(2, 3)}
      {c(2, 4)}{c(3, 4)}{c(4, 4)}{c(5, 4)}{c(6, 4)}{c(7, 4)}{c(8, 4)}{c(9, 4)}
      {c(2, 5)}{c(9, 5)}
      {/* eyes + muzzle */}
      {c(4, 3, '#fff')}{c(7, 3, '#fff')}
      {c(5, 5, '#fff')}{c(6, 5, '#fff')}
      {/* body */}
      {c(2, 6)}{c(3, 6)}{c(4, 6)}{c(5, 6)}{c(6, 6)}{c(7, 6)}{c(8, 6)}{c(9, 6)}
      {c(3, 7)}{c(4, 7)}{c(5, 7)}{c(6, 7)}{c(7, 7)}{c(8, 7)}
      {c(3, 8)}{c(8, 8)}
      {c(3, 9)}{c(4, 9)}{c(5, 9)}{c(6, 9)}{c(7, 9)}{c(8, 9)}
      {c(3, 10)}{c(8, 10)}
      {bow && <>{c(1, 2, bow)}{c(0, 3, bow)}{c(1, 3, bow)}{c(0, 4, bow)}{c(1, 4, bow)}</>}
    </svg>
  )
}
