import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAc7vqg4MINabljErnQg_cKlrHxol2uVI8",
  authDomain: "debugly-ai-801.firebaseapp.com",
  projectId: "debugly-ai-801",
  storageBucket: "debugly-ai-801.firebasestorage.app",
  messagingSenderId: "17086383324",
  appId: "1:17086383324:web:2bd49f6c6f88a725ebe019"
};

// Initialize Firebase for SSR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
