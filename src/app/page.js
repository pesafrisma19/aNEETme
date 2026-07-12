"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import AnimeCard from "@/components/AnimeCard";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const [searchVal, setSearchVal] = useState("");
  const [currentServer, setCurrentServer] = useState("animelovers");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem("aneetme-server") || "animelovers";
    setCurrentServer(saved);
    setIsLoading(false);

    // Event listener
    const handleServerChange = () => {
      const newServer = localStorage.getItem("aneetme-server") || "animelovers";
      setCurrentServer(newServer);
    };

    window.addEventListener("server-changed", handleServerChange);
    return () => window.removeEventListener("server-changed", handleServerChange);
  }, []);
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
    if (isLoading) return;
    if (activeTab === "home" && !submittedQuery) {
      setRecentPage(1);
      setRecentLoading(true);
      setRecentError(null);
      setHasMoreRecent(true);

      fetch(`/api/v1/${currentServer}/search?type=recent&page=1`)
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
  }, [activeTab, submittedQuery, currentServer, isLoading]);

  const loadMoreRecent = async () => {
    if (recentLoading || !hasMoreRecent) return;
    setRecentLoading(true);
    const nextPage = recentPage + 1;
    try {
      const res = await fetch(`/api/v1/${currentServer}/search?type=recent&page=${nextPage}`);
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

  const [providers, setProviders] = useState([]);
  
  useEffect(() => {
    fetch('/api/v1/providers')
      .then(res => res.json())
      .then(data => setProviders(data))
      .catch(console.error);
  }, []);

  const currentProviderConfig = providers.find(p => p.id === currentServer) || { capabilities: { genres: [], hasMovies: true, hasRecommendations: true, hasRecent: true } };
  const genresList = currentProviderConfig.capabilities?.genres || [];
  const { hasMovies, hasRecommendations, hasRecent } = currentProviderConfig.capabilities || {};

  // Fetch genre anime with pagination
  useEffect(() => {
    if (selectedGenre && activeTab === "home" && !submittedQuery) {
      setGenrePage(1);
      setGenreLoading(true);
      setGenreError(null);
      setHasMoreGenre(true);

      fetch(`/api/v1/${currentServer}/search?genre=${selectedGenre}&page=1`)
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
  }, [selectedGenre, activeTab, submittedQuery, currentServer, isLoading]);

  const loadMoreGenre = async () => {
    if (genreLoading || !hasMoreGenre) return;
    setGenreLoading(true);
    const nextPage = genrePage + 1;
    try {
      const res = await fetch(`/api/v1/${currentServer}/search?genre=${selectedGenre}&page=${nextPage}`);
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

  const [homeFeed, setHomeFeed] = useState("recent"); // recent, movie, recommend

  useEffect(() => {
    setActiveTab("home");
    setHomeFeed("recent");
    setSelectedGenre("");
  }, [currentServer]);

  // Movie feed states
  const [moviePage, setMoviePage] = useState(1);
  const [allMovieAnime, setAllMovieAnime] = useState([]);
  const [movieLoading, setMovieLoading] = useState(false);
  const [movieError, setMovieError] = useState(null);
  const [hasMoreMovie, setHasMoreMovie] = useState(true);

  // Recommend feed states
  const [recommendPage, setRecommendPage] = useState(1);
  const [allRecommendAnime, setAllRecommendAnime] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState(null);
  const [hasMoreRecommend, setHasMoreRecommend] = useState(true);

  // Fetch movie list
  useEffect(() => {
    if (isLoading) return;
    if (activeTab === "home" && !submittedQuery && !selectedGenre && homeFeed === "movie") {
      setMoviePage(1);
      setMovieLoading(true);
      setMovieError(null);
      setHasMoreMovie(true);

      fetch(`/api/v1/${currentServer}/search?type=movie&page=1`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal memuat film bioskop");
          return res.json();
        })
        .then((data) => {
          setAllMovieAnime(data.results || []);
          if ((data.results || []).length < 20) {
            setHasMoreMovie(false);
          }
        })
        .catch((err) => {
          setMovieError(err.message);
        })
        .finally(() => {
          setMovieLoading(false);
        });
    }
  }, [activeTab, submittedQuery, selectedGenre, homeFeed, currentServer, isLoading]);

  const loadMoreMovie = async () => {
    if (movieLoading || !hasMoreMovie) return;
    setMovieLoading(true);
    const nextPage = moviePage + 1;
    try {
      const res = await fetch(`/api/v1/${currentServer}/search?type=movie&page=${nextPage}`);
      if (!res.ok) throw new Error("Gagal memuat film berikutnya");
      const data = await res.json();
      const newItems = data.results || [];
      if (newItems.length > 0) {
        setAllMovieAnime((prev) => [...prev, ...newItems]);
        setMoviePage(nextPage);
        if (newItems.length < 20) {
          setHasMoreMovie(false);
        }
      } else {
        setHasMoreMovie(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMovieLoading(false);
    }
  };

  // Fetch recommended list
  useEffect(() => {
    if (isLoading) return;
    if (activeTab === "home" && !submittedQuery && !selectedGenre && homeFeed === "recommend") {
      setRecommendPage(1);
      setRecommendLoading(true);
      setRecommendError(null);
      setHasMoreRecommend(true);

      fetch(`/api/v1/${currentServer}/search?type=recommend&page=1`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal memuat rekomendasi");
          return res.json();
        })
        .then((data) => {
          setAllRecommendAnime(data.results || []);
          if ((data.results || []).length < 20) {
            setHasMoreRecommend(false);
          }
        })
        .catch((err) => {
          setRecommendError(err.message);
        })
        .finally(() => {
          setRecommendLoading(false);
        });
    }
  }, [activeTab, submittedQuery, selectedGenre, homeFeed, currentServer, isLoading]);

  const loadMoreRecommend = async () => {
    if (recommendLoading || !hasMoreRecommend) return;
    setRecommendLoading(true);
    const nextPage = recommendPage + 1;
    try {
      const res = await fetch(`/api/v1/${currentServer}/search?type=recommend&page=${nextPage}`);
      if (!res.ok) throw new Error("Gagal memuat rekomendasi berikutnya");
      const data = await res.json();
      const newItems = data.results || [];
      if (newItems.length > 0) {
        setAllRecommendAnime((prev) => [...prev, ...newItems]);
        setRecommendPage(nextPage);
        if (newItems.length < 20) {
          setHasMoreRecommend(false);
        }
      } else {
        setHasMoreRecommend(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecommendLoading(false);
    }
  };

  // Schedule states
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");

  // Fetch weekly schedule
  useEffect(() => {
    if (isLoading) return;
    if (activeTab === "schedule") {
      setScheduleLoading(true);
      setScheduleError(null);
      
      fetch(`/api/v1/schedule`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal memuat jadwal rilis");
          return res.json();
        })
        .then((data) => {
          const days = data.data || [];
          setScheduleData(days);

          // Auto-select today's day name in Indonesian
          const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          const todayIndex = new Date().getDay();
          const todayName = daysOfWeek[todayIndex];

          const hasToday = days.some(d => d.day.toLowerCase() === todayName.toLowerCase());
          if (hasToday) {
            setSelectedDay(todayName);
          } else if (days.length > 0) {
            setSelectedDay(days[0].day);
          }
        })
        .catch((err) => {
          setScheduleError(err.message);
        })
        .finally(() => {
          setScheduleLoading(false);
        });
    }
  }, [activeTab, currentServer, isLoading]);

  // Fetch search results
  const { data: searchData, error: searchError, isValidating: searchLoading } = useSWR(
    (!isLoading && submittedQuery) ? `/api/v1/${currentServer}/search?q=${encodeURIComponent(submittedQuery)}` : null,
    fetcher
  );
  const searchResults = searchData?.results || null;

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
    setHomeFeed("recent"); // Reset sub-tab
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
      setHomeFeed("recent"); // Reset sub-tab
    }
  };

  const handleClearSearch = () => {
    setSearchVal("");
    setSubmittedQuery("");
    setSelectedGenre(""); // Reset genre filter
    setHomeFeed("recent"); // Reset sub-tab
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--accent-cyan)", fontSize: "1.2rem", fontWeight: 600 }}>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Banner / Hero Section */}
      {!submittedQuery && activeTab === "home" && (
        <section className="hero-banner">
          {/* Decorative Glow */}
          <div style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(6, 182, 212, 0.15)",
            filter: "blur(80px)",
            pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
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
            <h1>
              Nonton Anime Tanpa <span className="gradient-text">Iklan Mengganggu</span>
            </h1>
            <p>
              Temukan ribuan judul anime terbaru dan terpopuler dengan server streaming cepat dan player video bersih. Nikmati tontonan bebas iklan pop-up!
            </p>
          </div>
        </section>
      )}

      {/* Tabs & Search Bar Row */}
      <div className="tabs-row-container" style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {/* Tab & Filter Container */}
        <div className="tabs-container-wrapper" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Tab Buttons */}
          <div className="tabs-container">
            {["home", "schedule", "bookmarks", "history"]
              .filter(tab => {
                if (tab === "schedule" && !currentProviderConfig.capabilities?.hasSchedule) return false;
                return true;
              })
              .map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              >
                {tab === "home" ? "Utama" : tab === "schedule" ? "Jadwal" : tab === "bookmarks" ? "Favorit" : "Riwayat"}
              </button>
            ))}
          </div>

          {/* Genre Dropdown Filter */}
          {activeTab === "home" && !submittedQuery && (
            <div className="genre-select-wrapper" style={{ position: "relative" }}>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="genre-select-dropdown"
              >
                <option value="" style={{ background: "var(--bg-primary)" }}>
                  Semua Genre
                </option>
                {genresList.map((g, index) => (
                  <option key={g.slug !== undefined && g.slug !== "" ? g.slug : `genre-${index}`} value={g.slug || g.id} style={{ background: "var(--bg-primary)" }}>
                    {g.name}
                  </option>
                ))}
              </select>
              {/* Custom Down Arrow Icon */}
              <span style={{
                position: "absolute",
                right: "16px",
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
        <form onSubmit={handleSearchSubmit} className="search-form" style={{
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
                  Genre: <span className="gradient-text">{genresList.find(g => (g.slug || g.id) === selectedGenre)?.name || selectedGenre}</span>
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
            /* Default lists (Recent, Movie, Recommendation Sub-tabs) */
            <>
              {/* Sub-tab feed selector */}
              <div style={{
                display: "flex",
                gap: "12px",
                borderBottom: "1px solid var(--glass-border)",
                paddingBottom: "12px",
                marginBottom: "8px",
                flexWrap: "wrap"
              }}>
                {[
                  { id: "recent", name: `🆕 ${currentProviderConfig.capabilities?.recentLabel || "Terkini"}`, color: "var(--accent-cyan)", required: "hasRecent" },
                  { id: "movie", name: `🎬 ${currentProviderConfig.capabilities?.moviesLabel || "Film Bioskop"}`, color: "var(--accent-pink)", required: "hasMovies" },
                  { id: "recommend", name: `🌟 ${currentProviderConfig.capabilities?.recommendationsLabel || "Rekomendasi Pilihan"}`, color: "var(--accent-purple)", required: "hasRecommendations" }
                ].filter(feed => currentProviderConfig.capabilities?.[feed.required])
                .map((feed) => (
                  <button
                    key={feed.id}
                    onClick={() => setHomeFeed(feed.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      color: homeFeed === feed.id ? "#fff" : "var(--foreground-muted)",
                      borderBottom: homeFeed === feed.id ? `3px solid ${feed.color}` : "3px solid transparent",
                      transition: "var(--transition-smooth)",
                      textShadow: homeFeed === feed.id ? `0 0 10px ${feed.color}` : "none"
                    }}
                  >
                    {feed.name}
                  </button>
                ))}
              </div>

              {/* FEED 1: RECENT EPISODES */}
              {homeFeed === "recent" && (
                <section>
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
              )}

              {/* FEED 2: MOVIES */}
              {homeFeed === "movie" && (
                <section>
                  {movieError && <p style={{ color: "red", marginTop: "10px" }}>Gagal memuat film bioskop.</p>}

                  {movieLoading && allMovieAnime.length === 0 && (
                    <div className="anime-grid">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="shimmer" style={{ width: "100%", aspectRatio: "2/3", borderRadius: "var(--border-radius-md)" }} />
                      ))}
                    </div>
                  )}

                  {allMovieAnime.length > 0 && (
                    <>
                      <div className="anime-grid">
                        {allMovieAnime.map((anime) => (
                          <AnimeCard
                            key={anime.id}
                            id={anime.id}
                            title={anime.title}
                            image={anime.image}
                            releaseDate={anime.releaseDate}
                          />
                        ))}
                      </div>

                      {hasMoreMovie && (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
                          <button
                            onClick={loadMoreMovie}
                            className="btn btn-primary"
                            disabled={movieLoading}
                            style={{
                              padding: "12px 36px",
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              borderRadius: "var(--border-radius-sm)"
                            }}
                          >
                            {movieLoading ? "Memuat..." : "Muat Lebih Banyak"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* FEED 3: RECOMMENDATIONS */}
              {homeFeed === "recommend" && (
                <section>
                  {recommendError && <p style={{ color: "red", marginTop: "10px" }}>Gagal memuat rekomendasi.</p>}

                  {recommendLoading && allRecommendAnime.length === 0 && (
                    <div className="anime-grid">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="shimmer" style={{ width: "100%", aspectRatio: "2/3", borderRadius: "var(--border-radius-md)" }} />
                      ))}
                    </div>
                  )}

                  {allRecommendAnime.length > 0 && (
                    <>
                      <div className="anime-grid">
                        {allRecommendAnime.map((anime) => (
                          <AnimeCard
                            key={anime.id}
                            id={anime.id}
                            title={anime.title}
                            image={anime.image}
                            releaseDate={anime.releaseDate}
                          />
                        ))}
                      </div>

                      {hasMoreRecommend && (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
                          <button
                            onClick={loadMoreRecommend}
                            className="btn btn-primary"
                            disabled={recommendLoading}
                            style={{
                              padding: "12px 36px",
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              borderRadius: "var(--border-radius-sm)"
                            }}
                          >
                            {recommendLoading ? "Memuat..." : "Muat Lebih Banyak"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* 2.5 JADWAL TAB */}
      {!submittedQuery && activeTab === "schedule" && (
        <section>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>
            📅 Jadwal <span className="gradient-text">Rilis Mingguan</span>
          </h2>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
            Update rilis terbaru terjadwal setiap hari.
          </p>

          {scheduleError && <p style={{ color: "red" }}>Gagal memuat jadwal rilis.</p>}

          {scheduleLoading && scheduleData.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px" }}>
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="shimmer" style={{ width: "90px", height: "40px", borderRadius: "50px", flexShrink: 0 }} />
                ))}
              </div>
              <div className="anime-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="shimmer" style={{ width: "100%", aspectRatio: "2/3", borderRadius: "var(--border-radius-md)" }} />
                ))}
              </div>
            </div>
          )}

          {scheduleData.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Day selector pills */}
              <div 
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "10px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none"
                }} 
                className="day-pills-container"
              >
                {scheduleData.map((d) => {
                  const isActive = selectedDay.toLowerCase() === d.day.toLowerCase();
                  return (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDay(d.day)}
                      style={{
                        background: isActive ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.03)",
                        color: isActive ? "#000" : "var(--foreground-secondary)",
                        border: "1px solid " + (isActive ? "rgba(6, 182, 212, 0.3)" : "var(--glass-border)"),
                        padding: "8px 24px",
                        borderRadius: "50px",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        transition: "var(--transition-smooth)",
                        boxShadow: isActive ? "var(--shadow-glow)" : "none",
                        whiteSpace: "nowrap",
                        flexShrink: 0
                      }}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>

              {/* List of anime for active day */}
              {(() => {
                const activeDayObj = scheduleData.find(d => d.day.toLowerCase() === selectedDay.toLowerCase());
                const list = activeDayObj ? activeDayObj.animeList || [] : [];
                
                if (list.length === 0) {
                  return (
                    <div className="glass" style={{ padding: "40px", textAlign: "center", borderRadius: "var(--border-radius-md)" }}>
                      <p style={{ color: "var(--foreground-secondary)" }}>Tidak ada anime rilis untuk hari ini.</p>
                    </div>
                  );
                }

                return (
                  <div className="anime-grid">
                    {list.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        id={anime.link}
                        title={anime.anime_name}
                        image={anime.cover}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </section>
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
                  server={anime.server || "animelovers"}
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
                    server={item.server || "animelovers"}
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
