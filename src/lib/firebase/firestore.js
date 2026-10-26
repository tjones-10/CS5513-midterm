// Import the helper that supplies sample book and review data.
import { generateFakeBooksAndReviews } from "@/src/lib/fakeBooks.js";

// Import Firestore query, document, subscription, and transaction operations.
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
} from "firebase/firestore";

// Import the application's configured Firestore database for client-side helpers.
import { db } from "@/src/lib/firebase/clientApp";

// Save an uploaded image URL to the photo field of a book document.
export async function updateBookImageReference(bookId, publicImageUrl) {
  // Build a reference to the book document using its ID.
  const bookRef = doc(collection(db, "books"), bookId);
  // Update the document's photo URL if the reference exists.
  if (bookRef) {
    await updateDoc(bookRef, { photo: publicImageUrl });
  }
}

// Update a book's rating totals and write the new rating in one transaction.
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  // Read the book inside the transaction to get the latest rating totals.
  const book = await transaction.get(docRef);
  // Extract the document's stored book fields.
  const data = book.data();
  // Increment the rating count, treating a missing or zero count as the first rating.
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  // Add this review's numeric rating to the existing sum, defaulting to zero.
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  // Calculate the new average based on the updated sum and count.
  const newAverage = newSumRating / newNumRatings;

  // Store the updated count, sum, and average on the book document.
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  // Create the rating document and add a Firestore timestamp to its fields.
  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};


// Validate review inputs and transactionally save the review and book totals.
export async function addReviewToBook(db, bookId, review) {
  // Reject calls that do not identify a book.
  if (!bookId) {
    throw new Error("No book ID has been provided.");
  }

  // Reject calls that do not include review data.
  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  // Perform document creation and aggregate updates as a single Firestore transaction.
  try {
    // Reference the book record that will receive the rating aggregates.
    const docRef = doc(collection(db, "books"), bookId);
    // Create a reference for a new rating in this book's ratings subcollection.
    const newRatingDocument = doc(
      collection(db, `books/${bookId}/ratings`),
    );

    // Atomically update the book aggregates and create the rating record.
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review),
    );
  // Log transaction failures and rethrow them so callers can handle the error.
  } catch (error) {
    console.error(
      "There was an error adding the rating to the book",
      error,
    );
    throw error;
  }
}


// Apply optional category, author, price, and sort choices to a Firestore query.
function applyQueryFilters(q, { category, author, price, sort }) {
  // Restrict results to the selected category when one was provided.
  if (category) {
    q = query(q, where("category", "==", category));
  }
  // Restrict results to the selected author when one was provided.
  if (author) {
    q = query(q, where("author", "==", author));
  }
  // Match the selected price tier using the number of symbols in its value.
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  // Sort by highest average rating by default or when Rating was selected.
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  // Otherwise sort by the books with the most reviews when requested.
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the query with all applicable constraints.
  return q;
}

// Fetch book documents once and return their data as plain objects.
export async function getBooks(db = db, filters = {}) {
  // Begin with a query over the books collection.
  let q = query(collection(db, "books"));

  // Add the requested filters and sort order to the query.
  q = applyQueryFilters(q, filters);
  // Execute the query and collect its matching documents.
  const results = await getDocs(q);
  // Convert each Firestore document into an object with an ID and JavaScript timestamp.
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}


// Subscribe to live book query updates and pass converted results to a callback.
export function getBooksSnapshot(cb, filters = {}) {
  // Validate the callback before opening a Firestore subscription.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Start a query for all books.
  let q = query(collection(db, "books"));
  // Apply the same optional filters and sorting as the one-time fetch helper.
  q = applyQueryFilters(q, filters);

  // Listen for changes and transform the current snapshot into plain objects.
  return onSnapshot(q, (querySnapshot) => {
    // Add each document ID and convert its Firestore timestamp to a Date.
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Deliver the updated book list to the subscriber's callback.
    cb(results);
  });
}


// Fetch one book document and convert its timestamp for application use.
export async function getBookById(db, bookId) {
  // Log and stop when the requested book ID is missing.
  if (!bookId) {
    console.log("Error: Invalid ID received: ", bookId);
    return;
  }
  // Build a reference to the requested book document.
  const docRef = doc(db, "books", bookId);
  // Fetch the book document from Firestore.
  const docSnap = await getDoc(docRef);
  // Return document fields with its timestamp converted to a JavaScript Date.
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Subscribe to live updates for one book and pass each converted record to a callback.
export function getBookSnapshotById(bookId, cb) {
  // Log and stop when no book ID was supplied.
  if (!bookId) {
    console.log("Error: Invalid ID received: ", bookId);
    return;
  }

  // Ensure the consumer provided a function to receive document updates.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create a reference to the requested book record.
  const docRef = doc(db, "books", bookId);
  // Subscribe and convert each snapshot to an object with a JavaScript Date timestamp.
  return onSnapshot(docRef, (docSnap) => {
    // Pass the converted book data to the caller's callback.
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}


// Fetch reviews for one book, newest first, and return them as plain objects.
export async function getReviewsByBookId(db, bookId) {
  // Log and stop if the requested book ID is missing.
  if (!bookId) {
    console.log("Error: Invalid bookId received: ", bookId);
    return;
  }

  // Query the book's ratings subcollection ordered by newest timestamp first.
  const q = query(
    collection(db, "books", bookId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Execute the reviews query.
  const results = await getDocs(q);
  // Convert the snapshot documents into review objects with IDs and JavaScript dates.
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Subscribe to live review changes for a book and deliver converted reviews to a callback.
export function getReviewsSnapshotByBookId(bookId, cb) {
  // Log and stop if no book ID was provided.
  if (!bookId) {
    console.log("Error: Invalid bookId received: ", bookId);
    return;
  }

  // Query the book's ratings in descending timestamp order.
  const q = query(
    collection(db, "books", bookId, "ratings"),
    orderBy("timestamp", "desc")
  );
  // Listen for updates to the matching reviews.
  return onSnapshot(q, (querySnapshot) => {
    // Convert the current documents into review objects with usable timestamps.
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // Send the current review list to the subscriber.
    cb(results);
  });
}

// Create sample books and ratings in Firestore for development or testing.
export async function addFakeBooksAndReviews() {
  // Generate the sample book and review records.
  const data = await generateFakeBooksAndReviews();
  // Process each book and its associated sample ratings.
  for (const { bookData, ratingsData } of data) {
    // Catch write errors for this book so the loop can continue.
    try {
      // Create the book document and retain its generated ID.
      const docRef = await addDoc(
        collection(db, "books"),
        bookData
      );

      // Add every associated rating under the new book's subcollection.
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "books", docRef.id, "ratings"),
          ratingData
        );
      }
    // Log failures while writing this book's sample documents.
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
