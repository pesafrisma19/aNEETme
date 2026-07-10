import fs from 'fs';
const html = fs.readFileSync("sanka-docs.html", "utf8");
console.log("Length:", html.length);
console.log("Has otakudesu:", html.includes("otakudesu"));
const idx = html.indexOf("otakudesu");
console.log(html.substring(Math.max(0, idx - 100), idx + 200));
