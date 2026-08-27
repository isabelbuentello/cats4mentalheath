import { useCallback, useRef, useState } from 'react'
import NavBar from '../components/NavBar.jsx'
import CircularGallery from '../components/CircularGallery.jsx'
import { Bow, ScallopStrip } from '../components/Decor.jsx'
import isabel from '../assets/isabel.png'
import emilie from '../assets/emilie.png'
import eve from '../assets/eve.png'
import rashmika from '../assets/rashmika.png'
import laura from '../assets/laura.png'
import ornella from '../assets/ornella.png'
import lear from '../assets/lear.png'

const CHIPS = [
  'var(--color-chip-1)',
  'var(--color-chip-2)',
  'var(--color-chip-3)',
  'var(--color-chip-4)',
  'var(--color-chip-5)',
]

const OFFICERS = [
  { name: 'Evelyn T', role: 'President', img: eve, quote: "I'm from Singapore and I have the same birthday as BTS Jungkook! ദ്ദി/ᐠ - ˕ -マ" },
  { name: 'Emilie Z', role: 'Vice President', img: emilie, quote: 'If you give me a sticky note and 6 to 7 minutes, I can fold an origami dragon.' },
  { name: 'Ornella G', role: 'Treasurer', img: ornella, quote: 'I love animal crossing, but not more than cats! :)' },
  { name: 'Rashmika K', role: 'Event Coordinator', img: rashmika, quote: 'I rescued three cats with two other officers :3' },
  { name: 'Laura L', role: 'Social Media', img: laura, quote: 'I love dill pickle chips😋😋' },
  { name: 'Isabel B', role: 'Webmaster', img: isabel, quote: "My cats' names are Butter & Jupie!" },
]

/* Circle button under the carousel. Styling lives in `.c4-dot` rather than
   utilities because the global `button { padding … }` rule is unlayered and
   would otherwise win over Tailwind. */
function DotButton({ label, active = false, onClick, children }) {
  return (
    <button
      type="button"
      className="c4-dot font-hand"
      aria-label={label}
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  )
}

