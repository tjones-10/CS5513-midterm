// Prevent this component and its server-only dependencies from entering a browser bundle.
import "server-only";
// Import the Google AI plugin that provides Gemini models to Genkit.
import { googleAI } from "@genkit-ai/google-genai";
// Import the function used to create a Genkit AI instance.
import { genkit } from "genkit";
// Import the Firestore helper that retrieves reviews for one book.
import { getReviewsByBookId } from "@/src/lib/firebase/firestore.js";
// Import the helper that initializes the authenticated Firebase server app.
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// Import the Firestore accessor used with the authenticated app.
import { getFirestore } from "firebase/firestore";

// Retrieve book reviews and render an AI-generated summary.
export async function GeminiSummary({ bookId }) {
  // Initialize or retrieve the Firebase app for the current user.
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Query Firestore for the selected book's review records.
  const reviews = await getReviewsByBookId(
    getFirestore(firebaseServerApp),
    bookId
  );

  // Choose a character to separate review text in the model prompt.
  const reviewSeparator = "@";
  // Ask Gemini to summarize the reviews and append the review text to the prompt.
  const prompt = `
    Based on the following book reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the book. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  // Handle configuration and model-generation errors locally.
  try {
    // Require the Gemini API key so requests can authenticate with Google AI.
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://genkit.dev/docs/get-started/
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Create a Genkit instance with Google AI and the default Gemini Flash model.
    const ai = genkit({
      plugins: [googleAI()],
      model: googleAI.model("gemini-2.5-flash"),
    });
    // Generate a response from the assembled review prompt.
    const { text } = await ai.generate(prompt);

    // Render the generated summary and identify it as Gemini-generated.
    return (
      <div className="book__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
    // Log failures on the server and render a user-facing error message.
  } catch (e) {
    console.error(e);
    return <p>Error summarizing reviews.</p>;
  }
}

// Render the placeholder shown while the review summary is being prepared.
export function GeminiSummarySkeleton() {
  return (
    <div className="book__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
