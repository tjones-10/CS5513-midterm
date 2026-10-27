"use server";

import { addReviewToBook } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

// This is a Server Action
// https://next.js.org/docs/app/building-your-application/data-fetching/server-actions
// Replace the function below
export async function handleReviewFormSubmission(data) {
  // Create a Firebase app context using the current request's session cookie.
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Get the Firestore instance associated with that authenticated app.
  const db = getFirestore(firebaseServerApp);

  // Save the submitted review fields to the selected book.
  await addReviewToBook(db, data.get("bookId"), {
    text: data.get("text"),
    rating: data.get("rating"),

    // This came from a hidden form field.
    userId: data.get("userId"),
  });
}
