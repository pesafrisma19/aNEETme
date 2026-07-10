const cheerio = require('cheerio');
fetch('https://lk21.de/?s=the+crown', { headers: { 'user-agent': 'Mozilla/5.0' } })
  .then(r=>r.text())
  .then(html => { 
    const $ = cheerio.load(html); 
    console.log('Articles:', $('article').length); 
    console.log('H1:', $('h1').text()); 
  });
