"use client";
import { useEffect, useRef } from "react";
export function FranchiseVideo() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const sync = () => {
      if (!inView || document.hidden || motion.matches) element.pause();
      else void element.play().catch(() => { /* Keep native controls available if autoplay is blocked. */ });
    };
    const observer = new IntersectionObserver(([entry]) => { inView = Boolean(entry?.isIntersecting); sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    element.addEventListener("canplay", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      element.removeEventListener("canplay", sync);
      element.pause();
    };
  }, []);
  return <figure className="min-w-0 overflow-hidden rounded-3xl border border-line-strong bg-surface">
    <video ref={video} src="/video/franchise-video.mp4" muted loop controls playsInline preload="metadata" aria-label="GameXchange franchise store video" className="mx-auto aspect-[4/3] max-h-[34rem] w-full bg-black object-contain">
      Your browser does not support this video. <a href="/video/franchise-video.mp4">Download the franchise video</a>.
    </video>
    <figcaption className="border-t border-line px-5 py-3 text-sm text-muted">Explore the GameXchange store experience. Use the controls to pause or enable sound.</figcaption>
  </figure>;
}
