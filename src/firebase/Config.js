import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIMMc6LX1wiywJmRyxrBYYsPQG7qcgNWA",
  authDomain: "track-my-class-e4f6a.firebaseapp.com",
  projectId: "track-my-class-e4f6a",
  storageBucket: "track-my-class-e4f6a.firebasestorage.app",
  messagingSenderId: "296444215772",
  appId: "1:296444215772:web:3749f71be7acaeab5f4f19",
  measurementId: "G-PK26NE6V37",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
