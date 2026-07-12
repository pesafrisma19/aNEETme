import { NextResponse } from "next/server";
import { getProvider } from "@/providers";

export async function GET(request, { params }) {
  const { provider: server } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type");
  const genre = searchParams.get("genre");
  const page = searchParams.get("page") || "1";

  const provider = getProvider(server);
  if (!provider) {
    return NextResponse.json({ results: [] });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    let results = [];
    if (genre) {
      results = await provider.getGenre(genre, page);
    } else if (query) {
      results = await provider.search(query, page);
    } else if (type === "movie") {
      results = await provider.getMovies(page);
    } else if (type === "recommend") {
      results = await provider.getRecommendations(page);
    } else {
      // Recent/Ongoing
      results = await provider.getRecent(page);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error(`[${server}] API Error:`, error);
    return NextResponse.json({ error: "Gagal memuat data dari server" }, { status: 500 });
  }
}
