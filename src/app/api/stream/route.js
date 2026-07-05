import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // This is the url key (e.g. al-154132-1)

  if (!id) {
    return NextResponse.json({ error: "Missing 'id' parameter" }, { status: 400 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    // 1. Programmatic Login to get fresh token
    const loginRes = await fetch("https://apps.animekita.org/api/v1.2.5/model/login.php", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "text/plain; charset=utf-8",
        "user-agent": "Dart/3.9 (dart:io)"
      },
      body: JSON.stringify({
        "user": "Gemini Tujuh",
        "email": "geminitujuh00019@gmail.com",
        "profil": "https://lh3.googleusercontent.com/a/ACg8ocKDmEYbdtB76hv6loaY5Ead7kx-Dw7JndSqUqbuaxRcUrU5ng=s96-c"
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

    // 4. Map streams
    const sources = [];
    const resolutions = ["1080p", "720p", "480p", "360p"];

    for (const reso of resolutions) {
      const streamList = info.streams[reso] || [];
      // Prefer animekita storage links as they are direct MP4 streams, fallback to others like pixeldrain
      const directStream = streamList.find(s => s.link.includes("animekita.org")) || streamList[0];
      if (directStream && directStream.link) {
        sources.push({
          url: directStream.link,
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
