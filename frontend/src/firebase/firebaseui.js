import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar.jsx';
import { logOut, logIn, signUp } from '../firebase/auth.js';
import { auth, db } from '../firebase/config.js';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';

const DEFAULT_AVATAR = "/assets/darkbrowncat.png";

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
    // Success handled by onAuthStateChanged
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
      <div className="min-h-screen">
        <NavBar />
        <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>
        <div className="flex flex-col items-center px-4 py-8">
          <h1 className="text-white text-center text-3xl md:text-4xl lg:text-5xl">
            Member Login
          </h1>
          <div className="mt-16">
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"> 
      <NavBar />

      <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>
      
      <div className="flex flex-col items-center min-h-screen px-4 py-8 md:px-4 md:py-8">
        <h1 className="text-white text-center text-3xl md:text-4xl lg:text-5xl">
          Member Login
        </h1>
        
        <p className="mt-10 mb-10 text-[#b28ab7] text-center w-full max-w-2xl">
          sign up/log in to access our c4mh portal! <br />
          in our portal, you can access our volunteer signup sheet, add to our cat album, and more!
        </p>
        
        <div className="bg-[#9fc8a7] p-8 md:p-12 rounded-3xl w-full md:w-[70%] max-w-3xl mt-16">
          {user ? (
            <div className="text-center">
              <p className="text-white text-lg mb-4">Welcome, {user.email}!</p>
              <button 
                onClick={handleLogout}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              {/* FirebaseUI-style card */}
              <div className="bg-white rounded-lg shadow-md">
                
                {/* Google Sign-In Button - FirebaseUI style */}
                <div className="p-6 border-b border-gray-200">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center px-6">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-gray-500 text-sm">or</span>
                  </div>
                </div>

                {/* Email/Password Form - FirebaseUI style */}
                <form onSubmit={handleEmailPasswordSubmit} className="p-6 pt-0">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="name@example.com"
                        disabled={authLoading}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Choose a password"
                        disabled={authLoading}
                        minLength={6}
                        required
                      />
                    </div>

                    {isSignUp && (
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm your password"
                          disabled={authLoading}
                          minLength={6}
                          required
                        />
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {authLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                  </div>
                </form>

                {/* Toggle Sign Up/Sign In */}
                <div className="px-6 pb-6 pt-2 text-center border-t border-gray-200 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                      setConfirmPassword('');
                    }}
                    disabled={authLoading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;