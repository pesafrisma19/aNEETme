import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type");

  // Bypass TLS locally
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    if (query) {
      // Search GogoAnime
      const url = `https://gogoanime.by/?s=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);
      const results = [];

      // Extract results from main container
      $('.listupd .bsx a.tip').each((i, el) => {
        const href = $(el).attr('href') || '';
        const match = href.match(/\/series\/(.*?)\/?$/);
        if (match) {
          const id = match[1];
          const title = $(el).find('h2[itemprop="headline"]').text().trim() || $(el).attr('title') || '';
          const image = $(el).find('img.ts-post-image').attr('src') || '';
          const status = $(el).find('span.epx').text().trim();
          results.push({ id, title, image, releaseDate: status });
        }
      });

      // Return array directly for frontend search tab compat
      return NextResponse.json(results);
    }

    // Default: Scrape homepage recent episodes
    const res = await fetch("https://gogoanime.by/");
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];

    $('a.tip').each((i, el) => {
      const href = $(el).attr('href') || '';
      const title = $(el).find('h2[itemprop="headline"]').text().trim() || $(el).attr('title') || '';
      const image = $(el).find('img.ts-post-image').attr('src') || '';
      const status = $(el).find('span.epx').text().trim();

      const match = href.match(/\/([a-zA-Z0-9\-]+)-episode-\d+/);
      const id = match ? match[1] : '';

      if (id && id !== 'series') {
        results.push({
          id,
          title: title.replace(/Episode \d+.*$/, '').trim(),
          image,
          releaseDate: status
        });
      }
    });

    const uniqueResults = [];
    const seenIds = new Set();
    for (const item of results) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueResults.push(item);
      }
    }

    if (type === "top") {
      return NextResponse.json({ results: uniqueResults.slice(0, 10) });
    }

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data dari provider" }, { status: 500 });
  }
}
