"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AnimeDetail() {
  const params = useParams();
  const router = useRouter();
  const animeId = decodeURIComponent(params.id);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [episodeFilter, setEpisodeFilter] = useState("asc"); // asc, desc

  // Fetch Anime details
  const { data: anime, error, isValidating: loading } = useSWR(
    animeId ? `/api/info?id=${encodeURIComponent(animeId)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Check Bookmark state on mount / load
  useEffect(() => {
    if (!animeId) return;
    const bookmarks = JSON.parse(localStorage.getItem("aneetme-bookmarks") || "[]");
    setIsBookmarked(bookmarks.some((b) => b.id === animeId));
  }, [animeId]);

  const toggleBookmark = () => {
    if (!anime) return;
    const bookmarks = JSON.parse(localStorage.getItem("aneetme-bookmarks") || "[]");
    
    let updatedBookmarks;
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter((b) => b.id !== animeId);
    } else {
      updatedBookmarks = [...bookmarks, {
        id: animeId,
        title: anime.title,
        image: anime.image,
        bookmarkedAt: new Date().toISOString()
      }];
    }

    localStorage.setItem("aneetme-bookmarks", JSON.stringify(updatedBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  if (loading && !anime) {
    return (
      <div className="container" style={{ padding: "40px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", marginBottom: "40px" }}>
          <div className="shimmer" style={{ width: "300px", aspectRatio: "2/3", borderRadius: "var(--border-radius-lg)" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="shimmer" style={{ height: "40px", width: "70%", borderRadius: "6px" }} />
            <div className="shimmer" style={{ height: "20px", width: "40%", borderRadius: "6px" }} />
            <div className="shimmer" style={{ height: "150px", width: "100%", borderRadius: "6px" }} />
          </div>
        </div>
        <div className="shimmer" style={{ height: "300px", width: "100%", borderRadius: "var(--border-radius-md)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "20px" }}>Gagal Memuat Detail Anime</h2>
        <p style={{ color: "var(--foreground-secondary)", marginBottom: "30px" }}>
          Terjadi kesalahan saat memanggil API scraper. Silakan kembali ke halaman utama dan coba lagi.
        </p>
        <Link href="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </div>
    );
  }

  if (!anime) return null;

  // Sort episodes based on user preference
  const episodes = anime.episodes ? [...anime.episodes] : [];
  if (episodeFilter === "desc") {
    episodes.reverse();
  }

  return (
    <div className="container">
      {/* Breadcrumbs */}
      <div style={{ display: "flex", gap: "8px", fontSize: "0.9rem", color: "var(--foreground-muted)", marginBottom: "30px" }}>
        <Link href="/" className="breadcrumb-link">Beranda</Link>
        <span>/</span>
        <span style={{ color: "var(--foreground-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "250px" }}>
          {anime.title}
        </span>
      </div>

      {/* Main Info Box */}
      <section className="glass" style={{
        padding: "30px",
        borderRadius: "var(--border-radius-lg)",
        marginBottom: "40px",
        border: "1px solid var(--glass-border)",
        display: "flex",
        flexWrap: "wrap",
        gap: "40px",
        position: "relative"
      }}>
        {/* Background Blur Backing */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${anime.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.05,
          filter: "blur(20px)",
          borderRadius: "var(--border-radius-lg)",
          pointerEvents: "none"
        }} />

        {/* Left Side: Poster & Bookmark */}
        <div style={{ width: "100%", maxWidth: "260px", display: "flex", flexDirection: "column", gap: "20px", position: "relative", zIndex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={anime.image} 
            alt={anime.title}
            style={{
              width: "100%",
              aspectRatio: "2/3",
              objectFit: "cover",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-glow)"
            }}
          />
          
          {/* Bookmark Button */}
          <button 
            onClick={toggleBookmark}
            className="btn" 
            style={{
              background: isBookmarked ? "var(--accent-pink)" : "rgba(255,255,255,0.05)",
              color: isBookmarked ? "#fff" : "var(--foreground-primary)",
              border: "1px solid " + (isBookmarked ? "rgba(236,72,153,0.3)" : "var(--glass-border)"),
              width: "100%",
              boxShadow: isBookmarked ? "var(--shadow-pink-glow)" : "none"
            }}
          >
            <span>{isBookmarked ? "⭐ Favorit (Tersimpan)" : "☆ Tambah ke Favorit"}</span>
          </button>
        </div>

        {/* Right Side: Metadata Details */}
        <div style={{ flex: 1, minWidth: "300px", position: "relative", zIndex: 1 }}>
          <span className="badge badge-cyan" style={{ marginBottom: "12px" }}>
            {anime.type || "ANIME"}
          </span>
          
          <h1 style={{ fontSize: "2.2rem", marginBottom: "8px", lineHeight: 1.2 }}>
            {anime.title}
          </h1>
          
          {anime.otherName && (
            <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
              Nama Lain: {anime.otherName}
            </p>
          )}

          {/* Details Pill Row */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <div className="glass" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem" }}>
              <strong>Status:</strong> {anime.status || "Unknown"}
            </div>
            <div className="glass" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem" }}>
              <strong>Rilis:</strong> {anime.releaseDate || "Unknown"}
            </div>
            <div className="glass" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem" }}>
              <strong>Total Ep:</strong> {anime.totalEpisodes || "Unknown"}
            </div>
            {anime.subOrDub && (
              <div className="glass" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem" }}>
                <strong>Format:</strong> {anime.subOrDub}
              </div>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
              {anime.genres.map((genre) => (
                <span 
                  key={genre}
                  style={{
                    fontSize: "0.8rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--glass-border)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    color: "var(--foreground-secondary)"
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "var(--accent-cyan)" }}>Sinopsis</h3>
            <p style={{
              color: "var(--foreground-secondary)",
              lineHeight: 1.6,
              fontSize: "0.95rem",
              textAlign: "justify"
            }}>
              {anime.description || "Tidak ada deskripsi yang tersedia untuk anime ini."}
            </p>
          </div>
        </div>
      </section>

      {/* Episodes List Grid */}
      <section className="glass" style={{
        padding: "30px",
        borderRadius: "var(--border-radius-lg)",
        border: "1px solid var(--glass-border)"
      }}>
        {/* Episodes Header Controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--glass-border)",
          paddingBottom: "16px",
          marginBottom: "24px"
        }}>
          <h2 style={{ fontSize: "1.4rem" }}>
            📺 Daftar <span className="gradient-text">Episode</span>
          </h2>

          {/* Sort Control */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={() => setEpisodeFilter("asc")}
              style={{
                background: episodeFilter === "asc" ? "var(--bg-tertiary)" : "transparent",
                color: episodeFilter === "asc" ? "var(--accent-cyan)" : "var(--foreground-muted)",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem"
              }}
            >
              Terlama
            </button>
            <button 
              onClick={() => setEpisodeFilter("desc")}
              style={{
                background: episodeFilter === "desc" ? "var(--bg-tertiary)" : "transparent",
                color: episodeFilter === "desc" ? "var(--accent-cyan)" : "var(--foreground-muted)",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem"
              }}
            >
              Terbaru
            </button>
          </div>
        </div>

        {/* Episode Grid Items */}
        {episodes.length === 0 ? (
          <p style={{ color: "var(--foreground-secondary)", textAlign: "center", padding: "20px" }}>
            Tidak ada episode yang tersedia.
          </p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "12px"
          }}>
            {episodes.map((ep) => (
              <Link 
                key={ep.id}
                href={`/watch/${encodeURIComponent(ep.id)}?anime=${encodeURIComponent(animeId)}`}
                className="episode-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 6px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--border-radius-sm)",
                  color: "var(--foreground-primary)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "var(--transition-smooth)"
                }}
              >
                EP {ep.number}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Styled Links & Page Effects */}
      <style jsx>{`
        .breadcrumb-link:hover {
          color: var(--accent-cyan) !important;
        }
        :global(.episode-btn:hover) {
          border-color: var(--accent-cyan) !important;
          color: var(--accent-cyan) !important;
          background: rgba(6, 182, 212, 0.05) !important;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
