import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null as any;
export const auth = isFirebaseConfigured ? getAuth(app) : null as any;
export const db = isFirebaseConfigured ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null as any;

export default app;
