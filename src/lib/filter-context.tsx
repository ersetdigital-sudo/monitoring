"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface FilterState {
  salut: string;
  statusBayar: string;
}

interface FilterContextType {
  filter: FilterState;
  setSalut: (val: string) => void;
  setStatusBayar: (val: string) => void;
  applyFilter: () => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterState>({
    salut: "",
    statusBayar: "",
  });

  const setSalut = useCallback((val: string) => {
    setFilter((prev) => ({ ...prev, salut: val }));
  }, []);

  const setStatusBayar = useCallback((val: string) => {
    setFilter((prev) => ({ ...prev, statusBayar: val }));
  }, []);

  const applyFilter = useCallback(() => {
    // Trigger re-render by updating a timestamp
    setFilter((prev) => ({ ...prev }));
  }, []);

  return (
    <FilterContext.Provider value={{ filter, setSalut, setStatusBayar, applyFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within FilterProvider");
  return ctx;
}