function Home() {
  const galleryRef = useRef(null)
  const [slide, setSlide] = useState({ index: 0, total: 0 })
  const handleSlideChange = useCallback((index, total) => setSlide({ index, total }), [])

  return (
    <div className="c4-gingham c4-scope font-hand relative min-h-screen py-6 sm:py-8">
      {/* ── scalloped header bar ───────────────────────────── */}
      <header className="c4-container relative">
          <div className="c4-panel relative rounded-[22px] px-6 py-6 text-center sm:px-7">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Bow s={44} />
            </div>
            <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
              ♡ cats for mental health ♡
            </h1>
            <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
              we help stray cats at UH!{' '}
              <span className="text-accent">ദ്ദി ˉ͈̀꒳ˉ͈́ )✧</span>
            </p>
          </div>
        <ScallopStrip />
      </header>

      <NavBar />

      <div className="c4-container">
        {/* ── hero: gallery + story ──────────────────────────── */}
        {/* 60/40 carousel-to-story, held exactly at every width from lg up (fr
            units split the space after the gap). Stacks below lg — the same
            breakpoint where the officers grid drops off 6-across, so the two
            sections always reflow together. */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[60fr_40fr]">
          {/* min-w-0: the carousel canvas has an intrinsic width, which would
              otherwise set this grid track's min-content floor and stop `1fr`
              from ever shrinking. */}
          <section className="c4-panel min-w-0 rounded-[18px] p-3.5 lg:sticky lg:top-6 lg:self-start">
            <p className="text-ink/70 m-0 mb-2 text-sm">✿ just some of our cute campus cats ✿</p>
            {/* Stacked (below lg) the panel is full-width, where a 3:2 box would
                be enormous — use a capped height there, aspect only side-by-side. */}
            <div className="relative h-[300px] sm:h-[380px] md:h-[440px] lg:aspect-[3/2] lg:h-auto">
              <CircularGallery
                ref={galleryRef}
                bend={3}
                textColor="#5c4678"
                borderRadius={0.05}
                scrollEase={0.02}
                font="30px 'Patrick Hand', cursive"
                onChange={handleSlideChange}
              />
            </div>
            {/* carousel controls — dot count comes from the gallery itself */}
            <div className="mt-2 flex justify-center gap-2">
              <DotButton label="Previous cat" onClick={() => galleryRef.current?.prev()}>
                ←
              </DotButton>
              {Array.from({ length: slide.total }, (_, i) => (
                <DotButton
                  key={i}
                  label={`Go to cat ${i + 1} of ${slide.total}`}
                  active={i === slide.index}
                  onClick={() => galleryRef.current?.goTo(i)}
                >
                  ·
                </DotButton>
              ))}
              <DotButton label="Next cat" onClick={() => galleryRef.current?.next()}>
                →
              </DotButton>
            </div>
          </section>

          <section className="c4-panel min-w-0 rounded-[18px] p-3.5 lg:self-start">
            <h2 className="font-pix text-accent m-0 text-xl">★ our story</h2>

            <img
              src={lear}
              alt="Lear the cat"
              className="border-line float-left mt-2.5 mr-3 mb-2 w-28 rounded-xl border-[1.5px] object-cover sm:w-32"
            />

            <div className="text-ink mt-2.5 text-[15px] leading-relaxed">
              <p className="mb-3">
                It started in 2017 — two brothers, <b>Hamlet</b> and <b>Lear</b>, arrived at the
                University of Houston after Hurricane Harvey. These young cats quickly captured the
                hearts of students and faculty who banded together to care for them. Though Hamlet
                eventually disappeared, Lear remained and became a beloved campus fixture.
              </p>
              <p className="mb-3">
                When Lear brought home his partner, <b>Momma</b>, the feeding group officially became
                UH Campus Cats. Together they raised their son Napolean, who later found his own
                mate, Natasha. The campus cat family grew, and so did our community of dedicated
                volunteers.
              </p>
              <p className="mb-3">
                As the university raised concerns about the cats' public presence, we microchipped
                them and found them safe homes. That challenge inspired us to evolve: we rebranded as
                "Cats for Mental Health" and became a registered student organization at UH,
                focusing on education about TNR (Trap-Neuter-Return) and rescue work.
              </p>
              <p className="mb-0">
                In 2023, about a year after being adopted, Lear went missing and the club lost
                contact with his adopter. The heartbreak of losing him led to the founding of{' '}
                <b>Lear's Legacy Cat Rescue</b>, a non-profit providing TNR and rescue services for
                Houston-area cats.
              </p>

              <div className="border-line bg-soft mt-3 clear-left rounded-md border border-dashed p-2.5 text-sm">
                Today, both the club and the rescue carry on the legacy of Lear and Momma — helping
                stray and feral cats across campus and beyond. ♡
              </div>
            </div>
          </section>
        </div>

        {/* ── officers ───────────────────────────────────────── */}
        <section className="c4-panel mt-3.5 rounded-[18px] p-3.5">
          <div className="mb-3 flex flex-wrap items-baseline gap-2.5">
            <h2 className="font-pix text-accent m-0 text-[22px]">♡ meet our officers</h2>
            <span className="text-ink/70 text-sm">(all volunteers, all cat people)</span>
          </div>

          <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3 lg:grid-cols-6">
            {OFFICERS.map((p, i) => (
              <li
                key={p.name}
                className="border-line rounded-[14px] border-[1.5px] p-2.5 text-center"
                style={{ background: CHIPS[i % CHIPS.length] }}
              >
                <img
                  src={p.img}
                  alt={p.name}
                  className="bg-panel mx-auto h-[70px] w-[70px] rounded-full border-2 border-white object-cover"
                />
                <p className="text-ink mt-1.5 mb-0 text-sm font-bold">{p.name}</p>
                <p className="text-ink/80 m-0 text-xs">{p.role}</p>
                <p className="text-ink/70 mt-1 mb-0 text-[11px] italic">"{p.quote}"</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Home
