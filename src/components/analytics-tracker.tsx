"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Privacy-friendly analytics beacon.
 * - Generates a random session ID in sessionStorage (no cookie, no PII).
 * - Fires on first load + every client-side route change.
 * - Uses sendBeacon / fetch keepalive so it survives navigation.
 * - Never fires on /admin or API routes.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // Don't track admin pages or API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Get or create anonymous session ID
    let sessionId = sessionStorage.getItem("mtb_sid");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("mtb_sid", sessionId);
    }

    const isFirstPage = sessionStorage.getItem("mtb_tracked") !== "1";
    const referrer = isFirstPage ? document.referrer || null : null;
    sessionStorage.setItem("mtb_tracked", "1");

    // Parse UTM params (only meaningful on landing page)
    let utmSource: string | null = null;
    let utmMedium: string | null = null;
    const search = window.location.search;
    if (isFirstPage && search) {
      const params = new URLSearchParams(search);
      utmSource = params.get("utm_source");
      utmMedium = params.get("utm_medium");
    }

    const fullPath = pathname + (search || "");
    const payload = JSON.stringify({
      sessionId,
      path: fullPath,
      referrer,
      utmSource,
      utmMedium,
    });

    // sendBeacon survives page navigation; fetch keepalive is the fallback
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
