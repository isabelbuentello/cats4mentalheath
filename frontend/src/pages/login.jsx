import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar.jsx';
import { ScallopStrip } from '../components/Decor.jsx';
import { logOut, logIn, signUp } from '../firebase/auth.js';
import { auth, db } from '../firebase/config.js';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';

const DEFAULT_AVATAR = "/assets/darkbrowncat.png";

/* Shared page shell so the loading, signed-in, and form states all sit in the
   same frame instead of jumping around between renders. */
function LoginShell({ children }) {
  return (
    <div className="c4-gingham c4-scope font-hand relative min-h-screen py-6 sm:py-8">
      <header className="c4-container relative">
        <div className="c4-panel rounded-[22px] px-6 py-6 text-center sm:px-7">
          <h1 className="font-pix text-accent m-0 text-2xl leading-tight tracking-wide sm:text-4xl">
            ♡ member login ♡
          </h1>
          <p className="text-ink mt-1 mb-0 text-base sm:text-lg">
            sign up or log in to access the c4mh portal
          </p>
        </div>
        <ScallopStrip />
      </header>

      <NavBar />

      <div className="c4-container">{children}</div>
    </div>
  );
}

function LoginPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log('User signed in:', currentUser.email);

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          console.log('✓ User document found in Firestore');

          // Self-heal a drifted email. The users doc is keyed by uid, but the
          // leaderboard and activity graph match feeding slots to volunteers by
          // EMAIL — so if users.email ever diverges from the auth email (a typo
          // when the doc was hand-created, an address change), that volunteer
          // silently disappears from both. Auth is the source of truth.
          const stored = userDoc.data().email;
          if (currentUser.email && stored !== currentUser.email) {
            console.warn(`Repairing users/${currentUser.uid}.email: "${stored}" → "${currentUser.email}"`);
            await setDoc(userDocRef, { email: currentUser.email }, { merge: true });
          }
        } else {
          console.warn('⚠ User document not found!');
        }

        navigate('/volunteer');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await logIn(email, password);

    if (result.error) {
      setError(result.error);
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setAuthLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: result.user.email,
          displayName: result.user.displayName || null,
          photoURL: result.user.photoURL || DEFAULT_AVATAR,
          isApproved: false,
          isAdmin: false,
          appliedAt: new Date(),
          approvedAt: null,
          approvedBy: null
        });
      }
    } catch (err) {
      setError(err.message);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <LoginShell>
        <section className="c4-panel mx-auto max-w-md rounded-[18px] p-8 text-center">
          <p className="font-pix text-accent m-0 text-xl">signing you in…</p>
        </section>
      </LoginShell>
    );
  }

  if (user) {
    return (
      <LoginShell>
        <section className="c4-panel mx-auto max-w-md rounded-[18px] p-6 text-center">
          <p className="text-ink m-0 mb-4 text-lg">Welcome, {user.email}!</p>
          <button onClick={handleLogout} className="c4-btn" style={{ background: 'var(--color-soft)' }}>
            log out
          </button>
        </section>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <section className="c4-panel mx-auto max-w-md rounded-[18px] p-5 sm:p-6">
        <p className="text-ink m-0 mb-5 text-center text-[15px] leading-relaxed">
          In our portal you can access the volunteer signup sheet, add to our cat album, and more!
        </p>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          className="c4-btn flex w-full items-center justify-center gap-3"
          style={{ background: 'var(--color-panel)' }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>sign in with Google</span>
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <span className="border-line h-0 flex-1 border-t border-dashed" />
          <span className="text-ink/60 text-sm">or</span>
          <span className="border-line h-0 flex-1 border-t border-dashed" />
        </div>

        {/* Email/Password */}
        <form onSubmit={handleEmailPasswordSubmit}>
          <div className="flex flex-col gap-3.5">
            <div>
              <label htmlFor="email" className="text-ink mb-1.5 block text-sm font-bold">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="c4-input"
                placeholder="name@example.com"
                disabled={authLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="text-ink mb-1.5 block text-sm font-bold">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="c4-input"
                placeholder="at least 6 characters"
                disabled={authLoading}
                minLength={6}
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="text-ink mb-1.5 block text-sm font-bold">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="c4-input"
                  placeholder="confirm your password"
                  disabled={authLoading}
                  minLength={6}
                  required
                />
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="m-0 rounded-[10px] border p-3 text-sm"
                style={{ borderColor: '#d99a9a', background: '#fbeeee', color: '#8f4b4b' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="c4-btn mt-1 w-full"
              style={{ background: 'var(--color-accent)', color: 'var(--color-panel)' }}
            >
              {authLoading ? 'loading…' : isSignUp ? 'sign up' : 'sign in'}
            </button>
          </div>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div className="border-line mt-5 border-t border-dashed pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setConfirmPassword('');
            }}
            disabled={authLoading}
            className="text-accent text-sm underline decoration-dotted underline-offset-2 disabled:opacity-50"
            style={{ padding: 0, border: 'none', background: 'none' }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </section>
    </LoginShell>
  );
}

export default LoginPage;
