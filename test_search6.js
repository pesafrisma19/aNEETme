const cheerio = require('cheerio');
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
fetch('https://tv.nontondrama.my/?s=iron').then(r=>r.text()).then(html => { 
  const $ = cheerio.load(html); 
  console.log('Articles:', $('article').length); 
  console.log('H1:', $('h1').text()); 
});
