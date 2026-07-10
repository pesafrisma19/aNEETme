import * as cheerio from 'cheerio';

async function testExtras() {
  try {
    // Test Complete Anime
    console.log("Fetching Complete Anime...");
    const resComp = await fetch("https://otakudesu.blog/complete-anime/");
    const htmlComp = await resComp.text();
    const $c = cheerio.load(htmlComp);
    console.log("Complete anime items found (.venz ul li):", $c(".venz ul li").length);

    // Test Schedule
    console.log("Fetching Schedule...");
    const resSched = await fetch("https://otakudesu.blog/jadwal-rilis/");
    const htmlSched = await resSched.text();
    const $s = cheerio.load(htmlSched);
    console.log("Schedule days found (.kgjdw):", $s(".kgjdw").length || $s(".kglist321").length);
    
    // Genre Test
    console.log("Fetching Action Genre...");
    const resGenre = await fetch("https://otakudesu.blog/genres/action/");
    const htmlGenre = await resGenre.text();
    const $g = cheerio.load(htmlGenre);
    console.log("Genre anime items found:", $g(".fotoanime").length || $g(".venz ul li").length);
    
  } catch (e) {
    console.error(e);
  }
}

testExtras();
