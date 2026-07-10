import * as cheerio from "cheerio";

async function testAnichinEp() {
  const url = "https://anichin.watch/perfect-world-episode-277-subtitle-indonesia/";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const seriesLink = $(".ts-breadcrumb li").eq(1).find("a").attr("href") || 
                     $(".ts-breadcrumb li").eq(2).find("a").attr("href");
  
  const allLinks = [];
  $(".ts-breadcrumb a").each((i, el) => allLinks.push($(el).attr("href")));
                     
  console.log("Breadcrumb links:", allLinks);
  
  // Streaming iframe
  const iframeSrc = $(".player-area iframe").attr("src");
  console.log("Iframe:", iframeSrc);
  
  // What about searching?
  const searchUrl = "https://anichin.watch/?s=soul";
  const searchRes = await fetch(searchUrl);
  const searchHtml = await searchRes.text();
  const $search = cheerio.load(searchHtml);
  
  const searchItems = [];
  $search(".bs").each((i, el) => {
     const title = $search(el).find(".tt h2, .tt").text().trim();
     const href = $search(el).find("a").attr("href");
     if (title) searchItems.push({ title, href });
  });
  console.log("Search items:", searchItems.slice(0, 2));
}
testAnichinEp();
