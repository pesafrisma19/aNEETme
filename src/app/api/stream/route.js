import { NextResponse } from "next/server";
import { scrapeLK21Info } from "@/utils/scrapers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // This is the url key (e.g. al-154132-1)

  const server = searchParams.get("server") || "sakura";

  if (!id) {
    return NextResponse.json({ error: "Missing 'id' parameter" }, { status: 400 });
  }

  if (server === "cinema" || server === "dynasty") {
    const baseUrl = server === "cinema" ? "https://d21.team" : "https://tv4.nontondrama.my";
    const targetUrl = `${baseUrl}/${id}`;
    
    const data = await scrapeLK21Info(targetUrl);
    if (!data || !data.iframeSrc) {
      return NextResponse.json({ error: "Video tidak ditemukan di server ini" }, { status: 404 });
    }

    return NextResponse.json({ iframeSrc: data.iframeSrc });
  }

  if (server !== "sakura") {
    return NextResponse.json({ error: "Server API belum tersedia" }, { status: 404 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    // 1. Programmatic Login using randomized credentials for unlimited free tickets
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const randomUser = `User_${randomId}`;
    const randomEmail = `user_${randomId}@gmail.com`;

    const loginRes = await fetch("https://apps.animekita.org/api/v1.2.5/model/login.php", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "text/plain; charset=utf-8",
        "user-agent": "Dart/3.9 (dart:io)"
      },
      body: JSON.stringify({
        "user": randomUser,
        "email": randomEmail,
        "profil": ""
      })
    });

    if (!loginRes.ok) {
      return NextResponse.json({ error: "Gagal login ke AnimeKita" }, { status: loginRes.status });
    }

    const loginData = await loginRes.json();
    const token = loginData.data?.[0]?.token;

    if (!token) {
      return NextResponse.json({ error: "Gagal mendapatkan token autentikasi" }, { status: 500 });
    }

    // 2. Parse episode number from ID (e.g., al-154132-1 -> episode 1)
    const episodeNum = id.split("-").pop() || "1";

    // 3. Fetch episode streams
    const streamRes = await fetch(`https://apps.animekita.org/api/v1.2.5/series/episode/data.php?url=${id}`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "text/plain; charset=utf-8",
        "user-agent": "Flutter/2.5.3"
      },
      body: JSON.stringify({
        "post_type": "2",
        "post_id": id,
        "series_id": "",
        "series_url": "",
        "episode": episodeNum,
        "token": token
      })
    });

    if (!streamRes.ok) {
      return NextResponse.json({ error: "Gagal mengambil data streaming dari AnimeKita" }, { status: streamRes.status });
    }

    const streamData = await streamRes.json();
    const info = streamData.data?.[0];

    if (!info || !info.streams) {
      return NextResponse.json({ error: "Video stream tidak tersedia" }, { status: 404 });
    }

    // 4. Map streams — wrap ALL urls through our proxy to avoid sec-fetch-site: cross-site blocking
    const sources = [];
    const resolutions = ["1080p", "720p", "480p", "360p"];

    for (const reso of resolutions) {
      const streamList = info.streams[reso] || [];
      // Prefer animekita storage links, fallback to pixeldrain
      const directStream = streamList.find(s => s.link.includes("animekita.org")) || streamList[0];
      if (directStream && directStream.link) {
        // Only route pixeldrain.com through our proxy to save Vercel serverless bandwidth.
        // Direct animekita.org storage links play fine without proxying.
        const finalUrl = directStream.link.includes("pixeldrain.com")
          ? `/api/proxy?url=${encodeURIComponent(directStream.link)}`
          : directStream.link;

        sources.push({
          url: finalUrl,
          quality: reso,
          isM3U8: directStream.link.includes(".m3u8")
        });
      }
    }

    if (sources.length === 0) {
      return NextResponse.json({ error: "Tidak ada link streaming video yang valid" }, { status: 404 });
    }

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Stream API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil link streaming" }, { status: 500 });
  }
}
