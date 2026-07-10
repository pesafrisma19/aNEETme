import * as cheerio from "cheerio";

async function checkTitle() {
  const url = "https://anichin.watch/donghua/?status=&type=&order=update";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const items = [];
  $(".listupd .bs").each((i, el) => {
     const aTag = $(el).find("a");
     const titleAttr = aTag.attr("title");
     const textTitle = $(el).find(".tt").text().trim().replace(/\t|\n/g, '').split('  ')[0]; // ugly fallback
     
     items.push({ titleAttr, textTitle });
  });
  console.log(items.slice(0, 3));
}
checkTitle();
