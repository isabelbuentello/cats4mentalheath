import NavBar from '../components/NavBar.jsx'
import { Link } from 'react-router-dom';
import CatMapWithMarkers from '../components/CatMap.jsx';
import { ScallopStrip } from '../components/Decor.jsx';
import useIsAdmin from '../hooks/useIsAdmin.js';

function MapPage() {
  const { isAdmin } = useIsAdmin();

  return (
    <div className="c4-gingham c4-scope font-hand min-h-screen py-6 sm:py-8">
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-6 py-6 text-center sm:px-7">
          <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
            ♡ map ♡
          </h1>
          <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
            here's where you can find the kitties!
          </p>
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
          <section className="c4-panel mb-3.5 rounded-[18px] p-4 text-center">
            <p className="text-ink m-0 text-[15px] leading-relaxed">
              Click on a cat to view each zone.
            </p>
          </section>

          <CatMapWithMarkers />
        </div>
    </div>
  )
}

export default MapPage;  