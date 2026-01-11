import * as firebaseui from 'firebaseui';
import { auth, db } from './config.js';
import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import 'firebaseui/dist/firebaseui.css';

// Default avatar path
const DEFAULT_AVATAR = "/assets/darkbrowncat.png";

let ui = null;

export const initializeFirebaseUI = () => {
  if (!ui) {
    ui = new firebaseui.auth.AuthUI(auth);
  }
  
  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: async (authResult) => {
        // This callback fires AFTER successful sign-in
        const user = authResult.user;
        console.log('=== FIREBASEUI SIGN-IN SUCCESS ===');
        console.log('User:', user.email);
        console.log('UID:', user.uid);
        console.log('Is new user?', authResult.additionalUserInfo.isNewUser);
        
        try {
          // Check if user document exists
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            console.log('Creating user document in Firestore...');
            
            // Create user document with default avatar
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName || null,
              photoURL: user.photoURL || DEFAULT_AVATAR,
              isApproved: false,  // New users need approval
              isAdmin: false,
              appliedAt: new Date(),
              approvedAt: null,
              approvedBy: null
            });
            
            console.log('✓ User document created successfully!');
          } else {
            console.log('✓ User document already exists');
          }
        } catch (error) {
          console.error('❌ Error creating user document:', error);
        }
        
        // Return false to handle redirect manually
        return false;
      },
    },
  };

  ui.start('#firebaseui-auth-container', uiConfig);
};

export const resetFirebaseUI = () => {
  if (ui) {
    ui.reset();
  }
};