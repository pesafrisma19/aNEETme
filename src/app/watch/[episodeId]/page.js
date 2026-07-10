"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Watch() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const episodeId = decodeURIComponent(params.episodeId);
  const animeId = searchParams.get("anime");

  const [videoUrl, setVideoUrl] = useState("");
  const [activeServer, setActiveServer] = useState(0);
  const [currentServer, setCurrentServer] = useState("animelovers");

  // Sync server state with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aneetme-server") || "animelovers";
    setCurrentServer(saved);

    const handleServerChange = (e) => setCurrentServer(e.detail);
    window.addEventListener("server-changed", handleServerChange);
    return () => window.removeEventListener("server-changed", handleServerChange);
  }, []);

  // Fetch Streaming link
  const { data: streamData, error: streamError, isValidating: streamLoading } = useSWR(
    episodeId ? `/api/stream?id=${encodeURIComponent(episodeId)}&server=${currentServer}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch Anime details (for episode list navigation)
  const { data: anime, error: animeError } = useSWR(
    animeId ? `/api/info?id=${encodeURIComponent(animeId)}&server=${currentServer}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Parse stream sources when loaded
  useEffect(() => {
    if (streamData) {
      if (streamData.streamUrl) {
        setVideoUrl(streamData.streamUrl);
      } else if (streamData.sources && streamData.sources.length > 0) {
        // Look for default or highest quality m3u8 source
        const m3u8Source = streamData.sources.find((s) => s.url.includes(".m3u8")) || streamData.sources[0];
        if (m3u8Source) {
          setVideoUrl(m3u8Source.url);
        }
      }
    }
  }, [streamData]);

  // Log to Watch History
  useEffect(() => {
    if (!anime || !episodeId) return;

    // Find the current episode number
    const currentEpisodeObj = anime.episodes?.find((ep) => ep.id === episodeId);
    const epNumber = currentEpisodeObj ? (currentEpisodeObj.episodeNumber || currentEpisodeObj.number) : "Unknown";

    const savedHistory = JSON.parse(localStorage.getItem("aneetme-history") || "[]");
    
    // Remove if already exists for this anime to avoid duplicates
    const filteredHistory = savedHistory.filter(
      (item) => !(item.animeId === animeId && item.episodeId === episodeId)
    );

    const historyItem = {
      animeId,
      animeTitle: anime.title,
      animeImage: anime.image,
      episodeId,
      episodeNumber: epNumber,
      watchedAt: new Date().toISOString()
    };

    // Keep history limited to 20 items
    const updatedHistory = [historyItem, ...filteredHistory].slice(0, 20);
    localStorage.setItem("aneetme-history", JSON.stringify(updatedHistory));
  }, [anime, episodeId, animeId]);

  // Navigation handlers
  const currentEpIndex = anime?.episodes?.findIndex((ep) => ep.id === episodeId) ?? -1;
  const hasPrev = currentEpIndex > 0;
  const hasNext = anime?.episodes ? currentEpIndex < anime.episodes.length - 1 : false;

  const navigateEpisode = (direction) => {
    if (!anime?.episodes) return;
    const targetEp = anime.episodes[currentEpIndex + direction];
    if (targetEp) {
      // Reset player states
      setVideoUrl("");
      router.push(`/watch/${encodeURIComponent(targetEp.id)}?anime=${encodeURIComponent(animeId)}`);
    }
  };

  const currentEpNum = anime?.episodes?.[currentEpIndex]?.episodeNumber || anime?.episodes?.[currentEpIndex]?.number || "";

  return (
    <div className="container">
      {/* Back to detail link */}
      <div style={{ display: "flex", gap: "8px", fontSize: "0.9rem", color: "var(--foreground-muted)", marginBottom: "20px" }}>
        <Link href="/" className="nav-back-link">Beranda</Link>
        <span>/</span>
        {anime && (
          <>
            <Link href={`/anime/${encodeURIComponent(animeId)}`} className="nav-back-link">
              {anime.title}
            </Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: "var(--foreground-secondary)" }}>
          Episode {currentEpNum || "..."}
        </span>
      </div>

      {/* Main Streaming Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "3fr 1fr",
        gap: "30px",
        alignItems: "start"
      }} className="watch-grid">
        
        {/* Left Side: Video Player & Navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Player Wrapper */}
          <div style={{ width: "100%", background: "#000", borderRadius: "var(--border-radius-md)", overflow: "hidden" }}>
            {streamLoading && !videoUrl ? (
              <div style={{
                width: "100%",
                aspectRatio: "16/9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-secondary)",
                color: "var(--foreground-secondary)"
              }}>
                <div className="shimmer" style={{ width: "120px", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: "40px", height: "100%", background: "var(--accent-cyan)" }} />
                </div>
                <p style={{ marginTop: "16px", fontSize: "0.9rem" }}>Mengambil source video...</p>
              </div>
            ) : streamError ? (
              <div style={{
                width: "100%",
                aspectRatio: "16/9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-secondary)",
                color: "#ef4444",
                padding: "20px",
                textAlign: "center"
              }}>
                <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "8px" }}>Gagal Memuat Video</p>
                <p style={{ fontSize: "0.9rem", color: "var(--foreground-secondary)", maxWidth: "400px" }}>
                  Server scraper gagal mengambil link streaming. Coba refresh halaman atau pilih episode lain.
                </p>
              </div>
            ) : streamData?.iframeSrc ? (
              <iframe
                src={streamData.iframeSrc}
                allowFullScreen
                style={{
                  width: "100%",
                  height: "100%",
                  aspectRatio: "16/9",
                  border: "none"
                }}
              />
            ) : (
              videoUrl && (
                <VideoPlayer 
                  url={videoUrl} 
                  qualities={streamData?.sources}
                  title={`${anime?.title || "Anime"} - Episode ${currentEpNum}`} 
                />
              )
            )}
          </div>

          {/* Episode Navigation Buttons */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--glass-border)",
            background: "var(--glass-bg)"
          }}>
            <button
              onClick={() => navigateEpisode(-1)}
              disabled={!hasPrev}
              className="btn btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.85rem", opacity: hasPrev ? 1 : 0.5, cursor: hasPrev ? "pointer" : "not-allowed" }}
            >
              &larr; Prev
            </button>

            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              EPISODE {currentEpNum || "..."}
            </span>

            <button
              onClick={() => navigateEpisode(1)}
              disabled={!hasNext}
              className="btn btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.85rem", opacity: hasNext ? 1 : 0.5, cursor: hasNext ? "pointer" : "not-allowed" }}
            >
              Next &rarr;
            </button>
          </div>

          {/* Anime Meta Details */}
          {anime && (
            <div className="glass" style={{
              padding: "24px",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--glass-border)"
            }}>
              <h1 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>{anime.title}</h1>
              <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>
                Kategori: {anime.type} | Status: {anime.status}
              </p>
              <p style={{ color: "var(--foreground-secondary)", fontSize: "0.95rem", lineHeight: 1.6, textAlign: "justify" }}>
                {anime.description || anime.synopsis || "Tidak ada deskripsi yang tersedia untuk anime ini."}
              </p>
            </div>
          )}

        </div>

        {/* Right Side: Episode List Panel */}
        <div className="glass" style={{
          borderRadius: "var(--border-radius-md)",
          border: "1px solid var(--glass-border)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "650px",
        }}>
          {/* Panel Header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--glass-border)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--accent-cyan)"
          }}>
            Semua Episode
          </div>

          {/* Panel List Scroll */}
          <div style={{
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1
          }}>
            {!anime ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="shimmer" style={{ height: "45px", borderRadius: "6px", width: "100%" }} />
              ))
            ) : (
              anime.episodes?.map((ep, index) => {
                const isCurrent = ep.id === episodeId;
                return (
                  <Link
                    key={ep.id}
                    href={`/watch/${encodeURIComponent(ep.id)}?anime=${encodeURIComponent(animeId)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: isCurrent ? "rgba(6, 182, 212, 0.1)" : "rgba(255, 255, 255, 0.02)",
                      border: "1px solid " + (isCurrent ? "var(--accent-cyan)" : "var(--glass-border)"),
                      borderRadius: "6px",
                      color: isCurrent ? "var(--accent-cyan)" : "var(--foreground-primary)",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      transition: "var(--transition-smooth)"
                    }}
                    className="episode-nav-item"
                  >
                    <span>Episode {ep.episodeNumber || ep.number || (index + 1)}</span>
                    {isCurrent && <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>Memutar</span>}
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Styled Links Hover & Responsive adjustments */}
      <style jsx>{`
        .nav-back-link:hover {
          color: var(--accent-cyan) !important;
        }
        :global(.episode-nav-item:hover) {
          border-color: var(--accent-cyan) !important;
          color: var(--accent-cyan) !important;
          background: rgba(6, 182, 212, 0.05) !important;
        }
        @media (max-width: 960px) {
          .watch-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
