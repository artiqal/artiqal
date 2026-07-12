export const FAVOURITE_STORAGE_KEY = "artiqal:favourite-activities";
export const FAVOURITES_UPDATED_EVENT = "artiqal:favourites-updated";

export const getActivityFavouriteKey = (activity) => activity?.slug || activity?.id || activity?.title || "";

export const readStoredFavourites = () => {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const storedValue = window.localStorage.getItem(FAVOURITE_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return new Set(Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : []);
  } catch {
    return new Set();
  }
};

export const writeStoredFavourites = (favourites) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FAVOURITE_STORAGE_KEY, JSON.stringify([...favourites]));
  } catch {
    // Keep the UI in sync even if browser storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent(FAVOURITES_UPDATED_EVENT));
};
