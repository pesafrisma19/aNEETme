const cheerio = require('cheerio');
async function testSearchForm() {
  const res = await fetch("https://lk21.de/", { 
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log("Search forms:");
  $('form').each((i, el) => {
    console.log("Action:", $(el).attr('action'));
    console.log("Method:", $(el).attr('method'));
    $(el).find('input').each((j, inp) => {
      console.log(" Input:", $(inp).attr('name'));
    });
  });
}
testSearchForm();
