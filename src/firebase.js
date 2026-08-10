import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXJzD-K5S1OCRBAnq7o9deaopuNptP3ho",
  authDomain: "neet-syllabus-tracker-73a20.firebaseapp.com",
  projectId: "neet-syllabus-tracker-73a20",
  storageBucket: "neet-syllabus-tracker-73a20.firebasestorage.app",
  messagingSenderId: "612613123010",
  appId: "1:612613123010:web:85e820df19f44ab404445b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);