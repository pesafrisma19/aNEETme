const cheerio = require('cheerio');
async function testScrape() {
  const res = await fetch("https://d21.team/", { headers: { "user-agent": "Mozilla/5.0" } });
  const html = await res.text();
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    console.log($(el).text().trim(), $(el).attr('href'));
  });
}
testScrape();
