import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

/* Sticker-chip nav from the cats4mh wireframes (Direction A).
   These are the PUBLIC routes — open to everyone — so their chips are tinted
   toward white, a lighter shade than the full-strength chips used by the
   members-only portal nav (volunteer / map / our cats / feeding / you).
   The tier a link belongs to should be readable at a glance. */
const tint = (chip) => `color-mix(in srgb, var(--color-${chip}) 45%, #fff)`

const LINKS = [
  { to: '/', label: 'about', chip: tint('chip-1') },
  { to: '/donate', label: 'donate', chip: tint('chip-2') },
  { to: '/join', label: 'join', chip: tint('chip-3') },
  { to: '/events', label: 'events', chip: tint('chip-4') },
  { to: '/login', label: 'login', chip: tint('chip-5') },
]

function Chip({ to, label, chip, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="font-pix block rounded-[18px] border-[1.5px] border-line px-6 py-3.5 text-center text-xl tracking-wide no-underline transition-transform hover:-translate-y-0.5 hover:text-ink"
      style={{
        background: active ? 'var(--color-accent)' : chip,
        color: active ? 'var(--color-panel)' : 'var(--color-ink)',
      }}
    >
      {label}
    </Link>
  )
}

function NavBar({ startCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(!startCollapsed)
  const { pathname } = useLocation()

  return (
    <nav className="c4-scope w-full py-5">
      <div className="c4-container">
        {/* Menu button — always visible when startCollapsed, otherwise mobile only */}
        <div className={`flex justify-end ${startCollapsed ? '' : 'md:hidden'}`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="font-pix border-line bg-panel text-accent rounded-[18px] border-[1.5px] px-5 py-3 text-2xl focus:outline-none"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Desktop chip row — equal-width chips spanning the full row */}
        {!startCollapsed && (
          <ul className="m-0 hidden list-none items-stretch gap-3 p-0 md:flex">
            {LINKS.map((l) => (
              <li key={l.to} className="flex-1">
                <Chip {...l} active={pathname === l.to} />
              </li>
            ))}
          </ul>
        )}

        {/* Collapsible menu */}
        {isOpen && (
          <ul
            className={`m-0 mt-3 flex list-none flex-col items-stretch gap-2.5 p-0 ${
              startCollapsed ? '' : 'md:hidden'
            }`}
          >
            {LINKS.map((l) => (
              <li key={l.to}>
                <Chip {...l} active={pathname === l.to} onClick={() => setIsOpen(false)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  )
}

export default NavBar
