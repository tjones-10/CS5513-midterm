"use client";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use automatic initialization
// https://firebase.google.com/docs/app-hosting/firebase-sdks#initialize-with-no-arguments
// Initialize the client Firebase app using the active App Hosting configuration.
export const firebaseApp = initializeApp();

// Export the authentication service used by client sign-in controls.
export const auth = getAuth(firebaseApp);
// Export the database service used for client-side Firestore operations.
export const db = getFirestore(firebaseApp);
// Export the storage service used for book cover uploads.
export const storage = getStorage(firebaseApp);
