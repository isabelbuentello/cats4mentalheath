import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import { ScallopStrip, Heart } from '../components/Decor.jsx'
import ig from '../assets/ig.png'
import ds from '../assets/ds.png'

const SOCIALS = [
  {
    name: 'Instagram',
    detail: '@cats4mentalhealth',
    href: 'https://www.instagram.com/cats4mentalhealth/',
    logo: ig,
    chip: 'var(--color-chip-2)',
  },
  {
    name: 'Discord',
    detail: 'come hang out in the server',
    href: 'https://discord.com/invite/WSJ9cHDs26',
    logo: ds,
    chip: 'var(--color-chip-3)',
  },
]

function JoinPage() {
  return (
    <div className="c4-gingham c4-scope font-hand relative min-h-screen py-6 sm:py-8">
      {/* ── scalloped header bar ───────────────────────────── */}
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-6 py-6 text-center sm:px-7">
          <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
            ♡ we'd love to have you ♡
          </h1>
          <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
            everyone's welcome — cat person or cat person in training
          </p>
        </div>
        <ScallopStrip />
      </header>

      <NavBar />

      <div className="c4-container">
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {/* ── socials ──────────────────────────────────────── */}
          <section className="c4-panel min-w-0 rounded-[18px] p-4 lg:self-start">
            <h2 className="font-pix text-accent m-0 text-xl">★ come say hi</h2>

            <p className="text-ink mt-2.5 mb-0 text-[15px] leading-relaxed">
              We post cat updates, event announcements, and feeding reminders here. The Discord is
              where most of the day-to-day happens.
            </p>

            <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
              {SOCIALS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-line flex items-center gap-3 rounded-[14px] border-[1.5px] p-2.5 no-underline transition-transform hover:-translate-y-0.5"
                    style={{ background: social.chip }}
                  >
                    <span className="bg-panel border-line grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border p-1.5">
                      <img src={social.logo} alt="" className="h-full w-full object-contain" />
                    </span>
                    <span className="min-w-0">
                      <span className="font-pix text-ink block text-base">{social.name}</span>
                      <span className="text-ink/70 block text-sm break-words">{social.detail}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-ink/70 m-0 mt-3.5 flex items-center justify-center gap-1.5 text-sm">
              <Heart s={12} /> see you soon <Heart s={12} />
            </p>
          </section>

          {/* ── volunteering ─────────────────────────────────── */}
          <section className="c4-panel min-w-0 rounded-[18px] p-4 lg:self-start">
            <h2 className="font-pix text-accent m-0 text-xl">★ want to feed the cats?</h2>

            <p className="text-ink mt-2.5 mb-0 text-[15px] leading-relaxed">
              Interested in feeding our campus' cats? Sign up in our member login, and sign up for a
              training!
            </p>

            {/* Label sits in its own span: the global `a:hover { color: #fff }`
                is unlayered and would otherwise beat any text-colour utility,
                turning this white-on-pastel. */}
            <Link
              to="/login"
              className="border-line mt-4 block rounded-[14px] border-[1.5px] px-6 py-3.5 text-center no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--color-chip-1)' }}
            >
              <span className="font-pix text-ink text-xl">member login</span>
            </Link>

            <div className="border-line bg-soft text-ink mt-3.5 rounded-md border border-dashed p-2.5 text-sm">
              Once you're approved, you can claim feeding shifts on the volunteer calendar and log
              your hours. ♡
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default JoinPage
