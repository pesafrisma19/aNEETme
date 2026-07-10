const BASE_URL = "https://www.sankavollerei.web.id/anime";

// Helper to fetch JSON from API
async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error(`[Otakudesu API] Error fetching ${endpoint}:`, err);
    throw err;
  }
}

// Map the anime item structure to our common structure
function mapAnimeItem(item) {
  return {
    id: item.animeId,
    title: item.title,
    image: item.poster || "",
    releaseDate: item.latestReleaseDate || item.lastReleaseDate || item.season || "",
    subOrDub: item.releaseDay || item.score || ""
  };
}

const OtakudesuProvider = {
  id: "otakudesu",
  name: "Otakudesu",
  desc: "Situs Streaming Anime (Powered by Sanka API)",
  logo: "https://otakudesu.blog/wp-content/uploads/2022/10/Logo-Otakudesu.png",

  capabilities: {
    hasMovies: true,
    hasRecommendations: true,
    hasRecent: true,
    hasSearch: true,
    hasSchedule: true,
    recentLabel: "Ongoing",
    moviesLabel: "Anime Tamat",
    recommendationsLabel: "Rekomendasi",
    genres: [
      {"name":"Action","slug":"action"},{"name":"Adventure","slug":"adventure"},{"name":"Comedy","slug":"comedy"},
      {"name":"Demons","slug":"demons"},{"name":"Drama","slug":"drama"},{"name":"Ecchi","slug":"ecchi"},
      {"name":"Fantasy","slug":"fantasy"},{"name":"Game","slug":"game"},{"name":"Harem","slug":"harem"},
      {"name":"Historical","slug":"historical"},{"name":"Horror","slug":"horror"},{"name":"Josei","slug":"josei"},
      {"name":"Magic","slug":"magic"},{"name":"Martial Arts","slug":"martial-arts"},{"name":"Mecha","slug":"mecha"},
      {"name":"Military","slug":"military"},{"name":"Music","slug":"music"},{"name":"Mystery","slug":"mystery"},
      {"name":"Psychological","slug":"psychological"},{"name":"Parody","slug":"parody"},{"name":"Police","slug":"police"},
      {"name":"Romance","slug":"romance"},{"name":"Samurai","slug":"samurai"},{"name":"School","slug":"school"},
      {"name":"Sci-Fi","slug":"sci-fi"},{"name":"Seinen","slug":"seinen"},{"name":"Shoujo","slug":"shoujo"},
      {"name":"Shoujo Ai","slug":"shoujo-ai"},{"name":"Shounen","slug":"shounen"},{"name":"Slice of Life","slug":"slice-of-life"},
      {"name":"Sports","slug":"sports"},{"name":"Space","slug":"space"},{"name":"Super Power","slug":"super-power"},
      {"name":"Supernatural","slug":"supernatural"},{"name":"Thriller","slug":"thriller"},{"name":"Vampire","slug":"vampire"}
    ]
  },

  async search(query, page = 1) {
    // Sanka API search might not support pagination param natively in docs but we can just pass the query
    const data = await fetchAPI(`/search/${encodeURIComponent(query)}`);
    return (data.animeList || []).map(mapAnimeItem);
  },

  async getRecent(page = 1) {
    const data = await fetchAPI(`/ongoing-anime?page=${page}`);
    return (data.animeList || []).map(mapAnimeItem);
  },

  async getMovies(page = 1) {
    const data = await fetchAPI(`/complete-anime?page=${page}`);
    return (data.animeList || []).map(mapAnimeItem);
  },

  async getRecommendations(page = 1) {
    const data = await fetchAPI(`/complete-anime?page=${page + 2}`);
    return (data.animeList || []).map(mapAnimeItem);
  },

  async getGenre(genre, page = 1) {
    const data = await fetchAPI(`/genre/${genre}?page=${page}`);
    return (data.animeList || []).map(mapAnimeItem);
  },

  async getSchedule() {
    const data = await fetchAPI(`/schedule`);
    // Sanka API returns an array directly: [{day, anime_list}, ...]
    const days = [];
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.day && item.anime_list && item.anime_list.length > 0) {
          days.push({
            day: item.day,
            animes: item.anime_list.map(a => ({
              id: a.slug || a.animeId,
              title: a.title
            }))
          });
        }
      });
    }
    return days;
  },

  async getInfo(id) {
    const data = await fetchAPI(`/anime/${id}`);
    
    // Parse episodes
    const episodes = [];
    if (data.episodeList && Array.isArray(data.episodeList)) {
      data.episodeList.forEach((ep, i) => {
        episodes.push({
          id: ep.episodeId,
          title: ep.title,
          episodeNumber: ep.eps || (data.episodeList.length - i),
          releaseDate: ep.date || ""
        });
      });
      // Sanka returns episodes in descending order (latest first) usually, but we want it ascending (1 to N)
      episodes.reverse();
      // Re-assign numbers just to be safe
      episodes.forEach((ep, i) => { ep.episodeNumber = i + 1; });
    }

    // Parse synopsis (can be array or string)
    let synopsis = "";
    if (Array.isArray(data.synopsis)) {
      synopsis = data.synopsis.join("\\n\\n");
    } else if (typeof data.synopsis === "string") {
      synopsis = data.synopsis;
    }

    // Parse genres
    const genres = [];
    if (data.genreList && Array.isArray(data.genreList)) {
      data.genreList.forEach(g => genres.push(g.title || g.name));
    }

    return {
      id: id,
      title: data.title,
      image: data.poster || "",
      cover: data.poster || "",
      synopsis: synopsis || "Tidak ada sinopsis.",
      genres: genres,
      totalEpisodes: episodes.length,
      episodes: episodes
    };
  },

  async getStream(id) {
    const data = await fetchAPI(`/episode/${id}`);
    
    return {
      iframeSrc: data.defaultStreamingUrl || "",
      streamUrl: null
    };
  }
};

export default OtakudesuProvider;
