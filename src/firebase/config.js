// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
const firebaseConfig = {
  apiKey: "AIzaSyBgODoGbCEheXDdiWc2R3YZmq0S9YNXBKA",
  authDomain: "event-calender-3b58a.firebaseapp.com",
  projectId: "event-calender-3b58a",
  storageBucket: "event-calender-3b58a.firebasestorage.app",
  messagingSenderId: "592559697826",
  appId: "1:592559697826:web:09ccfae9ffd6e26d0eccfb"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);