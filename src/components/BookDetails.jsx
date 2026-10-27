// This component shows book metadata, and offers some actions to the user like uploading a new book image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const BookDetails = ({
  book,
  userId,
  handleBookImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  // Render the book's cover, metadata, optional actions, and nested content.
  return (
    <section className="img__section">
      <img src={book.photo} alt={book.name} />

      <div className="actions">
        {userId && (
          <img
            alt="review"
            className="review"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
          />
        )}
        <label
          onChange={(event) => handleBookImage(event.target)}
          htmlFor="upload-image"
          className="add"
        >
          <input
            name=""
            type="file"
            id="upload-image"
            className="file-input hidden w-full h-full"
          />

          <img className="add-image" src="/add.svg" alt="Add image" />
        </label>
      </div>

      <div className="details__container">
        <div className="details">
          <h2>{book.name}</h2>

          <div className="book__rating">
            <ul>{renderStars(book.avgRating)}</ul>

            <span>({book.numRatings})</span>
          </div>

          <p>
            {book.category} | {book.author}
          </p>
          <p>{"$".repeat(book.price)}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default BookDetails;
