import * as cheerio from 'cheerio';

async function testGenre() {
  try {
    const res = await fetch("https://otakudesu.blog/genres/action/");
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Print all div classes to see what's there
    const classes = new Set();
    $("div").each((i, el) => {
      const cls = $(el).attr("class");
      if (cls) classes.add(cls);
    });
    console.log("Div classes found:", Array.from(classes).slice(0, 20));
    
    // Test the col-anime-con
    const colAnime = $(".col-anime-con").length || $(".col-anime").length || $(".col-anime-title").length;
    console.log("Col anime:", colAnime);
    
    // Try to find the title links
    const links = [];
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.includes("/anime/")) {
        links.push($(el).text());
      }
    });
    console.log("Anime links found:", links.slice(0, 5));
    
  } catch (e) {
    console.error(e);
  }
}

testGenre();
