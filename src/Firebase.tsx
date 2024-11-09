import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDZlguhINNQYKVwX6Bd4DnYwfw-xR9wIYI",
    authDomain: "real-estate-07b.firebaseapp.com",
    projectId: "real-estate-07b",
    storageBucket: "real-estate-07b.appspot.com",
    messagingSenderId: "11602001737",
    appId: "1:11602001737:web:a6206331aadd2e14cd6498",
    measurementId: "G-7QRB93TG2W"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
//const analytics = getAnalytics(app);
