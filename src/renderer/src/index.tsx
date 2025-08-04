import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Get the root element
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Create React root
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log that the renderer is ready
console.log("WinHub renderer started successfully");

// Handle any unhandled errors in development
if (process.env.NODE_ENV === "development") {
  window.addEventListener("error", (event) => {
    console.error("Unhandled error:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}
