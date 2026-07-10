import * as cheerio from "cheerio";

const BASE_URL = "https://otakudesu.blog";

// Helper to fetch and load HTML
async function fetchHTML(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return cheerio.load(html);
  } catch (err) {
    console.error(`[Otakudesu] Error fetching ${url}:`, err);
    throw err;
  }
}

// Helper to extract ID from URL
function extractId(url) {
  if (!url) return "";
  return url.split("/").filter(Boolean).pop();
}

const OtakudesuProvider = {
  id: "otakudesu",
  name: "Otakudesu",
  desc: "Situs Streaming Anime terbesar di Indonesia",
  logo: "https://otakudesu.blog/wp-content/uploads/2022/10/Logo-Otakudesu.png",

  capabilities: {
    hasMovies: true,
    hasRecommendations: true,
    hasRecent: true,
    hasSearch: true,
    hasSchedule: true,
    genres: [
      { name: "Action", slug: "action" },
      { name: "Adventure", slug: "adventure" },
      { name: "Comedy", slug: "comedy" },
      { name: "Drama", slug: "drama" },
      { name: "Fantasy", slug: "fantasy" },
      { name: "Isekai", slug: "isekai" },
      { name: "Magic", slug: "magic" },
      { name: "Mecha", slug: "mecha" },
      { name: "Mystery", slug: "mystery" },
      { name: "Psychological", slug: "psychological" },
      { name: "Romance", slug: "romance" },
      { name: "Sci-Fi", slug: "sci-fi" },
      { name: "Seinen", slug: "seinen" },
      { name: "Shoujo", slug: "shoujo" },
      { name: "Shounen", slug: "shounen" },
      { name: "Slice of Life", slug: "slice-of-life" },
      { name: "Sports", slug: "sports" },
      { name: "Supernatural", slug: "supernatural" },
      { name: "Thriller", slug: "thriller" }
    ]
  },

  async search(query, page = 1) {
    const $ = await fetchHTML(`${BASE_URL}/page/${page}/?s=${encodeURIComponent(query)}&post_type=anime`);
    const results = [];
    
    $(".chivsrc li").each((i, el) => {
      const a = $(el).find("h2 a");
      const title = a.text() || $(el).find("h2").text();
      const url = a.attr("href") || $(el).find("a").first().attr("href");
      const image = $(el).find("img").attr("src");
      const set = $(el).find(".set").first().text();
      
      if (url && title) {
        results.push({
          id: extractId(url),
          title: title,
          image: image || "",
          releaseDate: set || ""
        });
      }
    });

    return results;
  },

  async getRecent(page = 1) {
    const $ = await fetchHTML(`${BASE_URL}/ongoing-anime/page/${page}/`);
    const results = [];

    $(".venz ul li").each((i, el) => {
      const a = $(el).find(".thumb a");
      const title = $(el).find(".jdlflm").text();
      const image = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
      const ep = $(el).find(".epz").text();
      const day = $(el).find(".epztipe").text();
      const url = a.attr("href");

      if (url && title) {
        results.push({
          id: extractId(url),
          title: title,
          image: image || "",
          releaseDate: ep,
          subOrDub: day.trim()
        });
      }
    });

    return results;
  },

  async getMovies(page = 1) {
    const $ = await fetchHTML(`${BASE_URL}/complete-anime/page/${page}/`);
    const results = [];

    $(".venz ul li").each((i, el) => {
      const a = $(el).find(".thumb a");
      const title = $(el).find(".jdlflm").text();
      const image = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
      const ep = $(el).find(".epz").text();
      const score = $(el).find(".epztipe").text();
      const url = a.attr("href");

      if (url && title) {
        results.push({
          id: extractId(url),
          title: title,
          image: image || "",
          releaseDate: ep,
          subOrDub: score.trim()
        });
      }
    });

    return results;
  },

  async getRecommendations(page = 1) {
    // Gunakan halaman complete anime yang diacak sedikit halamannya sebagai rekomendasi
    return this.getMovies(page + 2); 
  },

  async getGenre(genre, page = 1) {
    const $ = await fetchHTML(`${BASE_URL}/genres/${genre}/page/${page}/`);
    const results = [];

    $(".col-anime").each((i, el) => {
      const a = $(el).find(".col-anime-title a");
      const title = a.text();
      const url = a.attr("href");
      const image = $(el).find(".col-anime-cover img").attr("src");
      const ep = $(el).find(".col-anime-eps").text();
      
      if (url && title) {
        results.push({
          id: extractId(url),
          title: title,
          image: image || "",
          releaseDate: ep || ""
        });
      }
    });
    
    // Fallback jika classnya beda
    if (results.length === 0) {
      $(".venz ul li").each((i, el) => {
        const a = $(el).find(".thumb a");
        const title = $(el).find(".jdlflm").text();
        const image = $(el).find("img").attr("src");
        const ep = $(el).find(".epz").text();
        const url = a.attr("href");
        if (url && title) {
          results.push({ id: extractId(url), title, image: image || "", releaseDate: ep });
        }
      });
    }

    return results;
  },

  async getSchedule() {
    const $ = await fetchHTML(`${BASE_URL}/jadwal-rilis/`);
    const days = [];

    $(".kgjdw").each((i, el) => {
      const dayName = $(el).find("h2").text().trim();
      const animes = [];
      
      $(el).find("ul li").each((j, li) => {
        const a = $(li).find("a");
        const title = a.text();
        const url = a.attr("href");
        if (title && url) {
          animes.push({
            id: extractId(url),
            title: title
          });
        }
      });

      if (dayName && animes.length > 0) {
        days.push({
          day: dayName,
          animes: animes
        });
      }
    });

    return days;
  },

  async getInfo(id) {
    const $ = await fetchHTML(`${BASE_URL}/anime/${id}/`);
    
    const title = $(".fotoanime .infozingle p").first().text().replace("Judul: ", "").trim();
    const image = $(".fotoanime img").attr("src");
    
    let synopsis = "";
    $(".sinopc p").each((i, el) => {
      synopsis += $(el).text() + "\n\n";
    });

    const genres = [];
    $(".fotoanime .infozingle p").each((i, el) => {
      const text = $(el).text();
      if (text.includes("Genre:")) {
        $(el).find("a").each((j, a) => {
          genres.push($(a).text());
        });
      }
    });

    const episodes = [];
    $(".episodelist ul li").each((i, el) => {
      const a = $(el).find("a");
      const epTitle = a.text();
      const link = a.attr("href");
      const date = $(el).find(".zeebr").text();
      
      if (link && epTitle && link.includes("/episode/")) {
        episodes.push({
          id: extractId(link),
          title: epTitle,
          episodeNumber: episodes.length + 1, // Akan dibalik nanti jika urutannya descending
          releaseDate: date
        });
      }
    });
    
    // Otakudesu defaultnya descending (Episode terbaru di atas)
    // Reverse agar berurutan dari ep 1 ke atas
    episodes.reverse();
    // Re-assign episode number
    episodes.forEach((ep, i) => { ep.episodeNumber = i + 1; });

    return {
      id,
      title: title || id.replace(/-/g, " "),
      image: image || "",
      cover: image || "",
      synopsis: synopsis.trim() || "Tidak ada sinopsis.",
      genres: genres,
      totalEpisodes: episodes.length,
      episodes: episodes
    };
  },

  async getStream(id) {
    const $ = await fetchHTML(`${BASE_URL}/episode/${id}/`);
    
    // Otakudesu menggunakan iframe atau script untuk embed
    let iframeSrc = "";
    
    const iframe = $(".responsive-embed-stream iframe").attr("src") || $("iframe").attr("src");
    if (iframe) {
      iframeSrc = iframe;
    } else {
      // Coba cari di dalam script jquery replaceTag
      const htmlText = $.html();
      const match = htmlText.match(/<iframe.*?src="(.*?)".*?><\/iframe>/);
      if (match && match[1]) {
        iframeSrc = match[1];
      }
    }

    return {
      iframeSrc: iframeSrc,
      streamUrl: null
    };
  }
};

export default OtakudesuProvider;
