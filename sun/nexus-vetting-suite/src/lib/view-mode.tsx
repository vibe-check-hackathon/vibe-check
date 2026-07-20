import { createContext, useContext, useEffect, useState } from "react";

/**
 * Which side of the marketplace you are looking at. The investor sees the
 * board and the deal pipeline; the startup sees its own application and where
 * it currently sits.
 */
export type ViewMode = "investor" | "startup";

const STORAGE_KEY = "vibecheck:view-mode";

const ViewModeContext = createContext<{
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
}>({ mode: "investor", setMode: () => {} });

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  // Start investor-side on both server and client so hydration matches, then
  // adopt the stored preference once mounted.
  const [mode, setModeState] = useState<ViewMode>("investor");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "startup" || stored === "investor") setModeState(stored);
  }, []);

  const setMode = (m: ViewMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
  };

  return <ViewModeContext.Provider value={{ mode, setMode }}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
