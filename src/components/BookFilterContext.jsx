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
const filterKeys = ["author", "category", "price", "sort"];

function filtersFromSearchParams(searchParams) {
  return Object.fromEntries(
    filterKeys.map((key) => [key, searchParams.get(key) || ""])
  );
}

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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [filters, setFilters] = useState(() =>
    filtersFromSearchParams(searchParams)
  );
  const filtersRef = useRef(filters);

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
  const context = useContext(BookFilterContext);
  if (!context) {
    throw new Error("useBookFilters must be used within a BookFilterProvider");
  }
  return context;
}
