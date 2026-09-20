"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavLoading() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1">
      <div className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary animate-[loading_1s_ease-in-out_infinite]" />
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
