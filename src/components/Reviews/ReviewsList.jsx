// This component handles the list of reviews for a given book

import React from "react";
import { getReviewsByBookId } from "@/src/lib/firebase/firestore.js";
import ReviewsListClient from "@/src/components/Reviews/ReviewsListClient";
import { ReviewSkeleton } from "@/src/components/Reviews/Review";
import { getFirestore } from "firebase/firestore";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";

// Fetch the initial reviews on the server and hand them to the live client list.
export default async function ReviewsList({ bookId, userId }) {
  // Create the authenticated Firebase context for this page request.
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Load the selected book's current reviews from Firestore.
  const reviews = await getReviewsByBookId(
    getFirestore(firebaseServerApp),
    bookId
  );

  // Pass the initial results and book/user identifiers to the client component.
  return (
    <ReviewsListClient
      initialReviews={reviews}
      bookId={bookId}
      userId={userId}
    />
  );
}

// Display placeholder rows matching the expected review count during loading.
export function ReviewsListSkeleton({ numReviews }) {
  // Render one skeleton item for each expected review.
  return (
    <article>
      <ul className="reviews">
        <ul>
          {Array(numReviews)
            .fill(0)
            .map((value, index) => (
              <ReviewSkeleton key={`loading-review-${index}`} />
            ))}
        </ul>
      </ul>
    </article>
  );
}
