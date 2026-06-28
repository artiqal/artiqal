import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getActivitySortOptions } from "@/lib/activitySort";

const ActivitySortContext = createContext(null);

const defaultControls = {
  active: false,
  searchQuery: "",
  sortMode: "relevance",
  sortOptions: getActivitySortOptions(),
  setSearchQuery: () => {},
  setSortMode: () => {},
};

export function ActivitySortProvider({ children }) {
  const [controls, setControls] = useState(defaultControls);

  const registerActivitySortControls = useCallback((nextControls) => {
    setControls({
      ...defaultControls,
      ...nextControls,
      active: true,
    });

    return () => setControls(defaultControls);
  }, []);

  const value = useMemo(
    () => ({
      ...controls,
      registerActivitySortControls,
    }),
    [controls, registerActivitySortControls],
  );

  return <ActivitySortContext.Provider value={value}>{children}</ActivitySortContext.Provider>;
}

export function useActivitySort() {
  return useContext(ActivitySortContext) || {
    ...defaultControls,
    registerActivitySortControls: () => () => {},
  };
}
