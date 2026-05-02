"use client"

import { useState } from "react";

interface VideoProps {
  src: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  caption?: string;
  className?: string;
}
const VideoPlayer = ({ 
  src, 
  controls = false,
  autoPlay = true, 
  loop = true, 
  muted = true,
  caption,
  className 
}: VideoProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <figure className="relative group group bg-background border rounded-2xl overflow-hidden max-h-[530px]">
      <video
        ref={setVideoElement}
        className={className}
        src={src}
        width={"100%"}
        height={"100%"}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-inset-border md:rounded-xl"></div>
      <button
        onClick={togglePlay}
        className="absolute inset-0 h-full w-full bg-transparent cursor-pointer"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-editor-background/50 text-white/90 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 duration-200 ease-out">
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"  className="ml-1">
              <path d="M6.93701 4.49614C5.85266 3.86395 4.5 4.64412 4.5 5.89587V18.1041C4.5 19.3559 5.85266 20.1361 6.93701 19.5039L17.5493 13.3998C18.6337 12.7676 18.6337 11.2324 17.5493 10.6002L6.93701 4.49614Z" />
            </svg>
          )}
        </div>
      </button>
      {caption && (
        <figcaption className="text-sm text-muted-foreground mt-2 text-center text-pretty px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default VideoPlayer;