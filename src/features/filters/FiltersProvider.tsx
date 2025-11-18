import React, { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_FILTERS, FilterState } from "./types";

type FiltersContextValue = {
  filters: FilterState;
  setFilters: (next: FilterState) => void;
  resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextValue | undefined>(
  undefined,
);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);

  const setFilters = (next: FilterState) => {
    setFiltersState(next);
  };

  const resetFilters = () => setFiltersState(DEFAULT_FILTERS);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      resetFilters,
    }),
    [filters],
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};

export const useFilters = (): FiltersContextValue => {
  const ctx = useContext(FiltersContext);
  if (!ctx) {
    throw new Error("useFilters must be used within FiltersProvider");
  }
  return ctx;
};
