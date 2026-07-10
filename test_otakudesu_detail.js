import * as cheerio from 'cheerio';

async function testScrapeDetail() {
  try {
    console.log("Fetching detail...");
    const res = await fetch("https://otakudesu.blog/anime/super-yani-suu-futari-sub-indo/");
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const title = $(".fotoanime .infozingle p").first().text().replace("Judul: ", "");
    console.log("Title:", title);
    
    const cover = $(".fotoanime img").attr("src");
    console.log("Cover:", cover);
    
    const episodes = [];
    $(".episodelist ul li").each((i, el) => {
      const a = $(el).find("a");
      const epTitle = a.text();
      const link = a.attr("href");
      if (link && epTitle) {
        episodes.push({ title: epTitle, link });
      }
    });
    console.log("Episodes found:", episodes.length);
    if (episodes.length > 0) {
      console.log("First ep:", episodes[episodes.length - 1]);
    }
  } catch (e) {
    console.error(e);
  }
}

testScrapeDetail();
