const cheerio = require('cheerio');
async function testScrape() {
  const res = await fetch("https://tv4.nontondrama.my/latest", { headers: { "user-agent": "Mozilla/5.0" } });
  const html = await res.text();
  const $ = cheerio.load(html);

  const results = [];
  $('article').each((i, el) => {
    const title = $(el).find('.poster-title').text().trim() || $(el).find('h2, h3').text().trim();
    const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
    results.push({ title, image });
  });
  console.log("Total articles found:", results.length);
  console.log("First 3 items:", results.slice(0, 3));
}
testScrape();
