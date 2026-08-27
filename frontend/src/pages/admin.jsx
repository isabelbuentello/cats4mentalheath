import NavBar from '../components/NavBar.jsx';
import { Link } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel.jsx';
import VolunteerHoursTracker from '../components/VolunteerHoursTracker.jsx';
import { ScallopStrip } from '../components/Decor.jsx';
import useIsAdmin from '../hooks/useIsAdmin.js';

/* Shared shell so the loading, denied, and dashboard states share one frame. */
function AdminShell({ children }) {
  return (
    <div className="c4-gingham c4-scope font-hand min-h-screen py-6 sm:py-8">
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-6 py-6 text-center sm:px-7">
          <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
            ♡ admin dashboard ♡
          </h1>
          <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
            approvals, volunteers, and logged hours
          </p>
        </div>
        <ScallopStrip />
      </header>

      <NavBar startCollapsed={true} />

      {children}
    </div>
  );
}

function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return (
      <AdminShell>
        <div className="c4-container">
          <section className="c4-panel rounded-[18px] p-8 text-center">
            <p className="font-pix text-accent m-0 text-xl">checking access…</p>
          </section>
        </div>
      </AdminShell>
    );
  }

  if (!isAdmin) {
    return (
      <AdminShell>
        <div className="c4-container">
          <section className="c4-panel mx-auto max-w-md rounded-[18px] p-6 text-center">
            <div className="mb-3 text-5xl">🔒</div>
            <h2 className="font-pix text-accent m-0 mb-2 text-xl sm:text-2xl">admin access required</h2>
            <p className="text-ink mb-4">
              This page is only accessible to administrators.
            </p>
            <Link to="/you-page">
              <button className="c4-btn" style={{ background: 'var(--color-chip-1)' }}>
                back to profile
              </button>
            </Link>
          </section>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
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
            <Link to="/feeding-instructions" className="col-span-2">
            <button className="c4-btn w-full" style={{ fontSize: '20px', background: 'var(--color-chip-4)' }}>
                feeding instructions
            </button>
            </Link>
        </div>

      {/* Main Content */}
      <div className="c4-container flex flex-col gap-2.5">
        <AdminPanel />
        <VolunteerHoursTracker />
      </div>
    </AdminShell>
  );
}

export default AdminPage;