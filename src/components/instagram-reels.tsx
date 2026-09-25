"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Instagram } from "@/components/ui/icon-instagram";

/**
 * The store's 5 latest Instagram reels, hosted on the project's Cloudinary
 * account so they play natively (Instagram embeds can't be unmuted from
 * our own buttons — iframes are cross-origin).
 *
 * To swap in newer reels: upload the mp4 to Cloudinary (folder
 * manatechbazar/reels, unsigned preset "unsigned_mohan"), replace the id
 * and the Instagram shortcode below.
 */
const CLOUD_BASE = "https://res.cloudinary.com/j8ly7tsg/video/upload";

const REELS = [
  { code: "DdrBqKxx87R", id: "manatechbazar/reels/slye6yixghrcylmquzwk" },
  { code: "Ddn8jFNBN4X", id: "manatechbazar/reels/gtjak6qq6cmw0hhiqj5b" },
  { code: "DdbeSBgOqgX", id: "manatechbazar/reels/wbt3yqdfoxnk0pfnx2r1" },
  { code: "DdYz5yvSs8X", id: "manatechbazar/reels/blcpkjwtdbbjahtchnb1" },
  { code: "DdONuIwsJOQ", id: "manatechbazar/reels/biihtjxapdgfoslbmiqr" },
];

export function InstagramReels() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [muted, setMuted] = useState<boolean[]>(() => REELS.map(() => true));
  const [paused, setPaused] = useState<boolean[]>(() => REELS.map(() => true));

  // Lazy-load each reel and autoplay it (muted) only while it's on screen.
  // Playback is muted by default; the per-reel 🔊 button unmutes it and the
  // centre button pauses/resumes (a manual escape hatch for anyone who
  // prefers less motion).
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.idx);
          const video = videoRefs.current[idx];
          if (!video) return;

          if (entry.isIntersecting) {
            if (!video.src) video.src = video.dataset.src || "";
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: "150px 0px", threshold: 0.3 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, []);

  const toggleSound = (idx: number) => {
    const next = muted.map((_, i) => (i === idx ? !muted[idx] : true));
    next.forEach((isMuted, i) => {
      const video = videoRefs.current[i];
      if (video) video.muted = isMuted;
    });
    setMuted(next);
    if (next[idx] === false) videoRefs.current[idx]?.play().catch(() => {});
  };

  const togglePlay = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    if (!video.src) video.src = video.dataset.src || "";
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {REELS.map((reel, idx) => (
        <div
          key={reel.code}
          data-idx={idx}
          className="relative shrink-0 snap-center w-[65vw] sm:w-[240px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-lg ring-1 ring-black/10 group"
        >
          <video
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            data-idx={idx}
            data-src={`${CLOUD_BASE}/${reel.id}.mp4`}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            onClick={() => togglePlay(idx)}
            onPlay={() => setPaused((p) => p.map((v, i) => (i === idx ? false : v)))}
            onPause={() => setPaused((p) => p.map((v, i) => (i === idx ? true : v)))}
            aria-label={`Instagram reel ${idx + 1}`}
          />

          {/* Paused / reduced-motion play-pause control */}
          <button
            type="button"
            onClick={() => togglePlay(idx)}
            aria-label={paused[idx] ? `Play reel ${idx + 1}` : `Pause reel ${idx + 1}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              paused[idx] ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            }`}
          >
            <span className="rounded-full bg-black/55 backdrop-blur-sm p-4 text-white">
              {paused[idx] ? <Play className="h-7 w-7 fill-white" /> : <Pause className="h-6 w-6 fill-white" />}
            </span>
          </button>

          {/* Per-reel sound toggle */}
          <button
            type="button"
            onClick={() => toggleSound(idx)}
            aria-label={muted[idx] ? `Unmute reel ${idx + 1}` : `Mute reel ${idx + 1}`}
            className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 backdrop-blur-sm p-2.5 text-white hover:bg-black/80 transition-colors"
          >
            {muted[idx] ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Open the reel on Instagram */}
          <a
            href={`https://www.instagram.com/reel/${reel.code}/`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch reel ${idx + 1} on Instagram`}
            className="absolute top-3 right-3 z-10 rounded-full bg-black/60 backdrop-blur-sm p-2.5 text-white hover:bg-pink-600 transition-colors"
          >
            <Instagram className="h-4 w-4" />
          </a>

          {/* Gradient so the controls stay readable */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ))}
    </div>
  );
}
