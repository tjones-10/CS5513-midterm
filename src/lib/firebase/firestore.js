// Import the helper that supplies sample restaurant and review data.
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

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
  getFirestore,
} from "firebase/firestore";

// Import the application's configured Firestore database for client-side helpers.
import { db } from "@/src/lib/firebase/clientApp";

// Save an uploaded image URL to the photo field of a restaurant document.
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // Build a reference to the restaurant document using its ID.
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  // Update the document's photo URL if the reference exists.
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Update a restaurant's rating totals and write the new rating in one transaction.
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  // Read the restaurant inside the transaction to get the latest rating totals.
  const restaurant = await transaction.get(docRef);
  // Extract the document's stored restaurant fields.
  const data = restaurant.data();
  // Increment the rating count, treating a missing or zero count as the first rating.
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  // Add this review's numeric rating to the existing sum, defaulting to zero.
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  // Calculate the new average based on the updated sum and count.
  const newAverage = newSumRating / newNumRatings;

  // Store the updated count, sum, and average on the restaurant document.
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


// Validate review inputs and transactionally save the review and restaurant totals.
export async function addReviewToRestaurant(db, restaurantId, review) {
  // Reject calls that do not identify a restaurant.
  if (!restaurantId) {
    throw new Error("No restaurant ID has been provided.");
  }

  // Reject calls that do not include review data.
  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  // Perform document creation and aggregate updates as a single Firestore transaction.
  try {
    // Reference the restaurant record that will receive the rating aggregates.
    const docRef = doc(collection(db, "restaurants"), restaurantId);
    // Create a reference for a new rating in this restaurant's ratings subcollection.
    const newRatingDocument = doc(
      collection(db, `restaurants/${restaurantId}/ratings`),
    );

    // Atomically update the restaurant aggregates and create the rating record.
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review),
    );
  // Log transaction failures and rethrow them so callers can handle the error.
  } catch (error) {
    console.error(
      "There was an error adding the rating to the restaurant",
      error,
    );
    throw error;
  }
}


// Apply optional category, city, price, and sort choices to a Firestore query.
function applyQueryFilters(q, { category, city, price, sort }) {
  // Restrict results to the selected category when one was provided.
  if (category) {
    q = query(q, where("category", "==", category));
  }
  // Restrict results to the selected city when one was provided.
  if (city) {
    q = query(q, where("city", "==", city));
  }
  // Match the selected price tier using the number of symbols in its value.
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  // Sort by highest average rating by default or when Rating was selected.
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  // Otherwise sort by the restaurants with the most reviews when requested.
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the query with all applicable constraints.
  return q;
}

// Fetch restaurant documents once and return their data as plain objects.
export async function getRestaurants(db = db, filters = {}) {
  // Begin with a query over the restaurants collection.
  let q = query(collection(db, "restaurants"));

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


// Subscribe to live restaurant query updates and pass converted results to a callback.
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Validate the callback before opening a Firestore subscription.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Start a query for all restaurants.
  let q = query(collection(db, "restaurants"));
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

    // Deliver the updated restaurant list to the subscriber's callback.
    cb(results);
  });
}


// Fetch one restaurant document and convert its timestamp for application use.
export async function getRestaurantById(db, restaurantId) {
  // Log and stop when the requested restaurant ID is missing.
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  // Build a reference to the requested restaurant document.
  const docRef = doc(db, "restaurants", restaurantId);
  // Fetch the restaurant document from Firestore.
  const docSnap = await getDoc(docRef);
  // Return document fields with its timestamp converted to a JavaScript Date.
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Subscribe to live updates for one restaurant and pass each converted record to a callback.
export function getRestaurantSnapshotById(restaurantId, cb) {
  // Log and stop when no restaurant ID was supplied.
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }

  // Ensure the consumer provided a function to receive document updates.
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create a reference to the requested restaurant record.
  const docRef = doc(db, "restaurants", restaurantId);
  // Subscribe and convert each snapshot to an object with a JavaScript Date timestamp.
  return onSnapshot(docRef, (docSnap) => {
    // Pass the converted restaurant data to the caller's callback.
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}


// Fetch reviews for one restaurant, newest first, and return them as plain objects.
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Log and stop if the requested restaurant ID is missing.
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Query the restaurant's ratings subcollection ordered by newest timestamp first.
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
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

// Subscribe to live review changes for a restaurant and deliver converted reviews to a callback.
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Log and stop if no restaurant ID was provided.
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Query the restaurant's ratings in descending timestamp order.
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
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

// Create sample restaurants and ratings in Firestore for development or testing.
export async function addFakeRestaurantsAndReviews() {
  // Generate the sample restaurant and review records.
  const data = await generateFakeRestaurantsAndReviews();
  // Process each restaurant and its associated sample ratings.
  for (const { restaurantData, ratingsData } of data) {
    // Catch write errors for this restaurant so the loop can continue.
    try {
      // Create the restaurant document and retain its generated ID.
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add every associated rating under the new restaurant's subcollection.
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    // Log failures while writing this restaurant's sample documents.
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
