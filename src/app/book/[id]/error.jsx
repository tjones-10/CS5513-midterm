"use client"; // Error components must be Client Components

import { useEffect } from "react";

// Show a route-level recovery screen when the book page fails to render.
export default function Error({ error, reset }) {
  // Log the rendering error for diagnostics when it changes.
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Render the error message and let the user retry this route segment.
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
