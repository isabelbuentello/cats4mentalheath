import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar.jsx';
import '../styles/login.css';
import { logOut } from '../firebase/auth.js';
import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from "firebase/auth";
import { initializeFirebaseUI, resetFirebaseUI } from '../firebase/firebaseui.js';

function LoginPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser) {
        // Only initialize UI when logged out
        setTimeout(() => initializeFirebaseUI(), 100);
      }
    });
    
    return () => {
      unsubscribe();
      resetFirebaseUI();
    };
  }, []);

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
      <div>
        <NavBar />
        <h1 className='log-title'>Member Login</h1>
        <div className='log-container'>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <h1 className='log-title'>Member Login</h1>
      <div className='log-container'>
        {user ? (
          <div>
            <p>Welcome, {user.email}!</p>
            <button onClick={handleLogout}>Log Out</button>
          </div>
        ) : (
          <div id="firebaseui-auth-container"></div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;