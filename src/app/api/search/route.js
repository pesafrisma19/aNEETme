import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type");

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    let keyword = query || "a";
    if (!query && type === "top") {
      keyword = "tensei"; // Fetch popular isekai titles for top list
    } else if (!query && type === "recent") {
      keyword = "2026"; // Fetch recent releases
    }

    const url = `https://apps.animekita.org/api/v1.2.5/search.php?keyword=${encodeURIComponent(keyword)}&page=1&per_page=30`;
    
    const res = await fetch(url, {
      headers: {
        "accept": "application/json",
        "user-agent": "Dart/3.9 (dart:io)"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Gagal memuat data dari AnimeKita" }, { status: res.status });
    }

    const json = await res.json();
    const items = json.data?.[0]?.result || [];

    const results = items.map((item) => ({
      id: item.url, // Use url identifier as ID for details route compatibility
      title: item.judul,
      image: item.cover,
      releaseDate: item.status || ""
    }));

    if (query) {
      // Direct array for frontend search compatibility
      return NextResponse.json(results);
    }

    // Object wrapping array for recent/top homepage lists compatibility
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Gagal memuat pencarian" }, { status: 500 });
  }
}
