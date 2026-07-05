"use client";
import React, { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";

export default function VideoPlayer({ url, title, ...option }) {
  const artRef = useRef();

  const isEmbed = url && (
    url.includes("player.php") || 
    url.includes("embed") || 
    url.includes("iframe") || 
    url.includes("9animetv") ||
    !url.includes(".m3u8")
  );

  useEffect(() => {
    if (!url || isEmbed) return;

    // Initialize Artplayer
    const art = new Artplayer({
      ...option,
      container: artRef.current,
      url: url,
      theme: "#06b6d4", // Neon Cyan
      volume: 0.7,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: false,
      setting: true,
      loop: false,
      flip: false,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      title: title || "Video Player",
      moreVideoAttr: {
        crossOrigin: "anonymous",
      },
      customType: {
        m3u8: function (video, url) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxMaxBufferLength: 30, // Optimize buffering
              enableWorker: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            art.on("destroy", () => hls.destroy());
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            art.notice.show = "HLS Stream format tidak didukung browser ini";
          }
        },
      },
    });

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [url, title, isEmbed]);

  if (isEmbed) {
    return (
      <div
        style={{
          width: "100%",
          position: "relative",
          paddingTop: "56.25%", // 16:9 Aspect Ratio
          borderRadius: "var(--border-radius-md)",
          overflow: "hidden",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--shadow-glow)",
          backgroundColor: "#000"
        }}
      >
        <iframe
          src={url}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          loading="eager"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            display: "block"
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={artRef}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "16/9",
        borderRadius: "var(--border-radius-md)",
        overflow: "hidden",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--shadow-glow)",
        backgroundColor: "#000"
      }}
    />
  );
}

