import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import "./styles.css";

try {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentPath === "/" || currentPath.startsWith("/index.mobile.html")) {
    const raw = window.localStorage.getItem("gymtrack.last-location.v1");
    const saved = raw ? (JSON.parse(raw) as { path?: unknown }) : null;
    if (
      typeof saved?.path === "string" &&
      saved.path.startsWith("/") &&
      !saved.path.startsWith("//")
    ) {
      window.history.replaceState(window.history.state, "", saved.path);
    }
  }
} catch {
  // A fresh root route remains the safe fallback when storage is unavailable.
}

const router = getRouter();
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Mobile app root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);