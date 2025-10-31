

// CORRECTIF DÉFINITIF: Utiliser les imports de compatibilité pour faire fonctionner la syntaxe v8 avec le SDK v9+.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialiser Firebase Authentication et obtenir une référence au service
export const auth = firebase.auth();

// Initialiser Firebase Analytics
export const analytics = firebase.analytics();
