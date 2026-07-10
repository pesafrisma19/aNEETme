import * as cheerio from "cheerio";

async function testAnichinDetails() {
  const url = "https://anichin.watch/donghua/the-great-ruler-3d/";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const title = $(".infox h1").text().trim();
  const image = $(".thumb img").attr("src");
  const synopsis = $(".entry-content").text().trim();
  
  const genres = [];
  $(".genxed a").each((i, el) => genres.push($(el).text().trim()));
  
  const episodes = [];
  $(".eplister ul li").each((i, el) => {
     const epTitle = $(el).find(".epl-num").text().trim() || $(el).find(".epl-title").text().trim();
     const epHref = $(el).find("a").attr("href");
     if (epHref) {
        episodes.push({
           id: epHref.replace("https://anichin.watch/", "").replace(/\/$/, ""),
           title: epTitle
        });
     }
  });
  
  console.log("Donghua:", title);
  console.log("Image:", image);
  console.log("Genres:", genres);
  console.log("Eps:", episodes.length, episodes[0]);
  
  // Episode page
  const epRes = await fetch("https://anichin.watch/" + episodes[0].id);
  const epHtml = await epRes.text();
  const $ep = cheerio.load(epHtml);
  
  console.log("Iframe:", $ep(".player-area iframe").attr("src"));
  console.log("Video select:", $ep("select.mirror").html());
  
  // What if the iframe is loaded via JS / ajax?
  const scriptContent = $ep("script").text();
  if (scriptContent.includes("player")) {
     console.log("Found player in script!");
  }
}
testAnichinDetails();
