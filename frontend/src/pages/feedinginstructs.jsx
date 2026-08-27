import NavBar from '../components/NavBar.jsx'
import { Link } from 'react-router-dom';
import { ScallopStrip } from '../components/Decor.jsx';
import useIsAdmin from '../hooks/useIsAdmin.js';
import CrestLink from '../components/CrestLink.jsx';

function FeedingInstructionsPage() {
  const { isAdmin } = useIsAdmin();

  return (
    <div className="c4-gingham c4-scope font-hand min-h-screen py-6 sm:py-8">
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-4 py-5 text-center sm:px-6">
          <div className="flex items-center justify-between gap-3 sm:gap-5">
            <CrestLink />
            <div className="min-w-0 flex-1 text-center">
            <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
              ♡ how to feed ♡
            </h1>
            <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
              everything you need for a feeding shift
            </p>
            </div>
            <CrestLink decorative />
          </div>
        </div>
        <ScallopStrip />
      </header>

      <NavBar startCollapsed={true} />

      {/* Desktop Navigation */}
        <div className="c4-scope hidden md:flex justify-center items-center gap-3 py-6 px-4">
            <Link to="/volunteer">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-2)' }}>
                volunteer
            </button>
            </Link>
            <Link to="/map-page">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-5)' }}>
                map
            </button>
            </Link>
            <Link to="/ourcats">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-3)' }}>
                our cats
            </button>
            </Link>
            <Link to="/feeding-instructions"> 
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
                feeding instructions
            </button>
            </Link>
            <Link to="/you-page" className="col-span-2"> 
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-1)' }}>
                you
            </button>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="col-span-2">
                <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-accent)', color: 'var(--color-panel)' }}>
                  admin
                </button>
              </Link>
            )}
        </div>

        {/* Mobile Navigation */}
        <div className="c4-scope md:hidden grid grid-cols-2 gap-2.5 p-4">
            <Link to="/volunteer">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-2)' }}>
                volunteer
            </button>
            </Link>
            <Link to="/ourcats">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-3)' }}>
                our cats
            </button>
            </Link>
            <Link to="/map-page">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-5)' }}>
                map
            </button>
            </Link>
            <Link to="/you-page">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-1)' }}>
                you
            </button>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="col-span-2">
                <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-accent)', color: 'var(--color-panel)' }}>
                  admin
                </button>
              </Link>
            )}
            <Link to="/feeding-instructions" className="col-span-2">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
                feeding instructions
            </button>
            </Link>
        </div>

        <div className="c4-container">
        {/* Card 1 - Full Width */}
        <div className="c4-panel mb-2.5 rounded-[18px] p-4 text-center sm:p-5">
        <h2 className="font-pix text-accent m-0 mb-3 text-xl sm:text-2xl">★ hi campus volunteer!</h2>
        <div className="text-ink space-y-2 leading-relaxed">
            <p className="m-0">Thanks for your interest in volunteering to feed our campus cats!</p>
            <p className="m-0">
            If you haven't completed your training orientation with an officer, please fill out{' '}
            <a
                href="https://forms.gle/3TWKgvE5iEQVugFJA"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted underline-offset-2"
            >
                <span className="text-accent font-bold">this form</span>
            </a>
            , and an officer will reach out shortly.
            </p>
            <p className="m-0">If you have completed training, here are some quick reminders on how to feed!</p>
        </div>
        </div>

        {/* 2x2 Grid for remaining cards */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {/* Card 2 */}
            <div className="c4-panel rounded-[18px] p-4 text-center sm:p-5">
            <h2 className="font-pix text-accent m-0 mb-3 text-xl sm:text-2xl">♡ feeding locations</h2>
            <p className="text-ink m-0 mb-3">We have 3 feeding locations!</p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {['Equal Opportunity Building', 'Zone D Parking Lot', 'Law Center & Loft Area'].map((loc, i) => (
                  <li
                    key={loc}
                    className="border-line text-ink rounded-[12px] border-[1.5px] px-3 py-2"
                    style={{ background: `var(--color-chip-${i + 2})` }}
                  >
                    {loc}
                  </li>
                ))}
            </ul>
            <p className="text-ink/80 m-0 mt-3 text-sm">Feel free to pick just 1, or 2, or even all of them!</p>
            </div>

            {/* Card 3 */}
            <div className="c4-panel rounded-[18px] p-4 text-center sm:p-5">
            <h2 className="font-pix text-accent m-0 mb-3 text-xl sm:text-2xl">♡ how much?</h2>
            <div className="text-ink flex flex-col gap-2.5">
                <div className="border-line rounded-[12px] border-[1.5px] p-3" style={{ background: 'var(--color-chip-2)' }}>
                <h3 className="font-pix m-0 mb-1 text-lg">AM shift</h3>
                <ul className="m-0 list-none p-0">
                    <li>One can of wet food</li>
                    <li>One scoop of dry food</li>
                </ul>
                </div>
                <div className="border-line rounded-[12px] border-[1.5px] p-3" style={{ background: 'var(--color-chip-3)' }}>
                <h3 className="font-pix m-0 mb-1 text-lg">PM shift</h3>
                <ul className="m-0 list-none p-0">
                    <li>One scoop of dry food</li>
                </ul>
                </div>
                <p className="border-line bg-soft m-0 rounded-md border border-dashed p-2.5 text-sm">Please change water for every shift &amp; ensure bowls are clean!</p>
            </div>
            </div>

            {/* Card 4 */}
            <div className="c4-panel rounded-[18px] p-4 text-center sm:p-5">
            <h2 className="font-pix text-accent m-0 mb-3 text-xl sm:text-2xl">♡ recommended supplies</h2>
            <ul className="text-ink m-0 flex list-none flex-col gap-1.5 p-0">
                <li>Ziploc/Plastic bag of dry food</li>
                <li>Wet food cans</li>
                <li>Water container</li>
                <li>Plastic bags for trash</li>
                <li>Disposable gloves/utensils/napkins (optional)</li>
            </ul>
            <p className="border-line bg-soft text-ink m-0 mt-3 rounded-md border border-dashed p-2.5 text-sm">All found in our feeding lounge!</p>
            </div>

            {/* Card 5 */}
            <div className="c4-panel rounded-[18px] p-4 text-center sm:p-5">
            <h2 className="font-pix text-accent m-0 mb-3 text-xl sm:text-2xl">♡ reminders</h2>
            <ul className="text-ink m-0 flex list-none flex-col gap-2 p-0 text-left">
                <li className="border-line bg-soft rounded-md border border-dashed p-2.5">If you are the only person feeding a station that day, please provide an extra scoop of dry food.</li>
                <li className="border-line bg-soft rounded-md border border-dashed p-2.5">Please remember to sign up in our portal before feeding!</li>
                <li className="border-line bg-soft rounded-md border border-dashed p-2.5">Don't forget to send a pic of fed stations to our Discord Volunteering channel for proof of volunteering!</li>
            </ul>
            </div>
        </div>
        </div>
    </div>
    )
    }

export default FeedingInstructionsPage;

