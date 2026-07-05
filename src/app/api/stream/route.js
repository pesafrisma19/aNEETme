import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing 'id' parameter" }, { status: 400 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const url = `https://gogoanime.by/${id}/`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Episode tidak ditemukan" }, { status: 404 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract first player link parameters
    const $link = $('.player-type-link').eq(0);
    if (!$link.length) {
      return NextResponse.json({ error: "Video stream tidak tersedia" }, { status: 404 });
    }

    const type = $link.data('type') || 'hianime';
    const enc1 = $link.data('encrypted-url1') || '';
    const enc2 = $link.data('encrypted-url2') || '';
    const enc3 = $link.data('encrypted-url3') || '';
    const subtitle = $link.data('subtitle') || '';
    const key = $link.data('key') || '';

    // Find postId
    let postId = '11224'; // Fallback default
    const scriptText = $('script').map((i, el) => $(el).html()).get().join(' ');
    const matchPostId = scriptText.match(/defaultPostId\s*=\s*['"](\d+)['"]/);
    if (matchPostId) {
      postId = matchPostId[1];
    } else {
      const matchPostId2 = html.match(/postId\s*:\s*['"](\d+)['"]/);
      if (matchPostId2) postId = matchPostId2[1];
    }

    // Build the 9animetv embed player URL
    const params = new URLSearchParams();
    params.set(type, enc1);
    if (enc2) params.set('url2', enc2);
    if (enc3) params.set('url3', enc3);
    params.set('feature_image', 'https://i0.wp.com/gogoanime.by/wp-content/uploads/2025/02/naruto-shippuuden.webp');
    params.set('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36');
    params.set('ref', 'gogoanime.by');
    params.set('subtitle', subtitle);
    params.set('key', key);
    params.set('postId', postId);

    const playerUrl = `https://9animetv.be/wp-content/plugins/video-player/includes/player/player.php?${params.toString()}`;

    return NextResponse.json({
      sources: [
        {
          url: playerUrl,
          isM3U8: false
        }
      ]
    });
  } catch (error) {
    console.error("Stream API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil link streaming" }, { status: 500 });
  }
}
