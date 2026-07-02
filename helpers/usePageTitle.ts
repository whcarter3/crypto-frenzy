import { useEffect } from 'react';

/**
 * Sets the document title for a route. Replaces next/head now that
 * pages render entirely client-side.
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
