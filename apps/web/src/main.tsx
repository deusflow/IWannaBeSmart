import React from "react";
import ReactDOM from "react-dom/client";
import { initI18n } from "@iw/i18n";
import { App } from "./App";
import "./index.css";

// Initialize multilingual support (UK | EN | DA)
initI18n("uk");

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
