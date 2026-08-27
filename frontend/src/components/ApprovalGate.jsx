import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

function ApprovalGate({ children, requireApproval = false }) {
  const [isApproved, setIsApproved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      if (!currentUser) {
        setIsApproved(false);
        setLoading(false);
        return;
      }

      // User is logged in, check approval status
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          setIsApproved(userDoc.data().isApproved || false);
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // If not requiring approval, show content regardless
  if (!requireApproval) {
    return <>{children}</>;
  }

  // Still checking authentication
  if (loading || !authChecked) {
    return (
      <div className="c4-panel rounded-[18px] p-8 text-center">
        <p className="font-pix text-accent m-0 text-xl">loading…</p>
      </div>
    );
  }

  // Session timed out - user was logged in before but isn't now
  if (!user) {
    return (
      <div className="c4-panel font-hand rounded-[18px] p-6 text-center">
        <div className="mb-3 text-4xl">⏱️</div>
        <h3 className="font-pix text-accent m-0 mb-2 text-xl">session expired</h3>
        <div className="text-ink mb-3">
          <p className="m-0">Your session has timed out for security reasons.</p>
          <p className="mt-2 mb-0">Please log in again to continue.</p>
        </div>
        <button
          onClick={() => window.location.href = '/login'} // Update with your login route
          className="c4-btn mt-3"
          style={{ background: 'var(--color-accent)', color: 'var(--color-panel)' }}
        >
          log in again
        </button>
      </div>
    );
  }

  // User is logged in but not approved
  if (!isApproved) {
    return (
      <div className="c4-panel font-hand rounded-[18px] p-6 text-center">
        <div className="mb-3 text-4xl">🔒</div>
        <h3 className="font-pix text-accent m-0 mb-2 text-xl">approval required</h3>
        <div className="text-ink mb-3">
          <p className="m-0">Thanks for your interest in volunteering to feed our campus cats!</p>
          <p className="mt-2 mb-0">
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
          <p className="mt-4 mb-0">or if your connection timed out…</p>
          <Link to="/you-page">
            <button className="c4-btn mt-3" style={{ background: 'var(--color-chip-1)' }}>
              back to profile
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // User is approved, show the actual content
  return <>{children}</>;
}

export default ApprovalGate;