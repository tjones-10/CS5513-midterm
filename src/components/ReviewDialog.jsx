"use client";

// Enable browser-side React hooks and event handlers in this dialog component.
// This component submits its form through a Next.js Server Action.

// Import the hooks used to control the native dialog element and its lifecycle.
import { useEffect, useLayoutEffect, useRef } from "react";
// Import the control that lets the user select a review rating.
import RatingPicker from "@/src/components/RatingPicker.jsx";
// Import the server-side action that saves the submitted review.
import { handleReviewFormSubmission } from "@/src/app/actions.js";

// Define the dialog and its callback and data props.
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  // Keep a reference to the native HTML dialog element.
  const dialog = useRef();

  // Synchronize the native dialog's open state before the browser paints.
  useLayoutEffect(() => {
    // Open the dialog modally when the parent marks it as open.
    if (isOpen) {
      dialog.current.showModal();
    // Close it when the parent marks it as closed.
    } else {
      dialog.current.close();
    }
  // Re-run when the open state changes.
  }, [isOpen, dialog]);

  // Handle a mouse press on the dialog surface.
  const handleClick = (e) => {
    // Close only when the backdrop itself was pressed, not dialog contents.
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  // Render the dialog, review form, and its controls; the ref enables native modal behavior.
  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      {/* Send submitted fields to the server action and close on submit. */}
      <form
        action={handleReviewFormSubmission}
        onSubmit={() => {
          handleClose();
        }}
      >
        {/* Identify the purpose of the form. */}
        <header>
          <h3>Add your review</h3>
        </header>
        {/* Collect the rating, review text, and related record identifiers. */}
        <article>
          {/* Render the rating input control. */}
          <RatingPicker />

          {/* Group the required review text input in a paragraph. */}
          <p>
            {/* Use required text input controlled by React, forwarding edits to the parent. */}
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          {/* Include the restaurant ID as a form value without displaying it. */}
          <input type="hidden" name="restaurantId" value={id} />
          {/* Include the submitting user's ID as a hidden form value. */}
          <input type="hidden" name="userId" value={userId} />
        </article>
        {/* Place form actions in the footer. */}
        <footer>
          {/* Group the cancel and submit buttons. */}
          <menu>
            {/* Reset the form and close the dialog when canceled. */}
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>
            {/* Submit the review form to the server action. */}
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog;
