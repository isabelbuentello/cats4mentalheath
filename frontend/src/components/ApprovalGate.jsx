import React, { useState, useEffect } from 'react';
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
      <div className="flex items-center justify-center p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Session timed out - user was logged in before but isn't now
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center border-4 border-yellow-300">
        <div className="text-4xl mb-3">⏱️</div>
        <h3 className="text-xl font-bold mb-2">Session Expired</h3>
        <div className="text-gray-700 mb-3">
          <p>Your session has timed out for security reasons.</p>
          <p className="mt-2">Please log in again to continue.</p>
        </div>
        <button
          onClick={() => window.location.href = '/login'} // Update with your login route
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors mt-3"
        >
          Log In Again
        </button>
      </div>
    );
  }

  // User is logged in but not approved
  if (!isApproved) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center border-4 border-orange-300">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="text-xl font-bold mb-2">Approval Required</h3>
        <div className="text-gray-700 mb-3">
          <p>Thanks for your interest in volunteering to feed our campus cats!</p>
          <p>
            If you haven't completed your training orientation with an officer, please fill out{' '}
            <a 
              href="https://forms.gle/3TWKgvE5iEQVugFJA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-semibold"
            >
              this form
            </a>
            , and an officer will reach out shortly.
          </p>
          <p>  <br/> or if your connection timed out... </p>
           <Link to="/you-page">
              <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Back to Profile
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