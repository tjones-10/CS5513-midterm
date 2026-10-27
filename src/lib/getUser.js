"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "@/src/lib/firebase/clientApp.js";
import { useRouter } from "next/navigation";

// Expose the current Firebase user to client components.
export function useUser() {
  // Store the latest user supplied by Firebase Authentication.
  const [user, setUser] = useState();

  // Subscribe on mount and unsubscribe automatically when this hook is removed.
  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);

  // Return the current user, which is undefined until Firebase resolves auth.
  return user;
}
