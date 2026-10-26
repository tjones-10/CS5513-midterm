"use client";

// This components handles the book listings page
// It receives data from src/app/page.js, such as the initial books and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getBooksSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

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

export default function BookListings({
  initialBooks,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    author: searchParams.author || "",
    category: searchParams.category || "",
    price: searchParams.price || "",
    sort: searchParams.sort || "",
  };

  const [books, setBooks] = useState(initialBooks);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getBooksSnapshot((data) => {
      setBooks(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="books">
        {books.map((book) => (
          <BookItem key={book.id} book={book} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
