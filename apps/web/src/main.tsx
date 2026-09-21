import React from "react";
import ReactDOM from "react-dom/client";
import { initI18n, i18n } from "@iw/i18n";
import { App } from "./App";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import "./index.css";

// Initialize multilingual support honoring user's saved locale (UA | EN | DA)
initI18n();

// Synchronize HTML root lang attribute for accessibility (WCAG 3.1.1)
if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language || "ua";
  i18n.on("languageChanged", (lng) => {
    document.documentElement.lang = lng;
  });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

