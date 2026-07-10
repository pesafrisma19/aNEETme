import provider from "./src/providers/dramabox.js";

async function testProvider() {
  console.log("Genres loaded:", provider.capabilities.genres.length);
  const genreRes = await provider.getGenre("449", 1);
  console.log("Cinta Pahit books:", genreRes.length);
  if (genreRes.length > 0) {
    console.log("First item:", genreRes[0].title);
  }
}
testProvider();
