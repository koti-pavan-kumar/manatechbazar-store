"use client";

import { useImageRatio } from "@/lib/use-image-ratio";

/**
 * Image container that keeps its fallback aspect-ratio class until the
 * image loads, then adopts the image's exact natural ratio so uploaded
 * images are displayed as-is instead of being cropped.
 */
export function RatioBox({
  src,
  className = "",
  children,
}: {
  src: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ratio = useImageRatio(src);
  return (
    <div className={className} style={ratio ? { aspectRatio: ratio } : undefined}>
      {children}
    </div>
  );
}
