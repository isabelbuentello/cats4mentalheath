import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "./config.js"; // Import the auth service from your config file

/**
 * Signs a user in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, error: string}>}
 */
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Sign-in successful
    return { user: userCredential.user, error: null };
  } catch (error) {
    // Handle errors
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
    // Sign-up successful
    return { user: userCredential.user, error: null };
  } catch (error) {
    // Handle errors
    return { user: null, error: error.message };
  }
};


export const logOut = () => {
  return signOut(auth);
};