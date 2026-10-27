"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
import { addFakeBooksAndReviews } from "@/src/lib/firebase/firestore.js";
import { setCookie, deleteCookie } from "cookies-next";
import Filters from "@/src/components/Filters.jsx";
import { useBookFilters } from "@/src/components/BookFilterContext.jsx";

function useUserSession(initialUser) {
  // Track Firebase auth-token changes and keep the server session cookie current.
  useEffect(() => {
    return onIdTokenChanged(async (user) => {
      // Save a fresh ID token for server requests, or remove it when signed out.
      if (user) {
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        await deleteCookie("__session");
      }
      // Reload only when the authenticated identity differs from server props.
      if (initialUser?.uid === user?.uid) {
        return;
      }
      window.location.reload();
    });
  }, [initialUser]);

  return initialUser;
}

export default function Header({ initialUser }) {
  // Read the current user and shared listing filters for header controls.
  const user = useUserSession(initialUser);
  const { filters, setFilters, isListingsPage } = useBookFilters();

  // Stop link navigation and trigger the Firebase sign-out operation.
  const handleSignOut = (event) => {
    event.preventDefault();
    signOut();
  };

  // Stop link navigation and start Google sign-in.
  const handleSignIn = (event) => {
    event.preventDefault();
    signInWithGoogle();
  };

  // Render the site title, account menu, and listing filters when applicable.
  return (
    <header>
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="The Bookworm" />
        The Bookworm
      </Link>
      <div className="header__actions">
        {user ? (
          <div className="profile">
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {user.displayName}
            </p>

            <div className="menu">
              <span className="menu__icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <ul>
                <li>{user.displayName}</li>

                <li>
                  <a href="#" onClick={addFakeBooksAndReviews}>
                    Add sample books
                  </a>
                </li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="profile">
            <a href="#" onClick={handleSignIn}>
              <img src="/profile.svg" alt="A placeholder user image" />
              Sign In with Google
            </a>
          </div>
        )}
        {isListingsPage && (
          <Filters filters={filters} setFilters={setFilters} />
        )}
      </div>
    </header>
  );
}
