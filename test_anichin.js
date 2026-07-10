import * as cheerio from "cheerio";

async function testAnichin() {
  const url = "https://anichin.watch/";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const recent = [];
  $(".listupd .bs").each((i, el) => {
     const title = $(el).find(".tt h2, .tt").text().trim();
     const href = $(el).find("a").attr("href");
     const img = $(el).find("img").attr("src");
     const eps = $(el).find(".epx").text().trim();
     if (title && href) {
        recent.push({ title, href, img, eps });
     }
  });
  console.log("Recent items:", recent.slice(0, 3));
  
  // Try to find schedule
  const scheduleRes = await fetch("https://anichin.watch/schedule/");
  const scheduleHtml = await scheduleRes.text();
  const $s = cheerio.load(scheduleHtml);
  console.log("Schedule blocks found:", $s(".bixbox.sched").length);
}
testAnichin();
