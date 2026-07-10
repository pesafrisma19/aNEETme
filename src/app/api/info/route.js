import { NextResponse } from "next/server";
import { scrapeLK21Info } from "@/utils/scrapers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // This is the url key (e.g. mushoku-ni-tensei-s3-sub-indo)
  const server = searchParams.get("server") || "sakura";

  if (!id) {
    return NextResponse.json({ error: "Missing 'id' parameter" }, { status: 400 });
  }

  if (server === "cinema" || server === "dynasty") {
    const baseUrl = server === "cinema" ? "https://lk21.de" : "https://tv4.nontondrama.my";
    const targetUrl = `${baseUrl}/${id}`;
    
    const data = await scrapeLK21Info(targetUrl);
    if (!data) {
      return NextResponse.json({ error: "Failed to scrape info" }, { status: 500 });
    }

    // Map to expected format by the frontend
    const results = {
      title: data.title,
      image: data.image,
      synopsis: data.synopsis,
      genres: data.details.genre ? data.details.genre.split(',').map(g => g.trim()) : [],
      releaseDate: data.details.release || "",
      status: "Ongoing",
      type: data.episodes.length > 0 ? "series" : "movie",
      episodes: data.episodes.map(ep => ({
        title: ep.title,
        id: ep.link.replace(baseUrl + '/', '').replace(/^\/|\/$/g, '')
      })),
      // Optional: send iframeSrc directly if we are skipping the episode page
      iframeSrc: data.iframeSrc
    };
    return NextResponse.json({ results });
  }

  if (server !== "sakura") {
    // Placeholder for other servers
    return NextResponse.json({ error: "Server API belum tersedia" }, { status: 404 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    // We MUST pass ?url=ID in the URL query parameters
    const url = `https://apps.animekita.org/api/v1.2.5/series.php?url=${encodeURIComponent(id)}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "text/plain; charset=utf-8",
        "user-agent": "Dart/3.9 (dart:io)"
      },
      body: JSON.stringify({
        "get": "top",
        "post_type": "1",
        "post_id": id,
        "token": ""
      })
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("AnimeKita response not OK:", res.status, text);
      return NextResponse.json({ error: "Gagal mengambil detail dari AnimeKita" }, { status: res.status });
    }

    try {
      // Bulletproof JSON parsing: strip any PHP warning tags if present
      const jsonStart = text.indexOf('{');
      if (jsonStart === -1) {
        throw new Error("No JSON payload found in response");
      }
      const cleanText = text.substring(jsonStart);
      const json = JSON.parse(cleanText);
      const info = json.data?.[0];

      if (!info || info.id === 0 || !info.judul) {
        return NextResponse.json({ error: "Anime tidak ditemukan atau data kosong" }, { status: 404 });
      }

      // Map genres
      const genres = info.genre || [];

      // Map episodes/chapters
      const episodes = (info.chapter || []).map((ch) => ({
        id: ch.url, // This will be passed to /api/stream?id=al-154132-1
        number: parseInt(ch.ch, 10) || 1,
        title: `Episode ${ch.ch}`
      }));

      // Sort episodes ascending
      episodes.sort((a, b) => a.number - b.number);

      return NextResponse.json({
        title: info.judul,
        image: info.cover,
        description: info.sinopsis || "Tidak ada deskripsi.",
        status: info.status || "Unknown",
        type: info.type || "TV",
        genres,
        episodes
      });
    } catch (parseError) {
      console.error("Failed to parse AnimeKita response. Raw text:", text);
      throw parseError;
    }
  } catch (error) {
    console.error("Info API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil detail anime" }, { status: 500 });
  }
}
