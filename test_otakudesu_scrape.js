import * as cheerio from 'cheerio';

async function testScrape() {
  try {
    const res = await fetch("https://otakudesu.blog");
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log("Title:", $("title").text());
    
    // Check for standard otakudesu elements
    const venz = $(".venz ul li").length;
    console.log("Recent items found (.venz ul li):", venz);
    
    const episodes = $(".epz").length;
    console.log("Episodes items found (.epz):", episodes);
    
    // Let's get the first recent item
    const firstItem = $(".venz ul li").first();
    const title = firstItem.find(".jdlflm").text();
    const link = firstItem.find("a").attr("href");
    console.log("First item:", title, "->", link);
  } catch (e) {
    console.error(e);
  }
}

testScrape();
