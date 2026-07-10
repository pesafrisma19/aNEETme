async function getInfoRaw() {
  const res = await fetch("https://www.sankavollerei.web.id/anime/anime/super-yani-suu-futari-sub-indo");
  const json = await res.json();
  console.log("Keys:", Object.keys(json.data));
  console.log("Episodes:", json.data.episodeLists || json.data.episodeList || json.data.episodesList);
  console.log("Genres:", json.data.genreList || json.data.genres);
}
getInfoRaw();
