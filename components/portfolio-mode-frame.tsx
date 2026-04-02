"use client";

import { useEffect, useState } from "react";

type PortfolioModeFrameProps = {
  defaultMode: "light" | "dark";
  children: React.ReactNode;
};

const STORAGE_KEY = "tapfolio-portfolio-mode";

export function PortfolioModeFrame({ defaultMode, children }: PortfolioModeFrameProps) {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return defaultMode;
    }

    const storedMode = window.localStorage.getItem(STORAGE_KEY);
    return storedMode === "light" || storedMode === "dark" ? storedMode : defaultMode;
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return (
    <div className="portfolio-shell" data-portfolio-mode={mode}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setMode((currentMode) => (currentMode === "dark" ? "light" : "dark"))}
          className="portfolio-toggle"
        >
          {mode === "dark" ? "Switch to light" : "Switch to dark"}
        </button>
      </div>
      {children}
    </div>
  );
}
