import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

// Generate sample book records and associated reviews for the demo dataset.
export async function generateFakeBooksAndReviews() {
  // Limit each generation request to five sample books.
  const booksToAdd = 5;
  // Collect the generated book and rating pairs for the caller.
  const data = [];

  // Build each book and its related review records.
  for (let i = 0; i < booksToAdd; i++) {
    // Give each book a random creation time in the past.
    const bookTimestamp = Timestamp.fromDate(getRandomDateBefore());

    // Start an empty list that will hold this book's ratings.
    const ratingsData = [];

    // Generate a random number of ratings/reviews for this book
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(bookTimestamp.toDate())
      );

      // Choose random review text and rating, plus an author ID and date.
      const ratingData = {
        rating:
          randomData.bookReviews[
            randomNumberBetween(0, randomData.bookReviews.length - 1)
          ].rating,
        text: randomData.bookReviews[
          randomNumberBetween(0, randomData.bookReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      // Add the new review to this book's pending ratings.
      ratingsData.push(ratingData);
    }

    // Compute the average rating, using zero when the book has no reviews.
    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    // Choose the book's metadata and calculate its review aggregates.
    const bookData = {
      category:
        randomData.bookCategories[
          randomNumberBetween(0, randomData.bookCategories.length - 1)
        ],
      name: randomData.bookNames[
        randomNumberBetween(0, randomData.bookNames.length - 1)
      ],
      avgRating,
      author:
        randomData.bookAuthors[
          randomNumberBetween(0, randomData.bookAuthors.length - 1)
        ],
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      price: randomNumberBetween(1, 4),
      photo: randomData.bookCovers[
        randomNumberBetween(0, randomData.bookCovers.length - 1)
      ],
      timestamp: bookTimestamp,
    };

    // Keep book fields paired with their nested ratings for Firestore writes.
    data.push({
      bookData,
      ratingsData,
    });
  }
  // Return all generated records without writing them to Firestore here.
  return data;
}
