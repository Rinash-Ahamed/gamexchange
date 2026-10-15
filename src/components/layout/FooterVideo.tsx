"use client";

import { useEffect, useRef } from "react";

export function FooterVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    const loadVideo = () => {
      if (element.dataset.loaded) return;
      element.dataset.loaded = "true";
      element.src = "/video/footervideo.mp4";
      element.load();
    };

    if (!("IntersectionObserver" in window)) {
      loadVideo();
      return;
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
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={video}
      aria-hidden="true"
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      tabIndex={-1}
      className="absolute inset-0 -z-20 size-full object-cover object-center motion-reduce:hidden"
    />
  );
}
