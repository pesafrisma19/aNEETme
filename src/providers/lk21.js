// src/providers/lk21.js
import * as cheerio from 'cheerio';

const baseUrl = "https://lk21.de";

async function fetchHtml(url) {
  const res = await fetch(url, { 
    headers: { 
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    next: { revalidate: 3600 } 
  });
  return await res.text();
}

const LK21Provider = {
  id: 'lk21',
  name: 'LK21',
  desc: 'Server Film & Live Action (Butuh Proxy/VPS)',

  capabilities: {
    hasMovies: true,
    hasRecommendations: true,
    hasRecent: true,
    hasSearch: true,
    hasSchedule: false,
    genres: [
      { name: "Semua Genre", slug: "" },
      { name: "Action", slug: "action" },
      { name: "Adventure", slug: "adventure" },
      { name: "Animation", slug: "animation" },
      { name: "Comedy", slug: "comedy" },
      { name: "Crime", slug: "crime" },
      { name: "Drama", slug: "drama" },
      { name: "Family", slug: "family" },
      { name: "Fantasy", slug: "fantasy" },
      { name: "Horror", slug: "horror" },
      { name: "Romance", slug: "romance" },
      { name: "Sci-Fi", slug: "sci-fi" },
      { name: "Thriller", slug: "thriller" }
    ]
  },
  
  async search(query, page = 1) {
    // Catatan: LK21 search saat ini rusak (membutuhkan bypass Cloudflare ke gudangvape.com)
    // Namun kita biarkan format URL-nya sesuai struktur lamanya
    let url = `${baseUrl}/search/${encodeURIComponent(query)}`;
    if (page > 1) url += `/page/${page}`;
    return await this._scrapeList(url);
  },

  async getRecent(page = 1) {
    let url = `${baseUrl}/latest`;
    if (page > 1) url += `/page/${page}`;
    return await this._scrapeList(url);
  },

  async getMovies(page = 1) {
    // LK21 latest is basically movies
    return await this.getRecent(page);
  },

  async getRecommendations(page = 1) {
    let url = `${baseUrl}/populer`;
    if (page > 1) url += `/page/${page}`;
    return await this._scrapeList(url);
  },

  async getGenre(genre, page = 1) {
    let url = `${baseUrl}/genre/${encodeURIComponent(genre.toLowerCase())}`;
    if (page > 1) url += `/page/${page}`;
    return await this._scrapeList(url);
  },

  async _scrapeList(url) {
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);

      const results = [];
      $('article[itemtype="https://schema.org/Movie"]').each((i, el) => {
        const $el = $(el);
        const itemUrl = $el.find('a[itemprop="url"]').attr('href') || "";
        const id = itemUrl.replace(baseUrl, "").replace(/^\/|\/$/g, "");
        const title = $el.find('.poster-title').text().trim() || $el.find('h2, h3').text().trim();
        let image = $el.find('img').attr('src') || "";
        if (image.startsWith('//')) image = `https:${image}`;
        
        let releaseDate = $el.find('.year').text().trim();
        const rating = $el.find('.rating').text().trim();
        if (rating) releaseDate += ` • ${rating}`;

        results.push({ id, title, image, releaseDate });
      });
      return results;
    } catch (e) {
      console.error("LK21 _scrapeList error:", e);
      return [];
    }
  },

  async getInfo(id) {
    try {
      const url = `${baseUrl}/${id}`;
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);

      const title = $('h1[itemprop="name"]').text().trim();
      let image = $('figure.poster img').attr('src') || "";
      if (image.startsWith('//')) image = `https:${image}`;
      
      const synopsis = $('div[itemprop="description"]').text().trim() || "Tidak ada sinopsis.";
      const status = "";
      const releaseDate = $('meta[itemprop="datePublished"]').attr('content') || "";
      
      const genres = [];
      $('div[itemprop="genre"] a').each((i, el) => {
        genres.push($(el).text().trim());
      });

      return {
        title,
        image,
        synopsis,
        status,
        releaseDate,
        genres,
        episodes: [
          {
            id: id,
            title: "Nonton Movie",
            episodeNumber: "1"
          }
        ]
      };
    } catch (error) {
      console.error("LK21 getInfo error:", error);
      throw new Error("Gagal memuat detail dari LK21");
    }
  },

  async getStream(id) {
    try {
      const url = `${baseUrl}/${id}`;
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);

      const iframeSrc = $('#player-iframe').attr('src') || $('iframe').first().attr('src');
      if (!iframeSrc) {
        throw new Error("Iframe video tidak ditemukan");
      }

      return {
        iframeSrc,
        streamUrl: null
      };
    } catch (error) {
      console.error("LK21 getStream error:", error);
      throw new Error("Gagal memuat video LK21");
    }
  }
};

export default LK21Provider;
