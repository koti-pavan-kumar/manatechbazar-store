"use client";

import { lazy, Suspense, useState, useEffect } from "react";

const WhatsAppButtonInner = lazy(() => import("./whatsapp-button").then((m) => ({ default: m.WhatsAppButton })));

export function WhatsAppButtonLazy() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <WhatsAppButtonInner />
    </Suspense>
  );
}
