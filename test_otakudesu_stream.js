import * as cheerio from 'cheerio';

async function testScrapeStream() {
  try {
    console.log("Fetching stream...");
    const res = await fetch("https://otakudesu.blog/episode/suysf-episode-1-sub-indo/");
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Look for iframes
    const iframes = $("iframe");
    console.log("Iframes found:", iframes.length);
    if (iframes.length > 0) {
      console.log("Iframe src:", iframes.first().attr("src"));
    }
    
    // Sometimes otakudesu uses a script tag with base64 for the iframe
    const scripts = $("script");
    scripts.each((i, el) => {
      const src = $(el).html();
      if (src && src.includes("iframe")) {
        console.log("Found iframe in script:", src.substring(0, 100));
      }
    });

    // Otakudesu often has a specific player div
    const playerArea = $(".player-area");
    console.log("Player area html:", playerArea.html()?.substring(0, 100));
    const responsive = $(".responsive-embed-stream");
    console.log("Responsive html:", responsive.html()?.substring(0, 100));

  } catch (e) {
    console.error(e);
  }
}

testScrapeStream();
