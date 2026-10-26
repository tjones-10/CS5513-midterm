// Import Firebase Storage helpers for creating references, uploading files, and retrieving URLs.
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Import the app's configured Firebase Storage instance.
import { storage } from "@/src/lib/firebase/clientApp";

// Import the Firestore helper that saves an image URL on a book record.
import { updateBookImageReference } from "@/src/lib/firebase/firestore";

// Upload a book image, save its URL, and return the URL to the caller.
export async function updateBookImage(bookId, image) {
  // Catch validation, upload, and Firestore errors so they can be logged.
  try {
    // Reject missing book IDs before attempting any storage operations.
    if (!bookId) {
      throw new Error("No book ID has been provided.");
    }

    // Reject missing files or file-like values without a name.
    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }

    // Upload the image and retrieve its public download URL.
    const publicImageUrl = await uploadImage(bookId, image);
    // Store the URL on the corresponding book document.
    await updateBookImageReference(bookId, publicImageUrl);

    // Return the saved image URL so the caller can update its UI.
    return publicImageUrl;
  // Log failures instead of silently swallowing them.
  } catch (error) {
    console.error("Error processing request:", error);
  }
}

// Store one file under the book's image folder and return its download URL.
async function uploadImage(bookId, image) {
  // Build a predictable storage path using the book ID and file name.
  const filePath = `images/${bookId}/${image.name}`;
  // Create a Firebase Storage reference for that path.
  const newImageRef = ref(storage, filePath);
  // Upload the selected file to Firebase Storage.
  await uploadBytesResumable(newImageRef, image);

  // Ask Firebase Storage for a URL that can be used to retrieve the uploaded file.
  return await getDownloadURL(newImageRef);
}
