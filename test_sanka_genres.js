async function getOtakuGenres() {
  const res = await fetch("https://www.sankavollerei.web.id/anime/genre");
  const json = await res.json();
  const list = json.data.genreList;
  console.log("Genres:", JSON.stringify(list.map(g => ({ name: g.title, slug: g.genreId }))));
}
getOtakuGenres();
