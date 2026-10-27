import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase/clientApp";

// Subscribe a callback to changes in the current Firebase user.
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

// Subscribe a callback to Firebase ID-token changes for session syncing.
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

// Sign in through Google's popup flow and log provider errors.
export async function signInWithGoogle() {
  // Configure Google as the authentication provider for the popup.
  const provider = new GoogleAuthProvider();

  // Surface sign-in failures in the browser console for diagnosis.
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

// Sign out the current Firebase user and log any errors.
export async function signOut() {
  // Return Firebase's sign-out promise so callers can observe completion.
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}
