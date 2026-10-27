"use client";

// This component handles the book listings page and its live book results.

import Link from "next/link";
import { React, useState, useEffect } from "react";
import renderStars from "@/src/components/Stars.jsx";
import { getBooksSnapshot } from "@/src/lib/firebase/firestore.js";
import { useBookFilters } from "@/src/components/BookFilterContext.jsx";

const BookItem = ({ book }) => (
  <li key={book.id}>
    <Link href={`/book/${book.id}`}>
      <ActiveBook book={book} />
    </Link>
  </li>
);

const ActiveBook = ({ book }) => (
  <div>
    <ImageCover photo={book.photo} name={book.name} />
    <BookCardDetails book={book} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const BookCardDetails = ({ book }) => (
  <div className="book__details">
    <h2>{book.name}</h2>
    <BookRating book={book} />
    <BookMetadata book={book} />
  </div>
);

const BookRating = ({ book }) => (
  <div className="book__rating">
    <ul>{renderStars(book.avgRating)}</ul>
    <span>({book.numRatings})</span>
  </div>
);

const BookMetadata = ({ book }) => (
  <div className="book__meta">
    <p>
      {book.category} | {book.author}
    </p>
    <p>{"$".repeat(book.price)}</p>
  </div>
);

export default function BookListings({ initialBooks }) {
  const [books, setBooks] = useState(initialBooks);
  const { filters } = useBookFilters();

  useEffect(() => {
    return getBooksSnapshot((data) => {
      setBooks(data);
    }, filters);
  }, [filters]);

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
