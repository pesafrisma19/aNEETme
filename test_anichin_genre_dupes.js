import provider from "./src/providers/anichin.js";

const genres = provider.capabilities.genres;
const slugs = genres.map(g => g.slug);
const unique = new Set(slugs);
if (slugs.length !== unique.size) {
   console.log("Duplicate slugs found in Anichin genres!");
   const counts = {};
   slugs.forEach(s => counts[s] = (counts[s] || 0) + 1);
   for (let s in counts) if (counts[s] > 1) console.log(s, counts[s]);
} else {
   console.log("No duplicate slugs in Anichin genres.");
}
