import * as firebaseui from 'firebaseui';
import { auth } from './config.js';
import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';

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
      signInSuccessWithAuthResult: () => false,
    },
  };

  ui.start('#firebaseui-auth-container', uiConfig);
};

export const resetFirebaseUI = () => {
  if (ui) {
    ui.reset();
  }
};