"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker
      .register("/sw.js?v=2", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.update());
  }, []);
  return null;
}
