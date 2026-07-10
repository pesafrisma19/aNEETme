const cheerio = require('cheerio');
const html = require('fs').readFileSync('search2.html', 'utf8');
const $ = cheerio.load(html);
console.log('Articles:', $('article').length);
console.log('Script search.js:', $('script[src*="search.js"]').length);
