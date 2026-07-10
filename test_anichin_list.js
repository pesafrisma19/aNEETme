import * as cheerio from "cheerio";

async function testAnichinDonghuaList() {
  const url = "https://anichin.watch/donghua/?status=&type=&order=update";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const items = [];
  $(".listupd .bs").each((i, el) => {
     const title = $(el).find(".tt h2, .tt").text().trim();
     let href = $(el).find("a").attr("href");
     const img = $(el).find("img").attr("src");
     const eps = $(el).find(".epx").text().trim();
     if (title && href) {
        // clean href to get id
        // href is like https://anichin.watch/donghua/the-great-ruler-3d/
        const id = href.replace("https://anichin.watch/donghua/", "").replace(/\/$/, "");
        items.push({ id, title, img, eps });
     }
  });
  console.log("Donghua updates:", items.slice(0, 3));
  
  // Also let's check genres
  const genres = [];
  $(".filter.dropdown ul li label").each((i, el) => {
     const name = $(el).text().trim();
     const input = $(el).find("input").val();
     if (name && input) {
        genres.push({ name, slug: input });
     }
  });
  console.log("Genres:", genres.slice(0, 5));
}
testAnichinDonghuaList();
