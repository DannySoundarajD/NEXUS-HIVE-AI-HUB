import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEHLUZ-i2Ua6nLFmvzP1GFr03_c-rzB3A",
  authDomain: "nexus-hive-ai-hub.firebaseapp.com",
  projectId: "nexus-hive-ai-hub",
  storageBucket: "nexus-hive-ai-hub.firebasestorage.app",
  messagingSenderId: "748958163139",
  appId: "1:748958163139:web:7a1704506ab53825fd8276",
  measurementId: "G-JYRSM77XF0"
  };



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };