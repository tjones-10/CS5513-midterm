"use client";

import React, { useState, useEffect } from "react";
import { getReviewsSnapshotByBookId } from "@/src/lib/firebase/firestore.js";
import { Review } from "@/src/components/Reviews/Review";

// Keep a book's review list synchronized with live Firestore updates.
export default function ReviewsListClient({
  initialReviews,
  bookId,
  userId,
}) {
  // Seed the client list with reviews already fetched by the server.
  const [reviews, setReviews] = useState(initialReviews);

  // Subscribe to changes for this book and release the old subscription on change.
  useEffect(() => {
    return getReviewsSnapshotByBookId(bookId, (data) => {
      setReviews(data);
    });
  }, [bookId]);
  // Render reviews or explain how to add the first review.
  return (
    <article>
      <ul className="reviews">
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review) => (
              <Review
                key={review.id}
                rating={review.rating}
                text={review.text}
                timestamp={review.timestamp}
              />
            ))}
          </ul>
        ) : (
          <p>
            This book has not been reviewed yet,{" "}
            {!userId ? "first login and then" : ""} add your own review!
          </p>
        )}
      </ul>
    </article>
  );
}
