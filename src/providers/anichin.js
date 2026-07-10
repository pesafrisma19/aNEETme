import * as cheerio from "cheerio";

const ANICHIN_BASE = "https://anichin.watch";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache"
};

// Helper function untuk fetch dengan Proxy
async function fetchWithProxy(url) {
  const proxyBase = process.env.CF_PROXY;
  const finalUrl = proxyBase ? `${proxyBase}?url=${encodeURIComponent(url)}` : url;
  
  return fetch(finalUrl, { headers: HEADERS });
}

const AnichinProvider = {
  id: 'anichin',
  name: 'Anichin',
  desc: 'Donghua dengan Subtitle Indonesia',
  logo: 'https://anichin.watch/wp-content/uploads/2024/09/Logo-1.webp',
  
  capabilities: {
    hasMovies: false, // anichin does not explicitly have a "movies" tab in its filter
    hasRecommendations: true, // we can use popular/rating
    hasRecent: true,
    hasSearch: true,
    hasSchedule: false, // can implement later
    recentLabel: "Terkini",
    recommendationsLabel: "Populer",
    genres: [
      { name: "Action", slug: "action" },
      { name: "Adventure", slug: "adventure" },
      { name: "Comedy", slug: "comedy" },
      { name: "Cultivation", slug: "cultivation" },
      { name: "Demons", slug: "demons" },
      { name: "Drama", slug: "drama" },
      { name: "Ecchi", slug: "ecchi" },
      { name: "Fantasy", slug: "fantasy" },
      { name: "Friendship", slug: "friendship" },
      { name: "Game", slug: "game" },
      { name: "Harem", slug: "harem" },
      { name: "Historical", slug: "historical" },
      { name: "Horror", slug: "horror" },
      { name: "Isekai", slug: "isekai" },
      { name: "Life", slug: "life" },
      { name: "Magic", slug: "magic" },
      { name: "Martial Arts", slug: "martial-arts" },
      { name: "Mecha", slug: "mecha" },
      { name: "Military", slug: "military" },
      { name: "Music", slug: "music" },
      { name: "Mystery", slug: "mystery" },
      { name: "Mythology", slug: "mythology" },
      { name: "Psychological", slug: "psychological" },
      { name: "Reincarnation", slug: "reincarnation" },
      { name: "Romance", slug: "romance" },
      { name: "School", slug: "school" },
      { name: "Sci-Fi", slug: "sci-fi" },
      { name: "Shoujo", slug: "shoujo" },
      { name: "Shounen", slug: "shounen" },
      { name: "Slice of Life", slug: "slice-of-life" },
      { name: "Space", slug: "space" },
      { name: "Sports", slug: "sports" },
      { name: "Super Power", slug: "super-power" },
      { name: "Supernatural", slug: "supernatural" },
      { name: "Thriller", slug: "thriller" }
    ]
  },

  async _parseList(url) {
    try {
      const res = await fetchWithProxy(url);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      const items = [];
      $(".listupd .bs").each((i, el) => {
        const title = $(el).find("a").attr("title");
        let href = $(el).find("a").attr("href");
        let image = $(el).find("img").attr("src");
        const eps = $(el).find(".epx").text().trim();
        
        if (title && href) {
          const id = href.replace(ANICHIN_BASE, "").replace("/donghua/", "").replace(/\//g, "");
          items.push({ id, title, image, releaseDate: eps, playCount: 0 });
        }
      });
      return items;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async search(query, page = 1) {
    return this._parseList(`${ANICHIN_BASE}/page/${page}/?s=${encodeURIComponent(query)}`);
  },

  async getRecent(page = 1) {
    return this._parseList(`${ANICHIN_BASE}/donghua/page/${page}/?status=&type=&order=update`);
  },

  async getRecommendations(page = 1) {
    return this._parseList(`${ANICHIN_BASE}/donghua/page/${page}/?status=&type=&order=popular`);
  },

  async getMovies(page = 1) {
    return []; // disabled via capabilities
  },

  async getGenre(genreSlug, page = 1) {
    return this._parseList(`${ANICHIN_BASE}/donghua/page/${page}/?genre%5B0%5D=${genreSlug}&status=&type=&order=update`);
  },

  async getInfo(id) {
    try {
      const res = await fetchWithProxy(`${ANICHIN_BASE}/donghua/${id}/`);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      const title = $(".infox h1").text().trim();
      const image = $(".thumb img").attr("src");
      const synopsis = $(".entry-content").text().trim();
      
      const genres = [];
      $(".genxed a").each((i, el) => genres.push($(el).text().trim()));
      
      const episodes = [];
      $(".eplister ul li").each((i, el) => {
        const epTitle = $(el).find(".epl-num").text().trim() || $(el).find(".epl-title").text().trim();
        const epHref = $(el).find("a").attr("href");
        if (epHref) {
           episodes.push({
              id: epHref.replace(ANICHIN_BASE, "").replace(/\//g, ""),
              title: epTitle
           });
        }
      });
      
      return {
        title,
        image,
        synopsis,
        genres,
        status: "Ongoing", 
        episodes: episodes.reverse() // usually listed newest first, we want oldest first for consistent UI
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async getStream(id) {
    try {
      // id is episode slug
      const res = await fetchWithProxy(`${ANICHIN_BASE}/${id}/`);
      const html = await res.text();
      const $ = cheerio.load(html);
      
      // Look for the select.mirror options
      const options = [];
      $("select.mirror option").each((i, el) => {
         const val = $(el).attr("value");
         if (val) {
             const decoded = Buffer.from(val, 'base64').toString('ascii');
             const match = decoded.match(/src="([^"]+)"/);
             if (match) {
                 options.push(match[1]);
             }
         }
      });
      
      if (options.length > 0) {
          // just use the first valid option
          return {
              iframeSrc: options[0],
              streamUrl: null
          };
      }
      
      throw new Error("No streaming link found");
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};

export default AnichinProvider;
