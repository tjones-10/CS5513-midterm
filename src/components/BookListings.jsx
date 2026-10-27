"use client";

// This component handles the book listings page and its live book results.

import Link from "next/link";
import { React, useState, useEffect } from "react";
import renderStars from "@/src/components/Stars.jsx";
import { getBooksSnapshot } from "@/src/lib/firebase/firestore.js";
import { useBookFilters } from "@/src/components/BookFilterContext.jsx";

// Link a single book card to the corresponding detail page.
const BookItem = ({ book }) => (
  <li key={book.id}>
    <Link href={`/book/${book.id}`}>
      <ActiveBook book={book} />
    </Link>
  </li>
);

// Compose the cover and details that make up a book card.
const ActiveBook = ({ book }) => (
  <div>
    <ImageCover photo={book.photo} name={book.name} />
    <BookCardDetails book={book} />
  </div>
);

// Display the cover image with the book title as its alternative text.
const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

// Present the title, rating, and metadata below a book's cover.
const BookCardDetails = ({ book }) => (
  <div className="book__details">
    <h2>{book.name}</h2>
    <BookRating book={book} />
    <BookMetadata book={book} />
  </div>
);

// Show the average star rating and total number of reviews.
const BookRating = ({ book }) => (
  <div className="book__rating">
    <ul>{renderStars(book.avgRating)}</ul>
    <span>({book.numRatings})</span>
  </div>
);

// Display the category, author, and price tier for a book.
const BookMetadata = ({ book }) => (
  <div className="book__meta">
    <p>
      {book.category} | {book.author}
    </p>
    <p>{"$".repeat(book.price)}</p>
  </div>
);

export default function BookListings({ initialBooks }) {
  // Start with the server-fetched results to render cards immediately.
  const [books, setBooks] = useState(initialBooks);
  // Read the filters shared with the header menu.
  const { filters } = useBookFilters();

  // Subscribe to matching book changes and refresh when filter values change.
  useEffect(() => {
    return getBooksSnapshot((data) => {
      setBooks(data);
    }, filters);
  }, [filters]);

  // Render the current live book results as cards.
  return (
    <article>
      <ul className="books">
        {books.map((book) => (
          <BookItem key={book.id} book={book} />
        ))}
      </ul>
    </article>
  );
}
