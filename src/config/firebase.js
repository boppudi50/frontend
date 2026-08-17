import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB26fG1gEDQJX3zZmLcAqbFM4FkmbfEUo8",
  authDomain: "stockflow-1336b.firebaseapp.com",
  projectId: "stockflow-1336b",
  storageBucket: "stockflow-1336b.firebasestorage.app",
  messagingSenderId: "741098210435",
  appId: "1:741098210435:web:725c74e824e40ea41707b6",
  measurementId: "G-XC43BJPYL9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
