import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCQc1bkQ77D_b3fcjbMCYuDIPo2nVnLM10",
  authDomain: "expanse-c7a7d.firebaseapp.com",
  projectId: "expanse-c7a7d",
  storageBucket: "expanse-c7a7d.firebasestorage.app",
  messagingSenderId: "661110599744",
  appId: "1:661110599744:web:0ba0ddf22d9b5e15332fa5",
  measurementId: "G-1DSF6BD8WW",
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);

// Initialize Analytics conditionally (it requires window)
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;
