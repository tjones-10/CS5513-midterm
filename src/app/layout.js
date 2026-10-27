import "@/src/app/styles.css";
import Header from "@/src/components/Header.jsx";
import { BookFilterProvider } from "@/src/components/BookFilterContext.jsx";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it
export const dynamic = "force-dynamic";

export const metadata = {
  // Define the site name and description used by the browser and search results.
  title: "The Bookworm",
  description:
    "The Bookworm is a book review website built with Next.js and Firebase.",
};

export default async function RootLayout({ children }) {
  // Resolve the authenticated user for the shared navigation header.
  const { currentUser } = await getAuthenticatedAppForUser();
  // Wrap route content in shared filter state and the site header.
  return (
    <html lang="en">
      <body>
        <BookFilterProvider>
          <Header initialUser={currentUser?.toJSON()} />
          <main>{children}</main>
        </BookFilterProvider>
      </body>
    </html>
  );
}
