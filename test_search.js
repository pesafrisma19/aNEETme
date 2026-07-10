const cheerio = require('cheerio');
async function testSearch() {
  const url = "https://lk21.de/search/iron";
  console.log("Fetching", url);
  try {
    const res = await fetch(url, { 
      headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    const $ = cheerio.load(html);

    const results = [];
    $('article[itemtype="https://schema.org/Movie"]').each((i, el) => {
      const title = $(el).find('.poster-title').text().trim() || $(el).find('h2, h3').text().trim();
      results.push(title);
    });
    console.log("Articles found:", results.length);
    if(results.length === 0) {
      console.log("HTML Start:", html.substring(0, 500));
      // Let's see if there are any articles at all
      console.log("Total <article> tags:", $('article').length);
      console.log("Classes of articles:", $('article').attr('class'));
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
testSearch();
