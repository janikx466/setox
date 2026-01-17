import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Default Firebase configuration
const defaultConfig = {
  apiKey: "AIzaSyBSwAYozBnPZsNczvp6P-J_DLv28ifczmM",
  authDomain: "foxo-services.firebaseapp.com",
  projectId: "foxo-services",
  storageBucket: "foxo-services.firebasestorage.app",
  messagingSenderId: "1050096262408",
  appId: "1:1050096262408:web:a5f56b9e89df6daf4c60bd"
};

// Get config from localStorage or use default
const getFirebaseConfig = () => {
  try {
    const savedConfig = localStorage.getItem('firebaseConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch {
    // Ignore parse errors
  }
  return defaultConfig;
};

const config = getFirebaseConfig();
export const app: FirebaseApp = initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const updateFirebaseConfig = (newConfig: typeof defaultConfig) => {
  localStorage.setItem('firebaseConfig', JSON.stringify(newConfig));
  window.location.reload();
};

export const getCloudinaryName = (): string => {
  return localStorage.getItem('cloudinaryName') || '';
};

export const setCloudinaryName = (name: string) => {
  localStorage.setItem('cloudinaryName', name);
};
