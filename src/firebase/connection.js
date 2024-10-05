// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCppKyFDiC6qSWoS25mP4f-7DUfJ05BWl8",
  authDomain: "ourspace-9703c.firebaseapp.com",
  projectId: "ourspace-9703c",
  storageBucket: "ourspace-9703c.appspot.com",
  messagingSenderId: "829335148222",
  appId: "1:829335148222:web:94ebc43b2d3ea171e1b0ef",
  measurementId: "G-T3YWVB2JGV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);