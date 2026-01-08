import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar.jsx';
import { logOut } from '../firebase/auth.js';
import { auth, db } from '../firebase/config.js';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebaseUI, resetFirebaseUI } from '../firebase/firebaseui.js';

function LoginPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
  
      if (currentUser) {
        console.log('User signed in:', currentUser.email);
        
        // Wait a moment for Firestore document to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify user document exists
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log('✓ User document found in Firestore');
          console.log('Document data:', userDoc.data());
        } else {
          console.warn('⚠ User document not found! This should not happen.');
        }
        
        // User just logged in - redirect to volunteer page
        navigate('/volunteer');
      } else {
        // User is logged out - show login form
        setTimeout(() => initializeFirebaseUI(), 100);
      }
      
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
      resetFirebaseUI();
    };
  }, [navigate]);

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
      <div className="min-h-screen bg-[#dfbfdf]">
        <NavBar />
        <h1 className="text-white text-center text-3xl md:text-4xl py-8">Member Login</h1>
        <div className="bg-[#9fc8a7] px-8 py-12 rounded-3xl w-[70%] mx-auto mt-16">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfbfdf]"> 
      <NavBar />

      {/* Spacer div */}
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
            <div id="firebaseui-auth-container"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;