const cheerio = require('cheerio');
async function testScrapeLK21() {
  const url = "https://lk21.de/latest";
  console.log("Fetching", url);
  try {
    const res = await fetch(url, { 
      headers: { 
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    const $ = cheerio.load(html);

    const results = [];
    $('article[itemtype="https://schema.org/Movie"]').each((i, el) => {
      const title = $(el).find('.poster-title').text().trim();
      results.push(title);
    });
    console.log("Total articles found:", results.length);
    if (results.length > 0) {
      console.log("First 3 titles:", results.slice(0, 3));
    } else {
      console.log("No articles found! HTML snapshot (first 500 chars):", html.substring(0, 500));
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
testScrapeLK21();
