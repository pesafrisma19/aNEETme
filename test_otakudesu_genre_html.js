import * as cheerio from 'cheerio';

async function testGenreHTML() {
  try {
    const res = await fetch("https://otakudesu.blog/genres/action/");
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log($(".col-anime").first().html());
    
  } catch (e) {
    console.error(e);
  }
}

testGenreHTML();
