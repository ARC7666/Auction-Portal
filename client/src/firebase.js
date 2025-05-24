// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpSXlF7kIJ6YmCrx7leVEG0xuESBG3yi4",
  authDomain: "auction-portal-in.firebaseapp.com",
  projectId: "auction-portal-in",
  storageBucket: "auction-portal-in.firebasestorage.app", 
  messagingSenderId: "1063006090514",
  appId: "1:1063006090514:web:fe7df10e4e35e880f02fcb",
  measurementId: "G-QJEN9460XT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);

// ✅ Force Google account selection popup
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

// Export required modules
export { auth, provider, db , storage };