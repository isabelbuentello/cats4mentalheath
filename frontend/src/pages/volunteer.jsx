import NavBar from '../components/NavBar.jsx';
import { Link } from 'react-router-dom';
import WeeklyCalendar from '../components/WeeklyCalendar.jsx';
import ApprovalGate from '../components/ApprovalGate.jsx';
import { ScallopStrip } from '../components/Decor.jsx';
import useIsAdmin from '../hooks/useIsAdmin.js';

function VolunteerPage() {
  const { isAdmin } = useIsAdmin();

  return (
    <div className="c4-gingham c4-scope font-hand min-h-screen py-6 sm:py-8">
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-6 py-6 text-center sm:px-7">
          <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
            ♡ volunteer portal ♡
          </h1>
          <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
            claim a feeding shift and log your hours
          </p>
        </div>
        <ScallopStrip />
      </header>

      <NavBar startCollapsed={true} />

      {/* Desktop Navigation */}
      <div className="c4-container hidden md:flex justify-center items-center gap-3 py-4">
        <Link to="/volunteer" className="flex-1">
          <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-2)' }}>
            volunteer
          </button>
        </Link>
        <Link to="/map-page" className="flex-1">
          <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-5)' }}>
            map
          </button>
        </Link>
        <Link to="/ourcats" className="flex-1">
          <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-3)' }}>
            our cats
          </button>
        </Link>
        <Link to="/feeding-instructions" className="flex-1">
          <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
            feeding instructions
          </button>
        </Link>
        <Link to="/you-page" className="flex-1">
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
      <div className="c4-container md:hidden grid grid-cols-2 gap-2.5 py-4">
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

      {/* Calendar wrapped with approval check */}
      <div className="c4-container">
        <ApprovalGate requireApproval={true}>
          <WeeklyCalendar />
        </ApprovalGate>
      </div>
    </div>
  );
}

export default VolunteerPage;
