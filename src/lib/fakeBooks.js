import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

export async function generateFakeBooksAndReviews() {
  const booksToAdd = 5;
  const data = [];

  for (let i = 0; i < booksToAdd; i++) {
    const bookTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this book
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(bookTimestamp.toDate())
      );

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

      ratingsData.push(ratingData);
    }

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

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

    data.push({
      bookData,
      ratingsData,
    });
  }
  return data;
}
