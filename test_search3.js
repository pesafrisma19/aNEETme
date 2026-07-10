const cheerio = require('cheerio');
async function testSearchTheCrown() {
  const url = "https://lk21.de/search?s=the+crown";
  console.log("Fetching", url);
  try {
    const res = await fetch(url, { 
      headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    const $ = cheerio.load(html);

    const results = [];
    $('article').each((i, el) => {
      const title = $(el).find('.poster-title').text().trim() || $(el).find('h2, h3').text().trim();
      if(title) results.push(title);
    });
    console.log("Articles found:", results.length);
    if(results.length > 0) {
      console.log("Titles:", results.slice(0, 5));
    } else {
      console.log("HTML Start:", html.substring(0, 500));
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
testSearchTheCrown();
