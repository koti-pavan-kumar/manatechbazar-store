"use client";

import { useEffect, useState } from "react";

/**
 * Returns the natural aspect ratio ("width/height") of an image once it
 * has loaded, or null while unknown.
 *
 * Used so uploaded product images display at the exact ratio they were
 * uploaded at instead of being cropped to a fixed container ratio.
 * The image is loaded through the browser cache, so no extra network
 * request is made when the real <img> renders.
 */
export function useImageRatio(src: string | undefined | null): string | null {
  const [ratio, setRatio] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setRatio(null);
      return;
    }
    setRatio(null);
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (cancelled || !img.naturalWidth || !img.naturalHeight) return;
      setRatio(`${img.naturalWidth}/${img.naturalHeight}`);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return ratio;
}
