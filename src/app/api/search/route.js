import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type");
  const genre = searchParams.get("genre");
  const page = searchParams.get("page") || "1";

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    // If it's a genre query
    if (genre) {
      // Ensure genre parameter ends with a slash (e.g. action/)
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
        id: item.link, // In genreseries.php, the slug is in the 'link' property
        title: item.anime_name, // In genreseries.php, it's 'anime_name'
        image: item.thumb, // In genreseries.php, it's 'thumb'
        releaseDate: item.status || ""
      }));

      return NextResponse.json({ results });
    }

    // If it's a search query
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
        id: item.url,
        title: item.judul,
        image: item.cover,
        releaseDate: item.status || ""
      }));

      return NextResponse.json(results);
    }

    // If it is the home/ongoing updates feed
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

      // The ongoing.php endpoint returns a direct JSON array, not wrapped in { data: [...] }
      const items = await res.json();

      const results = items.map((item) => {
        // Clean episode number (e.g. "Ep 37" -> "37")
        const epNum = item.lastch ? item.lastch.replace(/Ep\s*/i, "") : "";
        return {
          id: item.url,
          title: item.judul,
          image: item.cover,
          releaseDate: item.lastup || "",
          episodeNumber: epNum
        };
      });

      return NextResponse.json({ results });
    }

    // If it is the popular/top list
    if (type === "top") {
      // Use search with a popular keyword like 'tensei' to get hot hits for top list
      const url = `https://apps.animekita.org/api/v1.2.5/search.php?keyword=tensei&page=1&per_page=15`;
      const res = await fetch(url, {
        headers: {
          "accept": "application/json",
          "user-agent": "Dart/3.9 (dart:io)"
        }
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Gagal memuat data top anime" }, { status: res.status });
      }

      const json = await res.json();
      const items = json.data?.[0]?.result || [];

      const results = items.map((item) => ({
        id: item.url,
        title: item.judul,
        image: item.cover,
        releaseDate: item.status || ""
      }));

      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("Search/Genre API Error:", error);
    return NextResponse.json({ error: "Gagal memuat data dari server" }, { status: 500 });
  }
}
