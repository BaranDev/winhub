import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// get root
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// init react
const root = createRoot(container);

// mount app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// startup log
console.log("WinHub renderer started successfully");

// dev error logging
if (process.env.NODE_ENV === "development") {
  window.addEventListener("error", (event) => {
    console.error("Unhandled error:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}
