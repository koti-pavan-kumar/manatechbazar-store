"use client";

import { lazy, Suspense, useState, useEffect } from "react";

const ChatWidgetInner = lazy(() => import("./chat-widget").then((m) => ({ default: m.ChatWidget })));

export function ChatWidgetLazy() {
  const [show, setShow] = useState(false);

  // Delay loading until after page is fully interactive
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <ChatWidgetInner />
    </Suspense>
  );
}
