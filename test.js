const cheerio = require('cheerio');

async function scrapeLK21List(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log("HTML length:", html.length);

    const results = [];
    $('article').each((i, el) => {
      const $el = $(el);
      const link = $el.find('figure > a').attr('href') || $el.find('a').attr('href');
      const title = $el.find('.poster-title').text().trim() || $el.find('h2, h3').text().trim();
      const image = $el.find('img').attr('src');
      console.log(`Found item: ${title} - ${link}`);
      results.push(title);
    });
    console.log("Total articles found:", results.length);
  } catch (error) {
    console.error("Error:", error);
  }
}

scrapeLK21List("https://tv4.nontondrama.my/latest");
scrapeLK21List("https://d21.team/latest");
