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
    const url = `https://gogoanime.by/series/${id}/`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Anime tidak ditemukan" }, { status: 404 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1').text().trim();
    const image = $('.ts-post-image').attr('src') || '';
    const description = $('.ninfo').text().trim() || $('.ninfo p').text().trim() || '';

    // Extract details
    let status = 'Unknown';
    let type = 'TV';
    const genres = [];

    $('.bigcontent b').each((i, el) => {
      const label = $(el).text().trim().toLowerCase();
      const parentText = $(el).parent().text().trim();
      const value = parentText.replace($(el).text(), '').trim();

      if (label.includes('status')) {
        status = value;
      } else if (label.includes('type')) {
        type = value;
      }
    });

    // Extract genres from div.genxed
    $('.genxed a').each((i, el) => {
      genres.push($(el).text().trim());
    });

    // Extract episodes ONLY from the main episodes list container (.episodes-container)
    const episodes = [];
    $('.episodes-container a').each((i, el) => {
      const href = $(el).attr('href') || '';
      // Match: /naruto-shippuuden-episode-500-english-subbed/
      const match = href.match(/\/([a-zA-Z0-9\-]+-episode-(\d+)[a-zA-Z0-9\-]*)\/?$/);
      if (match) {
        const episodeId = match[1];
        const episodeNumber = parseInt(match[2], 10);

        if (!episodes.some(ep => ep.number === episodeNumber)) {
          episodes.push({
            id: episodeId,
            number: episodeNumber,
            title: `Episode ${episodeNumber}`
          });
        }
      }
    });

    // Sort episodes ascending (1, 2, 3...)
    episodes.sort((a, b) => a.number - b.number);

    return NextResponse.json({
      title,
      image,
      description,
      status,
      type,
      genres,
      episodes
    });
  } catch (error) {
    console.error("Info API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil detail anime" }, { status: 500 });
  }
}
