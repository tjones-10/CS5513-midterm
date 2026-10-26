import BookListings from "@/src/components/BookListings.jsx";
import { getBooks } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it

export const dynamic = "force-dynamic";

// This line also forces this route to be server-side rendered
// export const revalidate = 0;

export default async function Home(props) {
  const searchParams = await props.searchParams;
  // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
  // ?author=Jane%20Austen&category=Fiction&sort=Review
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const books = await getBooks(
    getFirestore(firebaseServerApp),
    searchParams
  );
  return (
    <main className="main__home">
      <BookListings
        initialBooks={books}
        searchParams={searchParams}
      />
    </main>
  );
}
