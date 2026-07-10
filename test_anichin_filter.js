import * as cheerio from "cheerio";

async function dumpFilter() {
  const url = "https://anichin.watch/donghua/?status=&type=&order=update";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log("Filter HTML:", $(".filter").html() || "No filter class found");
  
  // also check how pagination works
  console.log("Pagination:", $(".pagination").html() || "No pagination");
}
dumpFilter();
