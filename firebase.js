import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCq5cpp75mgqaLRHIVyThDDdpIyoft8S7c",
//   authDomain: "angerissueapp.firebaseapp.com",
//   projectId: "angerissueapp",
//   storageBucket: "angerissueapp.appspot.com",
//   messagingSenderId: "808956841944",
//   appId: "1:808956841944:web:abfdf585a97e3919262cad",
//   measurementId: "G-LBWY1TYYLE",
// };
const firebaseConfig = {
  apiKey: "AIzaSyAn9fTGHAUm_WK17Gn2aT-X6iC000it5as",
  authDomain: "otpgeneration-48635.firebaseapp.com",
  databaseURL: "https://otpgeneration-48635-default-rtdb.firebaseio.com",
  projectId: "otpgeneration-48635",
  storageBucket: "otpgeneration-48635.firebasestorage.app",
  messagingSenderId: "509533964356",
  appId: "1:509533964356:web:0e5be87c06582164ac5411",
  measurementId: "G-4D7LVJ5SV1",
};

let app;
console.log(getApps().length, "here is total firebase instance length");
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
console.log(getApps().length, "here is total firebase instance length");

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage), // Persist auth state using AsyncStorage
});

const db = getFirestore(app);

export { app, auth, db };
