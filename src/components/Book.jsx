"use client";

// Enable client-side hooks and event handlers for the book view.
// This component displays a book using data supplied by its server page.

// Import React tools for state, effects, and nested fallback rendering.
import { React, useState, useEffect, Suspense } from "react";
// Import Next.js's dynamic loader for the review dialog.
import dynamic from "next/dynamic";
// Import the Firestore subscription used to keep book data current.
import { getBookSnapshotById } from "@/src/lib/firebase/firestore.js";
// Import the hook that provides the signed-in user.
import { useUser } from "@/src/lib/getUser";
// Import the component that displays book details.
import BookDetails from "@/src/components/BookDetails.jsx";
// Import the helper that uploads a book image and saves its URL.
import { updateBookImage } from "@/src/lib/firebase/storage.js";

// Load the review dialog on demand instead of including it in the initial bundle.
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// Render a book and receive its initial server data and child content.
export default function Book({
  id,
  initialBook,
  initialUserId,
  children,
}) {
  // Store the displayed book data, initialized from the server page.
  const [bookDetails, setBookDetails] = useState(initialBook);
  // Track whether the review dialog should currently be visible.
  const [isOpen, setIsOpen] = useState(false);

  // Prefer the live user ID, falling back to the ID passed from the server.
  const userId = useUser()?.uid || initialUserId;
  // Store the text and rating being entered into the review form.
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  // Update one review field while preserving the other field's current value.
  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  // Upload a newly selected book image and update displayed details.
  async function handleBookImage(target) {
    // Read the first selected file, or use null when no file was selected.
    const image = target.files ? target.files[0] : null;
    // Stop if the input does not contain a file.
    if (!image) {
      return;
    }

    // Upload the image and persist its download URL for this book.
    const imageURL = await updateBookImage(id, image);
    // Update local state so the new image appears immediately.
    setBookDetails({ ...bookDetails, photo: imageURL });
  }

  // Close the review dialog and clear the form for its next use.
  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  // Subscribe to Firestore updates and unsubscribe when the book ID changes.
  useEffect(() => {
    // Update the displayed details whenever Firestore sends a new snapshot.
    return getBookSnapshotById(id, (data) => {
      setBookDetails(data);
    });
  // Recreate the subscription when viewing another book.
  }, [id]);

  // Render book details, nested content, and the review dialog if signed in.
  return (
    // Use a fragment to return multiple sibling elements without an extra wrapper.
    <>
      {/* Pass current book state and actions down to the details component. */}
      <BookDetails
        book={bookDetails}
        userId={userId}
        handleBookImage={handleBookImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {/* Render content supplied by the server page inside book details. */}
        {children}
      </BookDetails>
      {/* Only signed-in users see the review dialog, with a fallback while it loads. */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          {/* Supply dialog state, callbacks, and IDs to the review form. */}
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
