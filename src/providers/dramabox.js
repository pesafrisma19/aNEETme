// src/providers/dramabox.js

const DRAMABOX_BASE = "https://www.dramaboxapp.com";

// Mendapatkan Next.js buildId yang aktif agar bisa mengakses _next/data
async function getBuildId() {
  const res = await fetch(`${DRAMABOX_BASE}/in`);
  const html = await res.text();
  const match = html.match(/"buildId":"([^"]+)"/);
  if (match && match[1]) {
    return match[1];
  }
  return "dramaboxapp_prod_20260703"; // fallback
}

// Fetch helper untuk Next.js Data API
async function fetchNextData(path) {
  const buildId = await getBuildId();
  const url = `${DRAMABOX_BASE}/_next/data/${buildId}/${path}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "x-nextjs-data": "1"
    }
  });
  if (!res.ok) throw new Error("Gagal mengambil data dari DramaBox: " + url);
  return await res.json();
}

const DramaboxProvider = {
  id: 'dramabox',
  name: 'DramaBox',
  desc: 'Platform streaming drama pendek',
  logo: 'https://play-lh.googleusercontent.com/97y_D0Vv5Xj81B80s3d4t6y3iXl3H47b-1-aV8xGvX8Y38KxVv86G1K43yP7b0zH',

  capabilities: {
    hasMovies: true,
    hasRecommendations: true,
    hasRecent: true,
    hasSearch: true,
    hasSchedule: false,
    recentLabel: "Wajib Ditonton",
    moviesLabel: "Sedang Tren",
    recommendationsLabel: "Serial Menarik",
    genres: [
      { name: "Cinta Pahit", slug: "449" },
      { name: "Realitas", slug: "467" },
      { name: "Nikah Dulu Cinta Belakangan", slug: "456" },
      { name: "Kawin Kontrak", slug: "454" },
      { name: "Naga", slug: "442" },
      { name: "Orang Kuat", slug: "470" },
      { name: "Salah Paham", slug: "466" },
      { name: "CEO Wanita", slug: "464" },
      { name: "Kelahiran Kembali", slug: "450" },
      { name: "Reuni", slug: "459" },
      { name: "Manis", slug: "448" },
      { name: "Melawan Balik", slug: "462" },
      { name: "Cinta Sejati", slug: "469" },
      { name: "Dokter Dewa", slug: "430" },
      { name: "Urban", slug: "427" },
      { name: "Menantu Matrilineal", slug: "444" },
      { name: "Kekuatan Super", slug: "433" },
      { name: "Kebangkitan", slug: "429" },
      { name: "Identitas Rahasia", slug: "441" },
      { name: "Bayi", slug: "460" },
      { name: "Orang Kecil", slug: "435" },
      { name: "Misteri", slug: "434" },
      { name: "Ahli Turun Gunung", slug: "437" },
      { name: "Miliarder", slug: "440" },
      { name: "Pernikahan Kilat", slug: "457" },
      { name: "Wanita Tangguh", slug: "463" },
      { name: "Pengkhianatan", slug: "445" },
      { name: "Kebangkitan Warisan", slug: "436" },
      { name: "Cinta Segitiga", slug: "461" },
      { name: "Perjalanan Waktu", slug: "451" },
      { name: "Kekasih Kontrak", slug: "455" },
      { name: "Identitas Tersembunyi", slug: "453" },
      { name: "Keluarga", slug: "689" },
      { name: "Kembali Orang Kuat", slug: "438" },
      { name: "Identitas Tertukar", slug: "452" },
      { name: "Balas Dendam", slug: "458" },
      { name: "Romansa", slug: "447" }
    ]
  },

  async search(query, page = 1) {
    // Lakukan pencarian lokal dari daftar homepage (karena API search asli butuh AES/Login)
    try {
      const recentList = await this.getRecent(1);
      const lowerQuery = query.toLowerCase();
      return recentList.filter(item => item.title.toLowerCase().includes(lowerQuery));
    } catch (e) {
      return [];
    }
  },

  async getMoreDataList(endpoint, page) {
    if (page > 1) return []; // The more endpoints only have 1 page of 18 items
    
    try {
      const json = await fetchNextData(`in/more/${endpoint}.json?position=${endpoint}`);
      const list = json.pageProps?.moreData?.items || [];
      
      return list.map(item => ({
        id: item.bookId,
        title: item.bookName,
        image: item.cover,
        releaseDate: item.shelfTime ? item.shelfTime.split(" ")[0] : "",
        playCount: 0
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getRecent(page = 1) {
    return this.getMoreDataList("must-sees", page);
  },

  async getMovies(page = 1) {
    return this.getMoreDataList("trending", page);
  },

  async getRecommendations(page = 1) {
    return this.getMoreDataList("hidden-gems", page);
  },

  async getGenre(genreId, page = 1) {
    try {
      const json = await fetchNextData(`in/browse/${genreId}.json?typeTwoId=${genreId}`);
      const records = json.pageProps?.bookList || [];
      return records.map(item => ({
        id: item.bookId,
        title: item.bookName,
        image: item.cover,
        releaseDate: item.chapterCount ? `${item.chapterCount} Eps` : "",
        playCount: item.playCount || 0
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getInfo(id) {
    try {
      // Kita butuh 1 chapterId valid untuk membuka Next.js JSON-nya
      // Kita asumsikan chapter awal bisa kita dapatkan, tapi karena kita tidak tahu, 
      // kita butuh endpoint lain atau menggunakan chapter dummy yang me-redirect ke chapter 1.
      // Next.js _next/data/ membutuhkan chapterId. DramaBox biasanya punya struktur ini.
      // Untuk amannya, kita load web halamannya dulu untuk mengekstrak data JSON-nya secara langsung.

      const res = await fetch(`${DRAMABOX_BASE}/in/film/${id}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      const html = await res.text();

      // Ekstrak Next.js props dari halaman HTML
      const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
      if (!jsonMatch) throw new Error("Tidak menemukan data Next.js");

      const json = JSON.parse(jsonMatch[1]);
      const item = json.props?.pageProps?.bookInfo || {};
      const chapters = json.props?.pageProps?.chapterList || [];

      return {
        title: item.bookName || ("Detail Drama " + id),
        image: item.cover || "",
        synopsis: item.introduction || "",
        status: "Completed",
        releaseDate: item.shelfTime || "",
        genres: (item.tags || []),
        episodes: chapters.map(ch => ({
          id: `${id}/${ch.id}`,
          title: ch.name,
          episodeNumber: ch.indexStr,
          isPremium: !ch.unlock
        }))
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async getStream(id) {
    try {
      // ID dari aNEETme akan berbentuk "bookId/chapterId"
      const [bookId, chapterId] = id.split('/');

      const json = await fetchNextData(`in/episode/${bookId}/${chapterId}.json?bookId=${bookId}&chapterId=${chapterId}`);

      const chapters = json.pageProps?.chapterList || [];
      const currentCh = chapters.find(c => c.id === chapterId);

      if (!currentCh || !currentCh.unlock || !currentCh.m3u8Url) {
        throw new Error("Episode berbayar atau tidak ditemukan");
      }

      return {
        streamUrl: currentCh.m3u8Url,
        iframeSrc: null
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};

export default DramaboxProvider;
