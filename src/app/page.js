"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import AnimeCard from "@/components/AnimeCard";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const [searchVal, setSearchVal] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home"); // home, bookmarks, history
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);

  const [recentPage, setRecentPage] = useState(1);
  const [allRecentAnime, setAllRecentAnime] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState(null);
  const [hasMoreRecent, setHasMoreRecent] = useState(true);

  // Fetch recent episodes with pagination
  useEffect(() => {
    if (activeTab === "home" && !submittedQuery) {
      setRecentPage(1);
      setRecentLoading(true);
      setRecentError(null);
      setHasMoreRecent(true);

      fetch("/api/search?type=recent&page=1")
        .then((res) => {
          if (!res.ok) throw new Error("Gagal memuat");
          return res.json();
        })
        .then((data) => {
          setAllRecentAnime(data.results || []);
          if ((data.results || []).length < 20) {
            setHasMoreRecent(false);
          }
        })
        .catch((err) => {
          setRecentError(err.message);
        })
        .finally(() => {
          setRecentLoading(false);
        });
    }
  }, [activeTab, submittedQuery]);

  const loadMoreRecent = async () => {
    if (recentLoading || !hasMoreRecent) return;
    setRecentLoading(true);
    const nextPage = recentPage + 1;
    try {
      const res = await fetch(`/api/search?type=recent&page=${nextPage}`);
      if (!res.ok) throw new Error("Gagal memuat halaman berikutnya");
      const data = await res.json();
      const newItems = data.results || [];
      if (newItems.length > 0) {
        setAllRecentAnime((prev) => [...prev, ...newItems]);
        setRecentPage(nextPage);
        if (newItems.length < 20) {
          setHasMoreRecent(false);
        }
      } else {
        setHasMoreRecent(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecentLoading(false);
    }
  };

  const [selectedGenre, setSelectedGenre] = useState("");
  const [genrePage, setGenrePage] = useState(1);
  const [allGenreAnime, setAllGenreAnime] = useState([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [genreError, setGenreError] = useState(null);
  const [hasMoreGenre, setHasMoreGenre] = useState(true);

  const genresList = [
    { name: "Semua Genre", slug: "" },
    { name: "Action", slug: "action" },
    { name: "Adventure", slug: "adventure" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Romance", slug: "romance" },
    { name: "Drama", slug: "drama" },
    { name: "Comedy", slug: "comedy" },
    { name: "Slice of Life", slug: "slice-of-life" },
    { name: "Sci-Fi", slug: "sci-fi" },
    { name: "Mystery", slug: "mystery" },
    { name: "Supernatural", slug: "supernatural" },
    { name: "School", slug: "school" },
    { name: "Ecchi", slug: "ecchi" }
  ];

  // Fetch genre anime with pagination
  useEffect(() => {
    if (selectedGenre && activeTab === "home" && !submittedQuery) {
      setGenrePage(1);
      setGenreLoading(true);
      setGenreError(null);
      setHasMoreGenre(true);

      fetch(`/api/search?genre=${selectedGenre}&page=1`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal memuat");
          return res.json();
        })
        .then((data) => {
          setAllGenreAnime(data.results || []);
          if ((data.results || []).length < 20) {
            setHasMoreGenre(false);
          }
        })
        .catch((err) => {
          setGenreError(err.message);
        })
        .finally(() => {
          setGenreLoading(false);
        });
    }
  }, [selectedGenre, activeTab, submittedQuery]);

  const loadMoreGenre = async () => {
    if (genreLoading || !hasMoreGenre) return;
    setGenreLoading(true);
    const nextPage = genrePage + 1;
    try {
      const res = await fetch(`/api/search?genre=${selectedGenre}&page=${nextPage}`);
      if (!res.ok) throw new Error("Gagal memuat");
      const data = await res.json();
      const newItems = data.results || [];
      if (newItems.length > 0) {
        setAllGenreAnime((prev) => [...prev, ...newItems]);
        setGenrePage(nextPage);
        if (newItems.length < 20) {
          setHasMoreGenre(false);
        }
      } else {
        setHasMoreGenre(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenreLoading(false);
    }
  };

  // Fetch top airing
  const { data: topAnime, error: topError } = useSWR(
    activeTab === "home" && !submittedQuery && !selectedGenre ? "/api/search?type=top" : null,
    fetcher
  );

  // Fetch search results
  const { data: searchResults, error: searchError, isValidating: searchLoading } = useSWR(
    submittedQuery ? `/api/search?q=${encodeURIComponent(submittedQuery)}` : null,
    fetcher
  );

  // Read Bookmarks and History on client mount
  useEffect(() => {
    // Check URL search params for tab navigation
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "bookmarks" || tabParam === "history") {
      setActiveTab(tabParam);
    }

    const savedBookmarks = JSON.parse(localStorage.getItem("aneetme-bookmarks") || "[]");
    setBookmarks(savedBookmarks);

    const savedHistory = JSON.parse(localStorage.getItem("aneetme-history") || "[]");
    // Sort history by watch date (newest first)
    const sortedHistory = savedHistory.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
    setHistory(sortedHistory);

    // Listen to tab updates from navigation clicks
    const handleUrlChange = () => {
      const p = new URLSearchParams(window.location.search);
      const t = p.get("tab") || "home";
      setActiveTab(t);
    };
    window.addEventListener("popstate", handleUrlChange);
    // Also listen to custom events if needed
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  // Sync tab updates from click in page
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSubmittedQuery("");
    setSearchVal("");
    setSelectedGenre(""); // Reset genre filter
    // Update URL query parameter silently
    const newUrl = tabName === "home" ? "/" : `/?tab=${tabName}`;
    window.history.pushState({ path: newUrl }, "", newUrl);

    if (tabName === "bookmarks") {
      setBookmarks(JSON.parse(localStorage.getItem("aneetme-bookmarks") || "[]"));
    } else if (tabName === "history") {
      const savedHistory = JSON.parse(localStorage.getItem("aneetme-history") || "[]");
      setHistory(savedHistory.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setSubmittedQuery(searchVal.trim());
      setActiveTab("home");
      setSelectedGenre(""); // Reset genre filter when searching
    }
  };

  const handleClearSearch = () => {
    setSearchVal("");
    setSubmittedQuery("");
    setSelectedGenre(""); // Reset genre filter
  };

  return (
    <div className="container">
      {/* Banner / Hero Section */}
      {!submittedQuery && activeTab === "home" && (
        <section className="glass" style={{
          padding: "40px",
          borderRadius: "var(--border-radius-lg)",
          marginBottom: "40px",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--shadow-glow)"
        }}>
          {/* Decorative Glow */}
          <div style={{
            position: "absolute",
            top: "-10%', right: '-10%'",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(6, 182, 212, 0.15)",
            filter: "blur(80px)",
            pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute",
            bottom: "-10%', left: '-10%'",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "rgba(236, 72, 153, 0.1)",
            filter: "blur(60px)",
            pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
            <span className="badge badge-cyan" style={{ marginBottom: "16px" }}>
              ✨ AD-FREE STREAMING
            </span>
            <h1 style={{ fontSize: "2.8rem", marginBottom: "16px", lineHeight: "1.1" }}>
              Nonton Anime Tanpa <span className="gradient-text">Iklan Mengganggu</span>
            </h1>
            <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
              Temukan ribuan judul anime terbaru dan terpopuler dengan server streaming cepat dan player video bersih. Nikmati tontonan bebas iklan pop-up!
            </p>
          </div>
        </section>
      )}

      {/* Tabs & Search Bar Row */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {/* Tab & Filter Container */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Tab Buttons */}
          <div className="glass" style={{
            display: "flex",
            padding: "4px",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--glass-border)",
          }}>
            {["home", "bookmarks", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  background: activeTab === tab ? "var(--accent-cyan)" : "transparent",
                  color: activeTab === tab ? "#000" : "var(--foreground-secondary)",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "calc(var(--border-radius-sm) - 4px)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "var(--transition-smooth)"
                }}
              >
                {tab === "home" ? "Utama" : tab === "bookmarks" ? "Favorit" : "Riwayat"}
              </button>
            ))}
          </div>

          {/* Genre Dropdown Filter */}
          {activeTab === "home" && !submittedQuery && (
            <div style={{ position: "relative" }}>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                style={{
                  padding: "8px 32px 8px 16px",
                  borderRadius: "var(--border-radius-sm)",
                  background: "var(--bg-secondary)",
                  color: "var(--foreground-primary)",
                  border: "1px solid var(--glass-border)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  appearance: "none",
                  outline: "none",
                  transition: "var(--transition-smooth)"
                }}
              >
                {genresList.map((g) => (
                  <option key={g.slug} value={g.slug} style={{ background: "var(--bg-primary)" }}>
                    {g.name}
                  </option>
                ))}
              </select>
              {/* Custom Down Arrow Icon */}
              <span style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "0.8rem",
                color: "var(--foreground-muted)"
              }}>
                ▼
              </span>
            </div>
          )}
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} style={{
          display: "flex",
          gap: "8px",
          flex: 1,
          maxWidth: "400px"
        }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Cari anime..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="input-text"
              style={{ paddingRight: "40px" }}
            />
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--foreground-muted)",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                &times;
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">Cari</button>
        </form>
      </div>

      {/* Main Tab Render Logic */}
      
      {/* 1. SEARCH RESULTS TAB */}
      {submittedQuery && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Hasil Pencarian: <span className="gradient-text">"{submittedQuery}"</span></h2>
            <button onClick={handleClearSearch} className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              Kembali
            </button>
          </div>

          {searchLoading && (
            <div className="anime-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shimmer" style={{ width: "100%", aspectRatio: "2/3", borderRadius: "var(--border-radius-md)" }} />
              ))}
            </div>
          )}

          {searchError && <p style={{ color: "red" }}>Terjadi kesalahan saat memuat data pencarian.</p>}

          {searchResults && searchResults.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ color: "var(--foreground-secondary)", fontSize: "1.1rem" }}>
                Tidak ada anime yang ditemukan dengan kata kunci tersebut. Coba judul lain!
              </p>
            </div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="anime-grid">
              {searchResults.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  image={anime.image}
                  subOrDub={anime.subOrDub}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. HOME TAB (Default lists) */}
      {!submittedQuery && activeTab === "home" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          
          {selectedGenre ? (
            /* Genre Filter Results */
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.6rem" }}>
                  Genre: <span className="gradient-text">{genresList.find(g => g.slug === selectedGenre)?.name}</span>
                </h2>
                <button 
                  onClick={() => setSelectedGenre("")} 
                  className="btn btn-secondary" 
                  style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                >
                  Tutup Filter
                </button>
              </div>

              {genreError && <p style={{ color: "red", marginTop: "10px" }}>Gagal memuat anime untuk genre ini.</p>}
              
              {genreLoading && allGenreAnime.length === 0 && (
                <div className="anime-grid">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="shimmer" style={{ width: "100%", aspectRatio: "2/3", borderRadius: "var(--border-radius-md)" }} />
                  ))}
                </div>
              )}

              {allGenreAnime.length > 0 && (
                <>
                  <div className="anime-grid">
                    {allGenreAnime.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.title}
                        image={anime.image}
                        releaseDate={anime.releaseDate}
                      />
                    ))}
                  </div>
                  
                  {hasMoreGenre && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
                      <button 
                        onClick={loadMoreGenre} 
                        className="btn btn-primary" 
                        disabled={genreLoading}
                        style={{ 
                          padding: "12px 36px", 
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          borderRadius: "var(--border-radius-sm)"
                        }}
                      >
                        {genreLoading ? "Memuat..." : "Muat Lebih Banyak"}
                      </button>
                    </div>
                  )}
                </>
              )}

              {allGenreAnime.length === 0 && !genreLoading && !genreError && (
                <p style={{ color: "var(--foreground-muted)", textAlign: "center", marginTop: "20px" }}>
                  Tidak ada anime ditemukan untuk genre ini.
                </p>
              )}
            </section>
          ) : (
            /* Default lists (Recent & Top Airing) */
            <>
              {/* Recent Episodes */}
              <section>
                <h2 style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  🆕 Episode Baru <span className="gradient-text">Rilis</span>
                </h2>
                
                {recentError && <p style={{ color: "red", marginTop: "10px" }}>Gagal memuat episode terbaru.</p>}
                
                {recentLoading && allRecentAnime.length === 0 && (
                  <div className="anime-grid">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="shimmer" style={{ width: "100%", aspectRatio: "2/3", borderRadius: "var(--border-radius-md)" }} />
                    ))}
                  </div>
                )}

                {allRecentAnime.length > 0 && (
                  <>
                    <div className="anime-grid">
                      {allRecentAnime.map((anime) => (
                        <AnimeCard
                          key={anime.id}
                          id={anime.id}
                          title={anime.title}
                          image={anime.image}
                          episodeNumber={anime.episodeNumber}
                          releaseDate={anime.releaseDate}
                        />
                      ))}
                    </div>
                    
                    {hasMoreRecent && (
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
                        <button 
                          onClick={loadMoreRecent} 
                          className="btn btn-primary" 
                          disabled={recentLoading}
                          style={{ 
                            padding: "12px 36px", 
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            borderRadius: "var(--border-radius-sm)"
                          }}
                        >
                          {recentLoading ? "Memuat..." : "Muat Lebih Banyak"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Top Airing Anime */}
              <section>
                <h2 style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  🔥 Sedang <span className="gradient-text-purple">Airing Populer</span>
                </h2>
                
                {topError && <p style={{ color: "red", marginTop: "10px" }}>Gagal memuat anime populer.</p>}
                
                {!topAnime && !topError && (
                  <div className="anime-grid">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="shimmer" style={{ width: "100%", aspectRatio: "2/3", borderRadius: "var(--border-radius-md)" }} />
                    ))}
                  </div>
                )}

                {topAnime && (
                  <div className="anime-grid">
                    {topAnime.results?.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.title}
                        image={anime.image}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      )}

      {/* 3. BOOKMARKS TAB */}
      {!submittedQuery && activeTab === "bookmarks" && (
        <section>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "10px" }}>
            ⭐ Anime <span className="gradient-text">Favorit Kamu</span>
          </h2>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
            Disimpan secara lokal di browsermu.
          </p>

          {bookmarks.length === 0 ? (
            <div className="glass" style={{
              padding: "40px",
              textAlign: "center",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--glass-border)"
            }}>
              <p style={{ color: "var(--foreground-secondary)" }}>
                Kamu belum mem-bookmark anime apapun. Klik bintang pada halaman detail anime untuk menyimpannya di sini!
              </p>
            </div>
          ) : (
            <div className="anime-grid">
              {bookmarks.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  image={anime.image}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. HISTORY TAB */}
      {!submittedQuery && activeTab === "history" && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "1.6rem" }}>
              ⏳ Riwayat <span className="gradient-text-purple">Tontonan</span>
            </h2>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Hapus semua riwayat tontonan?")) {
                    localStorage.removeItem("aneetme-history");
                    setHistory([]);
                  }
                }}
                className="btn btn-danger"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Hapus Semua
              </button>
            )}
          </div>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
            Melacak episode terakhir yang kamu putar.
          </p>

          {history.length === 0 ? (
            <div className="glass" style={{
              padding: "40px",
              textAlign: "center",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--glass-border)"
            }}>
              <p style={{ color: "var(--foreground-secondary)" }}>
                Belum ada riwayat menonton. Mulailah memutar anime untuk mencatatnya di sini!
              </p>
            </div>
          ) : (
            <div className="anime-grid">
              {history.map((item) => (
                <div key={`${item.animeId}-${item.episodeId}`} style={{ display: "flex", flexDirection: "column" }}>
                  <AnimeCard
                    id={item.animeId}
                    title={item.animeTitle}
                    image={item.animeImage}
                  />
                  <div style={{
                    marginTop: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    border: "1px solid var(--glass-border)"
                  }}>
                    <div style={{ fontWeight: 600, color: "var(--accent-cyan)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      EP {item.episodeNumber}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--foreground-muted)", marginTop: "2px" }}>
                      Diputar: {new Date(item.watchedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
