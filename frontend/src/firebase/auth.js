import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config.js";

/**
 * Signs a user in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, error: string}>}
 */
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user document exists, create if it doesn't
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || null,
        photoURL: userCredential.user.photoURL || null,
        isApproved: false,
        isAdmin: false,
        appliedAt: new Date(),
        approvedAt: null,
        approvedBy: null
      });
    }
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Creates a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, error: string}>}
 */
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || null,
      photoURL: userCredential.user.photoURL || null,
      isApproved: false,  // New users need approval
      isAdmin: false,
      appliedAt: new Date(),
      approvedAt: null,
      approvedBy: null
    });
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logOut = () => {
  return signOut(auth);
};