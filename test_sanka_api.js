import fs from 'fs';
import * as cheerio from 'cheerio';

async function testSankaAPI() {
  try {
    const res = await fetch("https://www.sankavollerei.web.id/anime/");
    const html = await res.text();
    
    // We will dump it into utf8 sanka.html
    fs.writeFileSync("sanka-docs.html", html, "utf8");
    console.log("Saved sanka-docs.html");
    
    const $ = cheerio.load(html);
    const apiTexts = [];
    $("body").find("*").each((i, el) => {
      const t = $(el).text();
      if (t.includes("api/otakudesu") || t.includes("otakudesu")) {
         if (t.length < 200) apiTexts.push(t);
      }
    });
    console.log("Found matches:", apiTexts.slice(0, 10));
  } catch(e) {
    console.error(e);
  }
}
testSankaAPI();
