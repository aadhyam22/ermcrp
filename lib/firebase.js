import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCuOsUfyMlBL1B2Lz8IZS17Xy8YhJL-AsM",
    authDomain: "erp-crm-platform-dcead.firebaseapp.com",
    projectId: "erp-crm-platform-dcead",
    storageBucket: "erp-crm-platform-dcead.firebasestorage.app",
    messagingSenderId: "366097442299",
    appId: "1:366097442299:web:55f01ef3c909004b08975e",
    measurementId: "G-HYJBEQ1G99"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);