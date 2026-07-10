import * as cheerio from "cheerio";

async function checkGenres() {
  const url = "https://anichin.watch/donghua/?status=&type=&order=update";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const genres = [];
  // look for ul.genre or something in the filter
  $(".filter .filter_type").each((i, block) => {
     const filterName = $(block).find(".h3").text().trim();
     if (filterName.toLowerCase().includes("genre")) {
         $(block).find("ul li label").each((j, el) => {
            const name = $(el).text().trim();
            const val = $(el).find("input").val();
            if (name && val) genres.push({ name, slug: val });
         });
     }
  });
  // fallback if filter_type not used
  if (genres.length === 0) {
      $("ul.taxanime li").each((i, el) => {
         const name = $(el).find("a").text().trim();
         const href = $(el).find("a").attr("href");
         if (name && href && href.includes("/genre/")) {
            genres.push({ name, slug: href.split("/genre/")[1].replace(/\//g, "") });
         }
      });
  }
  console.log("Genres:", genres.slice(0, 10));
}
checkGenres();
