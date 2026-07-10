const fs = require("fs");

async function testScrape() {
  const url = "https://tv4.nontondrama.my/latest";
  console.log("Fetching: " + url);
  const res = await fetch(url);
  const html = await res.text();
  fs.writeFileSync("temp.html", html);
  console.log("Saved to temp.html");
}

testScrape();
