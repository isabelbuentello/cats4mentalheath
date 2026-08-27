import NavBar from '../components/NavBar.jsx'
import { ScallopStrip, Heart } from '../components/Decor.jsx'
import amazon from '../assets/amazon.png'
import cashapp from '../assets/cashapp.png'
import venmo from '../assets/venmo.png'
import catpic from '../assets/donatecat.png'
import CrestLink from '../components/CrestLink.jsx';

const WAYS_TO_GIVE = [
  {
    name: 'Amazon Wishlist',
    detail: 'food, litter & supplies',
    href: 'https://www.amazon.com/hz/wishlist/ls/2I61EMFF773H8?ref_=wl_share',
    logo: amazon,
    chip: 'var(--color-chip-5)',
  },
  {
    name: 'Venmo',
    detail: '@cats4mentalhealth',
    href: 'https://venmo.com/u/cats4mentalhealth',
    logo: venmo,
    chip: 'var(--color-chip-3)',
  },
  {
    name: 'CashApp',
    detail: '$uhc4mh',
    href: 'https://cash.app/$uhc4mh',
    logo: cashapp,
    chip: 'var(--color-chip-4)',
  },
]

function DonatePage() {
  return (
    <div className="c4-gingham c4-scope font-hand relative min-h-screen py-6 sm:py-8">
      {/* ── scalloped header bar ───────────────────────────── */}
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-4 py-5 text-center sm:px-6">
          <div className="flex items-center justify-between gap-3 sm:gap-5">
            <CrestLink />
            <div className="min-w-0 flex-1 text-center">
            <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
              ♡ support our cats ♡
            </h1>
            <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
              every little bit goes straight to the cats
            </p>
            </div>
            <CrestLink decorative />
          </div>
        </div>
        <ScallopStrip />
      </header>

      <NavBar />

      <div className="c4-container">
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {/* ── ways to give ─────────────────────────────────── */}
          <section className="c4-panel min-w-0 rounded-[18px] p-4 lg:self-start">
            <h2 className="font-pix text-accent m-0 text-xl">★ ways to give</h2>

            <p className="text-ink mt-2.5 mb-0 text-[15px] leading-relaxed">
              Your donations help us feed and care for the stray cats on our campus. Every
              contribution makes a difference — food, supplies, and vet care all come straight out of
              what you give. ♡
            </p>

            <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
              {WAYS_TO_GIVE.map((way) => (
                <li key={way.name}>
                  <a
                    href={way.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-line flex items-center gap-3 rounded-[14px] border-[1.5px] p-2.5 no-underline transition-transform hover:-translate-y-0.5"
                    style={{ background: way.chip }}
                  >
                    <span className="bg-panel border-line grid h-14 w-24 shrink-0 place-items-center rounded-[10px] border p-2">
                      <img
                        src={way.logo}
                        alt=""
                        className="max-h-9 max-w-full object-contain"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="font-pix text-ink block text-base">{way.name}</span>
                      <span className="text-ink/70 block text-sm break-words">{way.detail}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-ink/70 m-0 mt-3.5 flex items-center justify-center gap-1.5 text-sm">
              <Heart s={12} /> thank you from all of us at cats4mh <Heart s={12} />
            </p>
          </section>

          {/* ── photo ────────────────────────────────────────── */}
          <section className="c4-panel min-w-0 rounded-[18px] p-4 lg:self-start">
            <img
              src={catpic}
              alt="One of the campus cats your donations help feed"
              className="border-line max-h-[520px] w-full rounded-[12px] border-[1.5px] object-cover"
            />
            <p className="border-line bg-soft text-ink mt-3 rounded-md border border-dashed p-2.5 text-center text-sm">
              Cats for Mental Health is a registered student organization at UH, and the home of
              Lear's Legacy Cat Rescue. ♡
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DonatePage
