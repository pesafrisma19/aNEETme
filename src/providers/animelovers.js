// src/providers/animelovers.js
import * as cheerio from 'cheerio';

const AnimeloversProvider = {
  id: 'animelovers',
  name: 'AnimeLovers',
  desc: 'Server khusus pencinta anime (Update Cepat)',
  
  capabilities: {
    hasMovies: true,
    hasRecommendations: true,
    hasRecent: true,
    hasSearch: true,
    hasSchedule: true,
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
    const slug = id.split("/").pop();
    const cleanSlug = slug.replace(/-\d+$/, "");
    const url = `https://apps.animekita.org/api/v1.2.5/anime.php?id=${cleanSlug}`;
    
    const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
    if (!res.ok) throw new Error("Gagal memuat detail dari server");

    const json = await res.json();
    if (!json.data || json.data.length === 0) throw new Error("Data anime tidak ditemukan");

    const item = json.data[0];
    
    // Parse episodes
    const episodes = [];
    if (json.list_episode && Array.isArray(json.list_episode)) {
      json.list_episode.forEach((ep) => {
        episodes.push({
          id: ep.link ? (ep.link.endsWith("/") ? ep.link.slice(0, -1) : ep.link) : "",
          title: ep.title,
          episodeNumber: ep.title.replace(/[^\d.]/g, "")
        });
      });
    }

    return {
      title: item.judul,
      image: item.cover,
      synopsis: item.sinopsis,
      status: item.status,
      releaseDate: item.rilis,
      genres: item.genre ? item.genre.split(',').map(g => g.trim()) : [],
      episodes: episodes
    };
  },

  async getStream(id) {
    // Note: The original Sakura/Animelovers stream route scraped HTML to find the iframe
    const url = id.startsWith("http") ? id : `https://anime-indo.biz/${id}`;
    
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error("Gagal memuat halaman episode dari Anime-Indo");
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const iframeSrc = $(".player-area iframe").attr("src");
    if (!iframeSrc) throw new Error("Video tidak ditemukan (Mungkin diblokir atau error)");

    return {
      iframeSrc,
      streamUrl: null
    };
  }
};

export default AnimeloversProvider;
