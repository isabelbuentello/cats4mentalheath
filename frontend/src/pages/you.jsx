import NavBar from '../components/NavBar.jsx';
import { Link } from 'react-router-dom';
import VolunteerActivityGraph from '../components/VolunteerActivityGraph.jsx';
import UserProfile from '../components/UserProfile.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import UserHoursBadge from '../components/UserHoursBadge.jsx';
import { ScallopStrip } from '../components/Decor.jsx';
import useIsAdmin from '../hooks/useIsAdmin.js';

function YouPage() {
  const { isAdmin } = useIsAdmin();

  return (
    <div className="c4-gingham c4-scope font-hand min-h-screen py-6 sm:py-8">
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-6 py-6 text-center sm:px-7">
          <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
            ♡ your profile ♡
          </h1>
          <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
            your shifts, your hours, your stats
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
        {isAdmin ? (
          <>
            <Link to="/feeding-instructions">
              <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
                feeding instructions
              </button>
            </Link>
            <Link to="/admin" className="col-span-2">
              <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-accent)', color: 'var(--color-panel)' }}>
                admin
              </button>
            </Link>
          </>
        ) : (
          <Link to="/feeding-instructions" className="col-span-2">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
              feeding instructions
            </button>
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="c4-container">
        {/* Desktop Layout - 3 columns */}
        <div className="hidden gap-2.5 lg:grid lg:grid-cols-3">
          {/* Left Column - Activity Graph (spans 2 columns) */}
          <div className="flex min-w-0 flex-col gap-2.5 lg:col-span-2">
            <VolunteerActivityGraph />
            <Leaderboard />
          </div>

          {/* Right Column - User Profile */}
          <div className="flex min-w-0 flex-col gap-2.5 lg:col-span-1">
            <UserProfile />
            <UserHoursBadge />
          </div>
        </div>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className="flex flex-col gap-2.5 lg:hidden">
          <UserProfile />
          <UserHoursBadge />
          <VolunteerActivityGraph />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

export default YouPage;