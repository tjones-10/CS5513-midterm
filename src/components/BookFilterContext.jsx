"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const BookFilterContext = createContext(null);
// Keep URL parsing aligned with the filter fields used by Firestore queries.
const filterKeys = ["author", "category", "price", "sort"];

// Read each supported filter from the current URL, defaulting missing values.
function filtersFromSearchParams(searchParams) {
  return Object.fromEntries(
    filterKeys.map((key) => [key, searchParams.get(key) || ""])
  );
}

// Build a URL containing only selected filters for the specified route.
function buildFilterUrl(pathname, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      queryParams.set(key, value);
    }
  }

  const queryString = queryParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function BookFilterProvider({ children }) {
  // Read the active route, navigation API, and route query parameters.
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  // Initialize shared state from the URL so direct links restore filter choices.
  const [filters, setFilters] = useState(() =>
    filtersFromSearchParams(searchParams)
  );
  // Preserve the latest filter values for updates before React rerenders.
  const filtersRef = useRef(filters);

  // Refresh filter state after URL navigation, including browser history changes.
  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const urlFilters = filtersFromSearchParams(
      new URLSearchParams(searchParamsString)
    );
    filtersRef.current = urlFilters;
    setFilters(urlFilters);
  }, [pathname, searchParamsString]);

  // Apply filter changes locally and navigate to the matching query URL.
  const updateFilters = useCallback(
    (update) => {
      const nextFilters =
        typeof update === "function" ? update(filtersRef.current) : update;
      filtersRef.current = nextFilters;
      setFilters(nextFilters);

      if (pathname === "/") {
        router.push(buildFilterUrl(pathname, nextFilters));
      }
    },
    [pathname, router]
  );

  // Expose the values and updater to the header and listing components.
  return (
    <BookFilterContext.Provider
      value={{
        filters,
        setFilters: updateFilters,
        isListingsPage: pathname === "/",
      }}
    >
      {children}
    </BookFilterContext.Provider>
  );
}

export function useBookFilters() {
  // Retrieve shared filter data and surface provider-usage mistakes explicitly.
  const context = useContext(BookFilterContext);
  if (!context) {
    throw new Error("useBookFilters must be used within a BookFilterProvider");
  }
  return context;
}
