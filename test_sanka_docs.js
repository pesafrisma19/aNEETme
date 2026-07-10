import * as cheerio from 'cheerio';

async function testSankaDocs() {
  try {
    const res = await fetch("https://www.sankavollerei.web.id/anime/");
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Find all links or code blocks to see endpoints
    const endpoints = [];
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text();
      if (href && (href.includes("/api") || href.includes("otakudesu"))) {
        endpoints.push(`${text}: ${href}`);
      }
    });
    
    $("code").each((i, el) => {
      endpoints.push("CODE: " + $(el).text());
    });
    
    console.log("Endpoints found:\n", endpoints.join("\n"));
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}

testSankaDocs();
