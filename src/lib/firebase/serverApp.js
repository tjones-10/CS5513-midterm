// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

import { cookies } from "next/headers";
import { initializeServerApp, initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
export async function getAuthenticatedAppForUser() {
  // Read the ID token stored in the session cookie, if the request has one.
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  // Initialize an app instance bound to the current request's auth token.
  const firebaseServerApp = initializeServerApp(
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    initializeApp(),
    {
      authIdToken,
    }
  );

  // Wait until Firebase resolves the user associated with the token.
  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  // Return both the authenticated app and the resolved current user.
  return { firebaseServerApp, currentUser: auth.currentUser };
}
