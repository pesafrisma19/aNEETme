import fs from 'fs';
import * as cheerio from 'cheerio';

async function parseSanka() {
  const html = fs.readFileSync("sanka-docs.html", "utf8");
  const $ = cheerio.load(html);
  
  const otakudesuEndpoints = [];
  $("div, section").each((i, el) => {
    const text = $(el).text();
    if (text.includes("otakudesu")) {
       // Look for endpoints
       $(el).find(".url, .endpoint, code, pre").each((j, code) => {
         const codeText = $(code).text().trim();
         if (codeText.includes("/api/") || codeText.includes("otakudesu")) {
           otakudesuEndpoints.push(codeText);
         }
       });
    }
  });
  
  // Try regex on raw html
  const matches = html.match(/\/api\/otakudesu[^"'\s<]+/g) || [];
  const unique = [...new Set(matches)];
  
  console.log("Regex matches:", unique.join("\n"));
}
parseSanka();
