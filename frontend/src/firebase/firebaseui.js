import * as firebaseui from 'firebaseui';
import { auth, db } from './config.js';
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import 'firebaseui/dist/firebaseui.css';

const DEFAULT_AVATAR = "/assets/darkbrowncat.png";

let ui = null;

export const initializeFirebaseUI = () => {
  // Completely reset UI each time
  if (ui) {
    ui.delete();
  }
  
  ui = new firebaseui.auth.AuthUI(auth);
  
  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
      EmailAuthProvider.PROVIDER_ID, // Simple, no custom config
    ],
    callbacks: {
      signInSuccessWithAuthResult: async (authResult) => {
        const user = authResult.user;
        console.log('=== SIGN-IN SUCCESS ===');
        console.log('Email:', user.email);
        console.log('Provider:', authResult.credential?.providerId || authResult.additionalUserInfo.providerId);
        
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            console.log('Creating Firestore document...');
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName || null,
              photoURL: user.photoURL || DEFAULT_AVATAR,
              isApproved: false,
              isAdmin: false,
              appliedAt: new Date(),
              approvedAt: null,
              approvedBy: null
            });
            console.log('✓ Document created');
          }
        } catch (error) {
          console.error('Error with Firestore:', error);
        }
        
        return false; // Don't redirect automatically
      },
    },
  };

  ui.start('#firebaseui-auth-container', uiConfig);
};

export const resetFirebaseUI = () => {
  if (ui) {
    ui.delete();
    ui = null;
  }
};