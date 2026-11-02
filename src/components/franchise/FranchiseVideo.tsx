"use client";
import { useEffect, useRef } from "react";
export function FranchiseVideo() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry?.isIntersecting) element.pause(); });
    observer.observe(element);
    const hide = () => { if (document.hidden) element.pause(); };
    document.addEventListener("visibilitychange", hide);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", hide); element.pause(); };
  }, []);
  return <figure className="min-w-0 overflow-hidden rounded-3xl border border-line-strong bg-surface">
    <video ref={video} src="/video/franchise-video.mp4" controls playsInline preload="none" poster="/franchise/kovai-pudur.webp" aria-label="GamexChange franchise store video" className="mx-auto aspect-[4/3] max-h-[34rem] w-full bg-black object-contain">
      Your browser does not support this video. <a href="/video/franchise-video.mp4">Download the franchise video</a>.
    </video>
    <figcaption className="border-t border-line px-5 py-3 text-sm text-muted">Explore the GamexChange store experience. Play the video to take a look inside.</figcaption>
  </figure>;
}
