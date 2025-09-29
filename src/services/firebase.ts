// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJKxWXUhGn0-GndFhCSE0kydrRTf2R9jI",
  authDomain: "questcreator-3826e.firebaseapp.com",
  projectId: "questcreator-3826e",
  storageBucket: "questcreator-3826e.firebasestorage.app",
  messagingSenderId: "499407524126",
  appId: "1:499407524126:web:05e4e69251467fd2cdb90f",
  measurementId: "G-XMP30DYTB8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore
export const realtimeDb = getDatabase(app); // Realtime Database
export const storage = getStorage(app);
// const analytics = getAnalytics(app); // Commented out for now

export default app;