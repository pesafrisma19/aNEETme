const cheerio = require('cheerio');
const html = require('fs').readFileSync('search.html', 'utf8');
const $ = cheerio.load(html);
console.log('H1:', $('h1').text());
console.log('Search item:', $('.search-item').length);
console.log('Movies:', $('.movie').length);
console.log('Articles:', $('article').length);
console.log('Grid items:', $('.grid-item, .item').length);
