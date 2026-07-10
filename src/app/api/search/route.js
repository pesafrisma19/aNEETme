import { NextResponse } from "next/server";
import { scrapeLK21List } from "@/utils/scrapers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type");
  const genre = searchParams.get("genre");
  const page = searchParams.get("page") || "1";
  const server = searchParams.get("server") || "sakura";

  if (server === "cinema" || server === "dynasty") {
    let baseUrl = server === "cinema" ? "https://d21.team" : "https://tv4.nontondrama.my";
    let targetUrl = `${baseUrl}/latest`;

    if (query) {
      targetUrl = `${baseUrl}/search/${encodeURIComponent(query)}`;
    } else if (genre) {
      targetUrl = `${baseUrl}/genre/${encodeURIComponent(genre.toLowerCase())}`;
    }

    if (page && parseInt(page) > 1) {
      targetUrl += `/page/${page}`;
    }

    const results = await scrapeLK21List(targetUrl);
    return NextResponse.json({ results });
  }

  if (server !== "sakura") {
    return NextResponse.json({ results: [] });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    // 1. If it's a genre query
    if (genre) {
      const genreSlug = genre.endsWith("/") ? genre : `${genre}/`;
      const url = `https://apps.animekita.org/api/v1.2.5/genreseries.php?page=${page}&url=${encodeURIComponent(genreSlug.toLowerCase())}`;
      
      const res = await fetch(url, {
        headers: {
          "accept": "application/json",
          "user-agent": "Dart/3.9 (dart:io)"
        }
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Gagal memuat data genre" }, { status: res.status });
      }

      const items = await res.json();
      
      const results = items.map((item) => ({
        id: item.link ? (item.link.endsWith("/") ? item.link.slice(0, -1) : item.link) : "",
        title: item.anime_name,
        image: item.thumb,
        releaseDate: item.status || ""
      }));

      return NextResponse.json({ results });
    }

    // 2. If it's a search query
    if (query) {
      const url = `https://apps.animekita.org/api/v1.2.5/search.php?keyword=${encodeURIComponent(query)}&page=${page}&per_page=30`;
      const res = await fetch(url, {
        headers: {
          "accept": "application/json",
          "user-agent": "Dart/3.9 (dart:io)"
        }
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Gagal memuat data pencarian" }, { status: res.status });
      }

      const json = await res.json();
      const items = json.data?.[0]?.result || [];

      const results = items.map((item) => ({
        id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
        title: item.judul,
        image: item.cover,
        releaseDate: item.status || ""
      }));

      return NextResponse.json(results);
    }

    // 3. Movie Feed (movie.php)
    if (type === "movie") {
      const url = `https://apps.animekita.org/api/v1.2.5/movie.php?page=${page}`;
      const res = await fetch(url, {
        headers: {
          "accept": "application/json",
          "user-agent": "Dart/3.9 (dart:io)"
        }
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Gagal memuat data movie" }, { status: res.status });
      }

      const items = await res.json();
      const results = items.map((item) => ({
        id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
        title: item.judul,
        image: item.cover,
        releaseDate: item.lastup || ""
      }));

      return NextResponse.json({ results });
    }

    // 4. Recommendation Feed (rekomendasi.php)
    if (type === "recommend") {
      const url = `https://apps.animekita.org/api/v1.2.5/rekomendasi.php?page=${page}`;
      const res = await fetch(url, {
        headers: {
          "accept": "application/json",
          "user-agent": "Dart/3.9 (dart:io)"
        }
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Gagal memuat data rekomendasi" }, { status: res.status });
      }

      const items = await res.json();
      const results = items.map((item) => ({
        id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
        title: item.judul,
        image: item.cover,
        releaseDate: item.score ? `★ ${item.score}` : (item.rilis || "")
      }));

      return NextResponse.json({ results });
    }

    // 5. Recent/Ongoing updates feed (home/ongoing.php)
    if (type === "recent" || !type) {
      const url = `https://apps.animekita.org/api/v1.2.5/home/ongoing.php?page=${page}&type=anime`;
      const res = await fetch(url, {
        headers: {
          "accept": "application/json",
          "user-agent": "Dart/3.9 (dart:io)"
        }
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Gagal memuat data ongoing" }, { status: res.status });
      }

      const items = await res.json();

      const results = items.map((item) => {
        const epNum = item.lastch ? item.lastch.replace(/Ep\s*/i, "") : "";
        return {
          id: item.url ? (item.url.endsWith("/") ? item.url.slice(0, -1) : item.url) : "",
          title: item.judul,
          image: item.cover,
          releaseDate: item.lastup || "",
          episodeNumber: epNum
        };
      });

      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("Search/Browse API Error:", error);
    return NextResponse.json({ error: "Gagal memuat data dari server" }, { status: 500 });
  }
}
