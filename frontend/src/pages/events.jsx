import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import NavBar from '../components/NavBar.jsx';
import Calendar from '../components/Calendar.jsx';
import { ScallopStrip } from '../components/Decor.jsx';

function EventsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin || false);
        }
      }
      setLoading(false);
    };
    checkAdmin();
  }, []);

  return (
    <div className="c4-gingham c4-scope font-hand relative min-h-screen py-6 sm:py-8">
      {/* ── scalloped header bar ───────────────────────────── */}
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-6 py-6 text-center sm:px-7">
          <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
            ♡ upcoming events ♡
          </h1>
          <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
            on campus, off campus, and everywhere in between
          </p>
        </div>
        <ScallopStrip />
      </header>

      <NavBar />

      <div className="c4-container">
        <section className="c4-panel mb-3.5 rounded-[18px] p-4 text-center">
          <p className="text-ink m-0 text-[15px] leading-relaxed">
            Join CFMH for our upcoming events, both on and off campus. Follow us on{' '}
            <a
              href="https://www.instagram.com/cats4mentalhealth/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2"
            >
              <span className="text-accent">Instagram</span>
            </a>{' '}
            for all the latest event details and updates!
          </p>
        </section>

        {loading ? (
          <section className="c4-panel rounded-[18px] p-8 text-center">
            <p className="font-pix text-accent m-0 text-xl">loading events…</p>
          </section>
        ) : (
          <Calendar isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}

export default EventsPage;
