import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCq5cpp75mgqaLRHIVyThDDdpIyoft8S7c",
  authDomain: "angerissueapp.firebaseapp.com",
  projectId: "angerissueapp",
  storageBucket: "angerissueapp.appspot.com",
  messagingSenderId: "808956841944",
  appId: "1:808956841944:web:abfdf585a97e3919262cad",
  measurementId: "G-LBWY1TYYLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore with specific settings for React Native
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  console.error('Persistence error:', err);
});

export { auth, db }; 