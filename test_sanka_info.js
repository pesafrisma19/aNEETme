async function getInfo() {
  const res = await fetch("https://www.sankavollerei.web.id/anime/anime/super-yani-suu-futari-sub-indo");
  const json = await res.json();
  console.log("Episodes:", json.data.episode_list);
  console.log("Genres:", json.data.genres);
  console.log("Synopsis snippet:", json.data.synopsis.substring(0, 100));
}
getInfo();
