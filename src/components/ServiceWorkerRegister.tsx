"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Offline Service Worker Active"))
        .catch((err) => console.warn("ServiceWorker registration note:", err));
    }
  }, []);

  return null;
}
