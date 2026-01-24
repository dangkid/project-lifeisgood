import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCV5-Hg2sn-2IHkRnoZsvT5FMKQY8vyVTs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aac-lifeisgood.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aac-lifeisgood",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aac-lifeisgood.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "243791133486",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:243791133486:web:63541314ad7decc9ca58bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
