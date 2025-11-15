import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "c4mh-2c42b.firebaseapp.com",
  projectId: "c4mh-2c42b",
  storageBucket: "c4mh-2c42b.firebasestorage.app",
  messagingSenderId: "971997711443",
  appId: "1:971997711443:web:b5a460d325a7146b9ecaa6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
