// src/providers/animelovers.js
import * as cheerio from 'cheerio';

const AnimeloversProvider = {
  id: 'animelovers',
  name: 'AnimeLovers',
  desc: 'Server khusus pencinta anime (Update Cepat)',
  logo: 'https://www.google.com/s2/favicons?domain=animekita.org&sz=128',
  
  capabilities: {
    hasMovies: true,
    hasRecommendations: true,
    hasRecent: true,
    hasSearch: true,
    hasSchedule: true,
    recentLabel: "Terkini",
    moviesLabel: "Film Bioskop",
    recommendationsLabel: "Rekomendasi Pilihan",
    genres: [
      { name: "Semua Genre", slug: "" },
      { name: "Action", slug: "action" },
      { name: "Adventure", slug: "adventure" },
      { name: "Comedy", slug: "comedy" },
      { name: "Drama", slug: "drama" },
      { name: "Fantasy", slug: "fantasy" },
      { name: "Isekai", slug: "isekai" },
      { name: "Magic", slug: "magic" },
      { name: "Mecha", slug: "mecha" },
      { name: "Mystery", slug: "mystery" },
      { name: "Romance", slug: "romance" },
      { name: "Sci-Fi", slug: "sci-fi" },
      { name: "Slice of Life", slug: "slice-of-life" },
      { name: "Sports", slug: "sports" }
    ]
  },
  
  async search(query, page = 1) {
    const url = `https://apps.animekita.org/api/v1.2.5/search.php?keyword=${encodeURIComponent(query)}&page=${page}&per_page=30`;
    const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
    if (!res.ok) throw new Error("Gagal memuat data pencarian");
    const json = await res.json();
    const items = json.data?.[0]?.result || [];
    return items.map((item) => ({
      id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
      title: item.judul,
      image: item.cover,
      releaseDate: item.status || ""
    }));
  },

  async getRecent(page = 1) {
    const url = `https://apps.animekita.org/api/v1.2.5/home/ongoing.php?page=${page}&type=anime`;
    const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
    if (!res.ok) throw new Error("Gagal memuat data ongoing");
    const items = await res.json();
    return items.map((item) => {
      const epNum = item.lastch ? item.lastch.replace(/Ep\s*/i, "") : "";
      return {
        id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
        title: item.judul,
        image: item.cover,
        releaseDate: item.lastup || "",
        episodeNumber: epNum
      };
    });
  },

  async getMovies(page = 1) {
    const url = `https://apps.animekita.org/api/v1.2.5/movie.php?page=${page}`;
    const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
    if (!res.ok) throw new Error("Gagal memuat data movie");
    const items = await res.json();
    return items.map((item) => ({
      id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
      title: item.judul,
      image: item.cover,
      releaseDate: item.lastup || ""
    }));
  },

  async getRecommendations(page = 1) {
    const url = `https://apps.animekita.org/api/v1.2.5/rekomendasi.php?page=${page}`;
    const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
    if (!res.ok) throw new Error("Gagal memuat data rekomendasi");
    const items = await res.json();
    return items.map((item) => ({
      id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
      title: item.judul,
      image: item.cover,
      releaseDate: item.score ? `★ ${item.score}` : (item.rilis || "")
    }));
  },

  async getGenre(genre, page = 1) {
    const genreSlug = genre.endsWith("/") ? genre : `${genre}/`;
    const url = `https://apps.animekita.org/api/v1.2.5/genreseries.php?page=${page}&url=${encodeURIComponent(genreSlug.toLowerCase())}`;
    const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
    if (!res.ok) throw new Error("Gagal memuat data genre");
    const items = await res.json();
    return items.map((item) => ({
      id: item.link ? (item.link.endsWith("/") ? item.link.slice(0, -1) : item.link) : "",
      title: item.anime_name,
      image: item.thumb,
      releaseDate: item.status || ""
    }));
  },

  async getInfo(id) {
    const slug = id.split("/").filter(Boolean).pop();
    const url = `https://apps.animekita.org/api/v1.2.5/series.php?url=${slug}`;
    
    const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
    if (!res.ok) throw new Error("Gagal memuat detail dari server");

    const json = await res.json();
    if (!json.data || json.data.length === 0) throw new Error("Data anime tidak ditemukan");

    const item = json.data[0];
    
    // Parse episodes
    const episodes = [];
    if (item.chapter && Array.isArray(item.chapter)) {
      item.chapter.forEach((ep) => {
        episodes.push({
          id: ep.url ? (ep.url.endsWith("/") ? ep.url.slice(0, -1) : ep.url) : "",
          title: `Episode ${ep.ch}`,
          episodeNumber: ep.ch
        });
      });
    }

    return {
      title: item.judul,
      image: item.cover,
      synopsis: item.sinopsis,
      status: item.status,
      releaseDate: item.published,
      genres: item.genre || [],
      episodes: episodes
    };
  },

  async getStream(id) {
    const slug = id.split("/").filter(Boolean).pop();
    const url = `https://apps.animekita.org/api/v1.2.5/series/episode/data.php?url=${slug}`;
    
    const res = await fetch(url, {
      headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error("Gagal memuat stream dari server");
    
    const json = await res.json();
    if (!json.data || json.data.length === 0) throw new Error("Video tidak ditemukan");
    
    const streams = json.data[0].streams;
    let streamUrl = null;

    if (streams) {
      const hdLinks = streams["720p"] || streams["480p"] || streams["360p"] || [];
      const bestLink = hdLinks.find(s => s.link && s.link.includes(".mp4")) || hdLinks[0];
      if (bestLink) streamUrl = bestLink.link;
    }
    
    if (!streamUrl) throw new Error("Video tidak ditemukan atau format tidak didukung");

    return {
      iframeSrc: null,
      streamUrl: streamUrl
    };
  }
};

export default AnimeloversProvider;
