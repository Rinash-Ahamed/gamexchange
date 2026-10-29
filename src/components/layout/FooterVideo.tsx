"use client";

import { useEffect, useRef } from "react";

export function FooterVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const syncPlayback = () => {
      if (!inView || document.hidden || motion.matches || !element.dataset.loaded) element.pause();
      else void element.play().catch(() => { /* Autoplay may be blocked; keep the footer readable. */ });
    };

    const loadVideo = () => {
      if (element.dataset.loaded || motion.matches) return;
      element.dataset.loaded = "true";
      element.src = "/video/footervideo.mp4";
      element.load();
      syncPlayback();
    };

    if (!("IntersectionObserver" in window)) {
      inView = true;
      loadVideo();
      return () => element.pause();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        loadVideo();
        observer.disconnect();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(element);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      if (inView) loadVideo();
      syncPlayback();
    });
    visibilityObserver.observe(element);
    const motionChanged = () => { if (inView) loadVideo(); syncPlayback(); };
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", motionChanged);
    element.addEventListener("canplay", syncPlayback);
    return () => {
      observer.disconnect(); visibilityObserver.disconnect(); element.pause();
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", motionChanged);
      element.removeEventListener("canplay", syncPlayback);
    };
  }, []);

  return (
    <video
      ref={video}
      aria-hidden="true"
      loop
      muted
      playsInline
      preload="none"
      tabIndex={-1}
      className="absolute inset-0 -z-20 size-full object-cover object-center motion-reduce:hidden"
    />
  );
}
