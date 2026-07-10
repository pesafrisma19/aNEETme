// src/providers/dramabox.js

const DRAMABOX_HEADERS = {
  "Accept-Encoding": "gzip",
  "Connection": "Keep-Alive",
  "Content-Type": "application/json; charset=UTF-8",
  "language": "en",
  "User-Agent": "okhttp/4.12.0",
  "tn": "Bearer ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnlaV2RwYzNSbGNsUjVjR1VpT2lKUVJWSk5RVTVGVGxRaUxDSjFjMlZ5U1dRaU9qVXdNRFV6TURVNU0zMC5hZHVESHhxUkF2V1hOSzl1dlotUDRwWmMwaDF2dDJaZnJMN0ZsOXROU3VN",
  "st": "cK4n10B_0tTQBrxFMMb12Lvt",
  "userId": "500530593",
  "cid": "DRA1000042",
  "nchid": "DRA1000042",
  "version": "631",
  "vn": "6.3.1",
  "country-code": "ID",
  "current-language": "en"
};

const BASE_URL = "https://sapi.dramaboxvideo.com/drama-box/he001";

const DramaboxProvider = {
  id: 'dramabox',
  name: 'DramaBox',
  desc: 'Platform streaming drama pendek',
  logo: 'https://play-lh.googleusercontent.com/97y_D0Vv5Xj81B80s3d4t6y3iXl3H47b-1-aV8xGvX8Y38KxVv86G1K43yP7b0zH', // Ganti dengan logo yang sesuai
  
  capabilities: {
    hasMovies: false,
    hasRecommendations: true,
    hasRecent: true,
    hasSearch: false, // Tambahkan jika ada endpoint search
    hasSchedule: false,
    genres: []
  },

  async getRecent(page = 1) {
    const url = `${BASE_URL}/theater?timestamp=${Date.now()}`;
    const payload = {
      homePageStyle: 0,
      isNeedRank: 1,
      index: page - 1,
      type: 1,
      channelId: 0
    };

    const res = await fetch(url, { 
      method: "POST",
      headers: DRAMABOX_HEADERS,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal memuat data theater dari DramaBox");
    const json = await res.json();
    
    // Theater response could be in newTheaterList or recommendList based on your example
    let records = [];
    if (json.data?.newTheaterList?.records && json.data.newTheaterList.records.length > 0) {
      records = json.data.newTheaterList.records;
    } else if (json.data?.recommendList?.records) {
      records = json.data.recommendList.records;
    }

    return records.map(item => ({
      id: item.bookId,
      title: item.bookName,
      image: item.coverWap || item.cover,
      releaseDate: item.chapterCount ? `${item.chapterCount} Eps` : "",
      playCount: item.playCount
    }));
  },

  async getRecommendations(page = 1) {
    const url = `${BASE_URL}/recommendBook?timestamp=${Date.now()}`;
    // Memperkirakan payload berdasarkan pagination standar
    const payload = {
      current: page,
      size: 10
    };

    const res = await fetch(url, { 
      method: "POST",
      headers: DRAMABOX_HEADERS,
      body: JSON.stringify(payload) // Jika error, mungkin payload ini perlu disesuaikan dengan 129 bytes payload asli
    });

    if (!res.ok) throw new Error("Gagal memuat data rekomendasi dari DramaBox");
    const json = await res.json();
    
    const records = json.data?.recommendList?.records || [];

    return records.map(item => ({
      id: item.bookId,
      title: item.bookName,
      image: item.coverWap || item.cover,
      releaseDate: item.chapterCount ? `${item.chapterCount} Eps` : "",
      playCount: item.playCount
    }));
  },

  async getInfo(id) {
    // Karena belum ada endpoint detail dari user, kita mock atau biarkan throw error dulu,
    // atau gunakan recommendBook dan search di hasil (tidak disarankan).
    // Biasanya ada endpoint /bookDetail
    const url = `${BASE_URL}/bookDetail?timestamp=${Date.now()}`;
    const payload = { bookId: id };

    const res = await fetch(url, {
      method: "POST",
      headers: DRAMABOX_HEADERS,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Gagal memuat detail drama dari DramaBox");
    const json = await res.json();
    
    const item = json.data?.bookInfo || {};

    // Mock response for now if endpoint is incorrect
    if (!item.bookId) {
      return {
        title: "Detail Drama " + id,
        image: "",
        synopsis: "Endpoint info/detail belum ditambahkan sepenuhnya.",
        status: "Completed",
        releaseDate: "",
        genres: [],
        episodes: []
      };
    }

    return {
      title: item.bookName,
      image: item.coverWap,
      synopsis: item.introduction,
      status: item.status === 1 ? "Ongoing" : "Completed",
      releaseDate: item.shelfTime,
      genres: (item.tags || []),
      episodes: [] // Memerlukan endpoint /chapterList
    };
  }
};

export default DramaboxProvider;
